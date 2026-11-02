package api

import (
    "log"
    "os"
    "os/exec"
    "path/filepath"
    "regexp"
    "strings"

    "github.com/gin-gonic/gin"
)

var domainRe = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$`)

type saveHostReq struct {
    Domain  string `json:"domain"`
    Content string `json:"content"`
}

func saveHost(c *gin.Context) {
    var req saveHostReq
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if !domainRe.MatchString(req.Domain) {
        fail(c, 400, "invalid domain")
        return
    }

    confPath := filepath.Join("/etc/nginx/conf.d", req.Domain+".conf")
    tmpPath := confPath + ".tmp"

    if err := os.WriteFile(tmpPath, []byte(req.Content), 0644); err != nil {
        fail(c, 500, "write failed: "+err.Error())
        return
    }

    if out, err := exec.Command("nginx", "-t").CombinedOutput(); err != nil {
        os.Remove(tmpPath)
        fail(c, 500, "nginx test failed: "+string(out))
        return
    }

    if err := os.Rename(tmpPath, confPath); err != nil {
        fail(c, 500, "rename failed: "+err.Error())
        return
    }

    if out, err := exec.Command("nginx", "-s", "reload").CombinedOutput(); err != nil {
        fail(c, 500, "reload failed: "+string(out))
        return
    }

    ok(c, gin.H{"path": confPath})
}

func testConfig(c *gin.Context) {
    out, err := exec.Command("nginx", "-t").CombinedOutput()
    if err != nil {
        fail(c, 400, string(out))
        return
    }
    ok(c, gin.H{"output": string(out)})
}

func reloadNginx(c *gin.Context) {
    if out, err := exec.Command("nginx", "-s", "reload").CombinedOutput(); err != nil {
        fail(c, 500, string(out))
        return
    }
    ok(c, nil)
}

func readHost(c *gin.Context) {
    domain := c.Query("domain")
    if !domainRe.MatchString(domain) {
        fail(c, 400, "invalid domain")
        return
    }
    data, err := os.ReadFile(filepath.Join("/etc/nginx/conf.d", domain+".conf"))
    if err != nil {
        fail(c, 404, "not found")
        return
    }
    ok(c, gin.H{"content": string(data)})
}

// listHosts — επιστρέφει όλα τα nginx configs από /etc/nginx/conf.d/
func listHosts(c *gin.Context) {
    confDir := "/etc/nginx/conf.d"
    entries, err := os.ReadDir(confDir)
    if err != nil {
        fail(c, 500, "read conf.d failed: "+err.Error())
        return
    }

    type hostEntry struct {
        Domain  string `json:"domain"`
        Path    string `json:"path"`
        Content string `json:"content"`
    }

    hosts := []hostEntry{}
    for _, entry := range entries {
        if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".conf") {
            continue
        }
        domain := strings.TrimSuffix(entry.Name(), ".conf")
        fullPath := filepath.Join(confDir, entry.Name())

        data, err := os.ReadFile(fullPath)
        if err != nil {
            log.Printf("failed to read %s: %v", fullPath, err)
            continue
        }

        hosts = append(hosts, hostEntry{
            Domain:  domain,
            Path:    fullPath,
            Content: string(data),
        })
    }

    ok(c, gin.H{"hosts": hosts, "count": len(hosts)})
}

const sharedConfPath = "/var/www/gs/setup/server/gen_shared.conf"

// readShared — διαβάζει το gen_shared.conf
func readShared(c *gin.Context) {
    data, err := os.ReadFile(sharedConfPath)
    if err != nil {
        fail(c, 500, "read shared conf failed: "+err.Error())
        return
    }
    ok(c, gin.H{"path": sharedConfPath, "content": string(data)})
}

// saveShared — γράφει το gen_shared.conf με nginx -t πριν το commit
func saveShared(c *gin.Context) {
    var req struct {
        Content string `json:"content"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }

    tmpPath := sharedConfPath + ".tmp"
    backup := sharedConfPath + ".bak"

    // 1. Write temp
    if err := os.WriteFile(tmpPath, []byte(req.Content), 0644); err != nil {
        fail(c, 500, "write failed: "+err.Error())
        return
    }

    // 2. Backup
    if err := os.Rename(sharedConfPath, backup); err != nil {
        os.Remove(tmpPath)
        fail(c, 500, "backup failed: "+err.Error())
        return
    }

    // 3. Rename
    if err := os.Rename(tmpPath, sharedConfPath); err != nil {
        os.Rename(backup, sharedConfPath)
        fail(c, 500, "rename failed: "+err.Error())
        return
    }

    // 4. nginx -t — αν αποτύχει, rollback
    if out, err := exec.Command("nginx", "-t").CombinedOutput(); err != nil {
        os.Remove(sharedConfPath)
        os.Rename(backup, sharedConfPath)
        fail(c, 500, "nginx test failed: "+string(out))
        return
    }

    // 5. Reload
    if out, err := exec.Command("nginx", "-s", "reload").CombinedOutput(); err != nil {
        fail(c, 500, "reload failed: "+string(out))
        return
    }

    os.Remove(backup)
    ok(c, gin.H{"path": sharedConfPath})
}