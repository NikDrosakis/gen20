package api

import (
    "crypto/x509"
    "encoding/pem"
    "log"
    "os"
    "os/exec"
    "path/filepath"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
)

type sslActionReq struct {
    Action string `json:"action"` // renew | delete | issue
    Domain string `json:"domain"`
}

type sslInfo struct {
    Domain    string `json:"domain"`
    Exists    bool   `json:"exists"`
    Expires   string `json:"expires,omitempty"`
    DaysValid int    `json:"days_valid,omitempty"`
    Issuer    string `json:"issuer,omitempty"`
    Error     string `json:"error,omitempty"`
}

func sslAction(c *gin.Context) {
    var req sslActionReq
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if !domainRe.MatchString(req.Domain) {
        fail(c, 400, "invalid domain")
        return
    }

    var cmd *exec.Cmd
    switch req.Action {
    case "renew":
        cmd = exec.Command("certbot", "renew", "--cert-name", req.Domain, "--force-renewal", "--non-interactive")
    case "delete":
        cmd = exec.Command("certbot", "delete", "--cert-name", req.Domain, "--non-interactive")
    case "issue":
        cmd = exec.Command("certbot", "--nginx", "-d", req.Domain, "--non-interactive", "--agree-tos")
    default:
        fail(c, 400, "invalid action")
        return
    }

    out, err := cmd.CombinedOutput()

    // Fallback για delete — αν το certbot αποτύχει, διάγραψε χειροκίνητα
    if err != nil && req.Action == "delete" {
        log.Printf("certbot delete failed for %s: %s", req.Domain, string(out))

        paths := []string{
            filepath.Join("/etc/letsencrypt/live", req.Domain),
            filepath.Join("/etc/letsencrypt/archive", req.Domain),
            filepath.Join("/etc/letsencrypt/renewal", req.Domain+".conf"),
        }

        removed := []string{}
        for _, p := range paths {
            if _, statErr := os.Stat(p); statErr == nil {
                if rmErr := os.RemoveAll(p); rmErr != nil {
                    log.Printf("failed to remove %s: %v", p, rmErr)
                } else {
                    removed = append(removed, p)
                }
            }
        }

        exec.Command("nginx", "-s", "reload").Run()
        ok(c, gin.H{
            "output":  string(out),
            "removed": removed,
            "mode":    "manual",
        })
        return
    }

    if err != nil {
        fail(c, 500, string(out))
        return
    }

    exec.Command("nginx", "-s", "reload").Run()
    ok(c, gin.H{"output": string(out), "mode": "certbot"})
}

func sslList(c *gin.Context) {
    result := map[string]sslInfo{}

    liveDir := "/etc/letsencrypt/live"
    entries, err := os.ReadDir(liveDir)
    if err != nil {
        log.Printf("sslList ReadDir failed: %v", err)
        c.JSON(200, gin.H{"success": true, "data": result})
        return
    }

    for _, entry := range entries {
        if !entry.IsDir() || entry.Name() == "README" {
            continue
        }
        domain := entry.Name()
        certPath := filepath.Join(liveDir, domain, "fullchain.pem")
        privPath := filepath.Join(liveDir, domain, "privkey.pem")

        info := sslInfo{Domain: domain}

        _, certErr := os.Stat(certPath)
        _, privErr := os.Stat(privPath)
        info.Exists = certErr == nil && privErr == nil

        if info.Exists {
            if data, err := os.ReadFile(certPath); err == nil {
                if block, _ := pem.Decode(data); block != nil {
                    if cert, err := x509.ParseCertificate(block.Bytes); err == nil {
                        info.Expires = cert.NotAfter.Format("2006-01-02 15:04:05")
                        info.DaysValid = int(time.Until(cert.NotAfter).Hours() / 24)
                        info.Issuer = strings.TrimSpace(cert.Issuer.CommonName)
                        if info.Issuer == "" && len(cert.Issuer.Organization) > 0 {
                            info.Issuer = cert.Issuer.Organization[0]
                        }
                    }
                }
            }
        } else {
            info.Error = "certificate files missing"
        }

        result[domain] = info
    }

    c.JSON(200, gin.H{"success": true, "data": result})
}