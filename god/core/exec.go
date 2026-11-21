package core

import (
    "bytes"
    "context"
    "os"
    "os/exec"
    "time"

    "github.com/gin-gonic/gin"
)

type createDomainReq struct {
    Domain string `json:"domain"`
    Type   string `json:"type"`
}

// createDomain δημιουργεί νέο domain μέσω της SOL αρχιτεκτονικής:
// god → SolBridge (websocket) → sol/gen-daemon → gen.sh moon <…>.
func (h *Hub) createDomain(c *gin.Context) {
    var req createDomainReq
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if req.Domain == "" {
        fail(c, 400, "domain required")
        return
    }
    if req.Type == "" {
        req.Type = "public"
    }

    // Αντιστοίχιση τύπου → SOL action.
    action := ""
    arg := req.Domain
    switch req.Type {
    case "public":
        action = "domain"
    case "internal":
        action = "internal"
    case "tor":
        action = "tor"
    default:
        fail(c, 400, "invalid type: must be public, internal or tor")
        return
    }

    if h == nil || h.Sol == nil {
        fail(c, 503, "sol bridge unavailable")
        return
    }

    ctx, cancel := context.WithTimeout(c.Request.Context(), solActions[action])
    defer cancel()

    res, err := h.Sol.Run(ctx, action, arg)
    if err != nil {
        fail(c, 503, err.Error())
        return
    }

    // Για tor, ο moon tor παράγει ο ίδιος το πραγματικό .onion
    // και το επιστρέφει ως msg. Για public/internal, το ζητούμενο
    // domain είναι και το πραγματικό.
    actual := req.Domain
    if req.Type == "tor" && res.Status == "ok" {
        actual = res.Msg
    }

    if res.Status != "ok" {
        c.JSON(200, gin.H{
            "success": false,
            "domain":  req.Domain,
            "type":    req.Type,
            "error":   res.Msg,
            "code":    res.Code,
        })
        return
    }

    c.JSON(200, gin.H{
        "success":       true,
        "domain":        req.Domain,
        "actual_domain": actual,
        "type":          req.Type,
        "message":       res.Msg,
    })
}

var allowlist = map[string]bool{
    "yarn build":                     true,
    "yarn install":                   true,
    "yarn install --frozen-lockfile": true,
    "composer install":               true,
    "git status":                     true,
    "php -v":                         true,
}

type execReq struct {
    Command string `json:"command"`
    Cwd     string `json:"cwd"`
    Timeout int    `json:"timeout"`
}

func execCommand(c *gin.Context) {
    var req execReq
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if !allowlist[req.Command] {
        fail(c, 403, "command not allowed")
        return
    }

    timeout := req.Timeout
    if timeout <= 0 {
        timeout = 120
    }
    ctx, cancel := context.WithTimeout(c.Request.Context(), time.Duration(timeout)*time.Second)
    defer cancel()

    cmd := exec.CommandContext(ctx, "/bin/bash", "-lc", req.Command)
    if req.Cwd != "" {
        cmd.Dir = req.Cwd
    }
    cmd.Env = append(os.Environ(),
        "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    )

    var stdout, stderr bytes.Buffer
    cmd.Stdout = &stdout
    cmd.Stderr = &stderr

    err := cmd.Run()
    exitCode := 0
    if err != nil {
        if ee, ok := err.(*exec.ExitError); ok {
            exitCode = ee.ExitCode()
        } else {
            fail(c, 500, err.Error())
            return
        }
    }

    ok(c, gin.H{
        "stdout":    stdout.String(),
        "stderr":    stderr.String(),
        "exit_code": exitCode,
    })
}