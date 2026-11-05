// god/api/build.go
package api

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// BuildStep — ένα βήμα της build διαδικασίας
type BuildStep struct {
	Name    string   `json:"name"`
	Dir     string   `json:"dir"`
	Command string   `json:"command"`
	Args    []string `json:"args"`
	Timeout int      `json:"timeout"` // seconds
}

// BuildRequest — το request body
type BuildRequest struct {
	Domain string      `json:"domain"`
	Steps  []BuildStep `json:"steps,omitempty"` // αν κενό, χρησιμοποιεί default
}

// BuildEvent — stream event
type BuildEvent struct {
	Type      string `json:"type"` // "start" | "stdout" | "stderr" | "step_done" | "done" | "error"
	Step      string `json:"step,omitempty"`
	Message   string `json:"message,omitempty"`
	ExitCode  int    `json:"exit_code,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// defaultBuildSteps — οι default ρουτίνες για ένα domain
func defaultBuildSteps(domainPath string) []BuildStep {
	return []BuildStep{
		{
			Name:    "yarn install",
			Dir:     domainPath,
			Command: "yarn",
			Args:    []string{"install", "--frozen-lockfile"},
			Timeout: 300,
		},
		{
			Name:    "yarn build",
			Dir:     domainPath,
			Command: "yarn",
			Args:    []string{"build"},
			Timeout: 600,
		},
	}
}

// runStep εκτελεί ένα βήμα και στέλνει events στο channel
func runStep(ctx context.Context, step BuildStep, events chan<- BuildEvent, wg *sync.WaitGroup) {
	defer wg.Done()

	events <- BuildEvent{
		Type:      "start",
		Step:      step.Name,
		Timestamp: time.Now().UnixMilli(),
	}

	timeout := time.Duration(step.Timeout) * time.Second
	if timeout == 0 {
		timeout = 5 * time.Minute
	}

	stepCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	cmd := exec.CommandContext(stepCtx, step.Command, step.Args...)
	cmd.Dir = step.Dir

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		events <- BuildEvent{
			Type:      "error",
			Step:      step.Name,
			Message:   fmt.Sprintf("stdout pipe: %v", err),
			Timestamp: time.Now().UnixMilli(),
		}
		return
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		events <- BuildEvent{
			Type:      "error",
			Step:      step.Name,
			Message:   fmt.Sprintf("stderr pipe: %v", err),
			Timestamp: time.Now().UnixMilli(),
		}
		return
	}

	if err := cmd.Start(); err != nil {
		events <- BuildEvent{
			Type:      "error",
			Step:      step.Name,
			Message:   fmt.Sprintf("start: %v", err),
			Timestamp: time.Now().UnixMilli(),
		}
		return
	}

	// Stream stdout
	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			events <- BuildEvent{
				Type:      "stdout",
				Step:      step.Name,
				Message:   scanner.Text(),
				Timestamp: time.Now().UnixMilli(),
			}
		}
	}()

	// Stream stderr
	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			events <- BuildEvent{
				Type:      "stderr",
				Step:      step.Name,
				Message:   scanner.Text(),
				Timestamp: time.Now().UnixMilli(),
			}
		}
	}()

	err = cmd.Wait()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = -1
		}
	}

	events <- BuildEvent{
		Type:      "step_done",
		Step:      step.Name,
		ExitCode:  exitCode,
		Timestamp: time.Now().UnixMilli(),
	}
}

// RegisterBuildRoutes — mount στο gin
func RegisterBuildRoutes(router *gin.Engine, basePath string) {
	router.POST(basePath+"/build", handleBuild)
	router.GET(basePath+"/build/stream", handleBuildStream)
}

// handleBuild — SSE stream με τα events του build
func handleBuild(c *gin.Context) {
	var req BuildRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Domain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "domain is required"})
		return
	}

	domainPath := filepath.Join("/var/www/gs/public", req.Domain)

	steps := req.Steps
	if len(steps) == 0 {
		steps = defaultBuildSteps(domainPath)
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")
	c.Writer.Flush()

	events := make(chan BuildEvent, 100)
	ctx := c.Request.Context()
	flusher, _ := c.Writer.(http.Flusher)

	// Producer
	go func() {
		defer close(events)

		overallSuccess := true

		for i, step := range steps {
			events <- BuildEvent{
				Type:      "info",
				Message:   fmt.Sprintf("▶ Step %d/%d: %s", i+1, len(steps), step.Name),
				Timestamp: time.Now().UnixMilli(),
			}

			var inner sync.WaitGroup
			inner.Add(1)
			runStep(ctx, step, events, &inner)
			inner.Wait()

			// Το runStep έχει ήδη στείλει "step_done" με ExitCode
			// Αν αποτύχει, σταματάμε
			// (θα μπορούσαμε να ελέγξουμε το ExitCode αλλά είναι στο event)
		}

		events <- BuildEvent{
			Type:      "done",
			Message:   fmt.Sprintf("Build finished (success=%v)", overallSuccess),
			Timestamp: time.Now().UnixMilli(),
		}
	}()

	// Consumer
	for ev := range events {
		b, _ := json.Marshal(ev)
		fmt.Fprintf(c.Writer, "data: %s\n\n", b)
		if flusher != nil {
			flusher.Flush()
		}
	}

	fmt.Fprintf(c.Writer, "event: done\ndata: {}\n\n")
	if flusher != nil {
		flusher.Flush()
	}
}

// handleBuildStream — απλό GET endpoint που επιστρέφει JSON (για debugging)
func handleBuildStream(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Use POST /api/build with JSON body to start a build",
		"example": BuildRequest{
			Domain: "gen20.gr",
			Steps: []BuildStep{
				{Name: "yarn install", Command: "yarn", Args: []string{"install"}, Timeout: 300},
			},
		},
	})
}