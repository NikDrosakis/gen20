package api

import (
    "bytes"
    "context"
    "os"
    "os/exec"
    "time"
"path/filepath"
    "github.com/gin-gonic/gin"
)

const addScript = "/var/www/gs/cli/com/domain/add.sh"

type createDomainReq struct {
    Domain string `json:"domain"`
    Type   string `json:"type"`
}

func createDomain(c *gin.Context) {
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

    // Validation ανά τύπο
    switch req.Type {
    case "public", "internal", "tor":
        // ok
    default:
        fail(c, 400, "invalid type: must be public, internal or tor")
        return
    }

    if _, err := os.Stat(addScript); err != nil {
        fail(c, 500, "add.sh not found: "+addScript)
        return
    }

    // Το add.sh περιμένει: --type X domain
    args := []string{"--type", req.Type, req.Domain}

    ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Minute)
    defer cancel()

    cmd := exec.CommandContext(ctx, "/bin/bash", addScript)
    cmd.Args = append(cmd.Args, args...)
    cmd.Dir = "/var/www/gs/cli/com/domain"
    cmd.Env = append(os.Environ(),
        "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.nvm/versions/node/v22.12.0/bin",
        "HOME=/root",
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
            fail(c, 500, "exec failed: "+err.Error())
            return
        }
    }

// ✅ Fix ownership του νέου domain
    domainPath := filepath.Join("/var/www/gs/public", req.Domain)
    if _, err := os.Stat(domainPath); err == nil {
        fixOwnershipDir(domainPath)
    }
    // Το add.sh γράφει logs + JSON στο τέλος.
    // Παίρνουμε μόνο το τελευταίο {...} block.
    resultJSON := extractLastJSON(stdout.String())

    if resultJSON == nil {
        // Δεν βρήκαμε JSON — επέστρεψε raw output για debugging
        c.JSON(200, gin.H{
            "success":   exitCode == 0,
            "exit_code": exitCode,
            "stdout":    stdout.String(),
            "stderr":    stderr.String(),
            "error":     "no JSON in output",
        })
        return
    }

    // Επέστρεψε το JSON του add.sh αυτούσιο
    c.Data(200, "application/json", resultJSON)
}

// extractLastJSON βρίσκει το τελευταίο {...} block στο output.
func extractLastJSON(s string) []byte {
    end := -1
    depth := 0
    for i := len(s) - 1; i >= 0; i-- {
        if s[i] == '}' {
            if depth == 0 {
                end = i
            }
            depth++
        } else if s[i] == '{' {
            depth--
            if depth == 0 && end != -1 {
                return []byte(s[i : end+1])
            }
        }
    }
    return nil
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