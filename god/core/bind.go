package core

import (
    "fmt"
    "log"
    "os"
    "os/exec"
    "regexp"
    "strings"

    "github.com/gin-gonic/gin"
)

const (
    bindZonesDir  = "/etc/bind/zones"
    bindNamedConf = "/etc/bind/named.conf.remote"
)

type zoneEntry struct {
    Domain   string `json:"domain"`
    FilePath string `json:"file"`
}

// parseNamedConf — διαβάζει το named.conf.remote και επιστρέφει τις zones
func parseNamedConf() ([]zoneEntry, error) {
    data, err := os.ReadFile(bindNamedConf)
    if err != nil {
        return nil, err
    }

    re := regexp.MustCompile(`zone\s+"([^"]+)"\s*\{[^}]*?file\s+"([^"]+)"`)
    matches := re.FindAllStringSubmatch(string(data), -1)

    zones := []zoneEntry{}
    for _, m := range matches {
        zones = append(zones, zoneEntry{
            Domain:   m[1],
            FilePath: m[2],
        })
    }
    return zones, nil
}

// listZones — επιστρέφει zones + το named.conf.remote ως editable
func listZones(c *gin.Context) {
    zones, err := parseNamedConf()
    if err != nil {
        fail(c, 500, "parse named.conf.remote failed: "+err.Error())
        return
    }

    // Διάβασε το named.conf.remote
    namedConfContent := ""
    if data, err := os.ReadFile(bindNamedConf); err == nil {
        namedConfContent = string(data)
    }

    ok(c, gin.H{
        "zones":      zones,
        "count":      len(zones),
        "named_conf": namedConfContent,
        "named_path": bindNamedConf,
    })
}

// readZone — διαβάζει το περιεχόμενο μιας zone
func readZone(c *gin.Context) {
    domain := c.Query("domain")
    if !domainRe.MatchString(domain) && !strings.Contains(domain, "in-addr.arpa") {
        fail(c, 400, "invalid domain")
        return
    }

    zones, err := parseNamedConf()
    if err != nil {
        fail(c, 500, "parse named.conf.remote failed: "+err.Error())
        return
    }

    var filePath string
    for _, z := range zones {
        if z.Domain == domain {
            filePath = z.FilePath
            break
        }
    }

    if filePath == "" {
        fail(c, 404, "zone not found in named.conf.remote")
        return
    }

    data, err := os.ReadFile(filePath)
    if err != nil {
        fail(c, 404, "read zone file failed: "+err.Error())
        return
    }

    ok(c, gin.H{"domain": domain, "path": filePath, "content": string(data)})
}

// readNamedConf — διαβάζει το named.conf.remote
func readNamedConf(c *gin.Context) {
    data, err := os.ReadFile(bindNamedConf)
    if err != nil {
        fail(c, 500, "read named.conf.remote failed: "+err.Error())
        return
    }
    ok(c, gin.H{"path": bindNamedConf, "content": string(data)})
}

type saveZoneReq struct {
    Domain  string `json:"domain"`
    Content string `json:"content"`
}

// saveZone — γράφει zone file, ελέγχει, reload
func saveZone(c *gin.Context) {
    var req saveZoneReq
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if !domainRe.MatchString(req.Domain) && !strings.Contains(req.Domain, "in-addr.arpa") {
        fail(c, 400, "invalid domain")
        return
    }

    zones, err := parseNamedConf()
    if err != nil {
        fail(c, 500, "parse named.conf.remote failed: "+err.Error())
        return
    }

    var zonePath string
    for _, z := range zones {
        if z.Domain == req.Domain {
            zonePath = z.FilePath
            break
        }
    }

    if zonePath == "" {
        fail(c, 404, "zone not found in named.conf.remote")
        return
    }

    tmpPath := zonePath + ".tmp"

    if err := os.WriteFile(tmpPath, []byte(req.Content), 0644); err != nil {
        fail(c, 500, "write failed: "+err.Error())
        return
    }

    check := exec.Command("named-checkzone", req.Domain, tmpPath)
    if out, err := check.CombinedOutput(); err != nil {
        os.Remove(tmpPath)
        log.Printf("named-checkzone failed for %s: %s", req.Domain, string(out))
        fail(c, 400, "named-checkzone failed: "+string(out))
        return
    }

    if err := os.Rename(tmpPath, zonePath); err != nil {
        fail(c, 500, "rename failed: "+err.Error())
        return
    }

    if out, err := reloadBindCmd(); err != nil {
        fail(c, 500, "bind reload failed: "+string(out))
        return
    }

    ok(c, gin.H{"path": zonePath})
}

// saveNamedConf — γράφει το named.conf.remote, ελέγχει με named-checkconf, reload
func saveNamedConf(c *gin.Context) {
    var req struct {
        Content string `json:"content"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }

    tmpPath := bindNamedConf + ".tmp"

    if err := os.WriteFile(tmpPath, []byte(req.Content), 0644); err != nil {
        fail(c, 500, "write failed: "+err.Error())
        return
    }

    // named-checkconf πρέπει να δει το νέο named.conf.remote.
    // Το named-checkconf διαβάζει από το default path, οπότε:
    // 1. rename πρώτα, μετά check, μετά rollback αν αποτύχει
    backup := bindNamedConf + ".bak"
    if err := os.Rename(bindNamedConf, backup); err != nil {
        os.Remove(tmpPath)
        fail(c, 500, "backup failed: "+err.Error())
        return
    }

    if err := os.Rename(tmpPath, bindNamedConf); err != nil {
        os.Rename(backup, bindNamedConf)
        fail(c, 500, "rename failed: "+err.Error())
        return
    }

    if out, err := exec.Command("named-checkconf").CombinedOutput(); err != nil {
        // Rollback
        os.Remove(bindNamedConf)
        os.Rename(backup, bindNamedConf)
        fail(c, 400, "named-checkconf failed: "+string(out))
        return
    }

    os.Remove(backup)

    if out, err := reloadBindCmd(); err != nil {
        fail(c, 500, "bind reload failed: "+string(out))
        return
    }

    ok(c, gin.H{"path": bindNamedConf})
}

// testZones — named-checkconf + named-checkzone για όλες τις zones
func testZones(c *gin.Context) {
    if out, err := exec.Command("named-checkconf").CombinedOutput(); err != nil {
        fail(c, 400, "named-checkconf failed:\n"+string(out))
        return
    }

    zones, err := parseNamedConf()
    if err != nil {
        fail(c, 500, "parse named.conf.remote failed: "+err.Error())
        return
    }

    var results []string
    okCount := 0
    failCount := 0

    for _, z := range zones {
        if _, err := os.Stat(z.FilePath); err != nil {
            results = append(results, fmt.Sprintf("❌ %s: file missing", z.Domain))
            failCount++
            continue
        }

        check := exec.Command("named-checkzone", z.Domain, z.FilePath)
        if out, err := check.CombinedOutput(); err != nil {
            results = append(results, fmt.Sprintf("❌ %s: %s", z.Domain, strings.TrimSpace(string(out))))
            failCount++
        } else {
            results = append(results, fmt.Sprintf("✅ %s: OK", z.Domain))
            okCount++
        }
    }

    ok(c, gin.H{
        "results": results,
        "total":   len(zones),
        "passed":  okCount,
        "failed":  failCount,
    })
}

func reloadBind(c *gin.Context) {
    out, err := reloadBindCmd()
    if err != nil {
        fail(c, 500, "reload failed: "+string(out))
        return
    }
    ok(c, gin.H{"output": string(out)})
}

func reloadBindCmd() ([]byte, error) {
    // 1. rndc reload (πιο άμεσο)
    if out, err := exec.Command("rndc", "reload").CombinedOutput(); err == nil {
        return out, nil
    }
    // 2. systemctl reload bind9
    if out, err := exec.Command("systemctl", "reload", "bind9").CombinedOutput(); err == nil {
        return out, nil
    }
    // 3. systemctl restart bind9
    return exec.Command("systemctl", "restart", "bind9").CombinedOutput()
}
// deleteZone — διαγράφει zone file + αφαιρεί το block από named.conf.remote
func deleteZone(c *gin.Context) {
    var req struct {
        Domain string `json:"domain"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if !domainRe.MatchString(req.Domain) && !strings.Contains(req.Domain, "in-addr.arpa") {
        fail(c, 400, "invalid domain")
        return
    }

    // 1. Βρες το zone file path από το named.conf.remote
    zones, err := parseNamedConf()
    if err != nil {
        fail(c, 500, "parse named.conf.remote failed: "+err.Error())
        return
    }

    var zonePath string
    for _, z := range zones {
        if z.Domain == req.Domain {
            zonePath = z.FilePath
            break
        }
    }

    if zonePath == "" {
        fail(c, 404, "zone not found in named.conf.remote")
        return
    }

    // 2. Διάβασε το τρέχον named.conf.remote
    confData, err := os.ReadFile(bindNamedConf)
    if err != nil {
        fail(c, 500, "read named.conf.remote failed: "+err.Error())
        return
    }

    // 3. Αφαίρεσε το zone block
    newConf := removeZoneBlock(string(confData), req.Domain)
    if newConf == string(confData) {
        fail(c, 500, "failed to remove zone block (regex did not match)")
        return
    }

    // 4. Γράψε temp + backup
    tmpPath := bindNamedConf + ".tmp"
    backup := bindNamedConf + ".bak"

    if err := os.WriteFile(tmpPath, []byte(newConf), 0644); err != nil {
        fail(c, 500, "write temp failed: "+err.Error())
        return
    }

    // 5. Backup + rename
    if err := os.Rename(bindNamedConf, backup); err != nil {
        os.Remove(tmpPath)
        fail(c, 500, "backup failed: "+err.Error())
        return
    }

    if err := os.Rename(tmpPath, bindNamedConf); err != nil {
        os.Rename(backup, bindNamedConf)
        fail(c, 500, "rename failed: "+err.Error())
        return
    }

    // 6. named-checkconf — αν αποτύχει, rollback
    if out, err := exec.Command("named-checkconf").CombinedOutput(); err != nil {
        os.Remove(bindNamedConf)
        os.Rename(backup, bindNamedConf)
        fail(c, 400, "named-checkconf failed: "+string(out))
        return
    }

    // 7. Διάγραψε το zone file
    removedFile := false
    if _, err := os.Stat(zonePath); err == nil {
        if err := os.Remove(zonePath); err != nil {
            log.Printf("failed to remove zone file %s: %v", zonePath, err)
        } else {
            removedFile = true
        }
    }

    os.Remove(backup)

    // 8. Reload bind
    if out, err := reloadBindCmd(); err != nil {
        fail(c, 500, "bind reload failed: "+string(out))
        return
    }

    ok(c, gin.H{
        "domain":       req.Domain,
        "removed_file": removedFile,
        "file_path":    zonePath,
    })
}

// removeZoneBlock — αφαιρεί το zone "domain" { ... }; από το named.conf.remote
func removeZoneBlock(conf, domain string) string {
    // Regex: zone "domain" { ... }; (non-greedy, με nested braces)
    // Το block μπορεί να περιέχει { } μέσα (π.χ. allow-query { any; };)
    // Γι' αυτό μετράμε braces αντί να χρησιμοποιήσουμε regex.
    lines := strings.Split(conf, "\n")
    var result []string
    inZone := false
    braceDepth := 0

    zoneStart := regexp.MustCompile(`^\s*zone\s+"` + regexp.QuoteMeta(domain) + `"\s*\{`)

    for _, line := range lines {
        if !inZone {
            if zoneStart.MatchString(line) {
                inZone = true
                braceDepth = strings.Count(line, "{") - strings.Count(line, "}")
                if braceDepth <= 0 {
                    // Το block άνοιξε και έκλεισε στην ίδια γραμμή
                    inZone = false
                }
                continue
            }
            result = append(result, line)
        } else {
            braceDepth += strings.Count(line, "{") - strings.Count(line, "}")
            if braceDepth <= 0 {
                inZone = false
            }
            continue
        }
    }

    return strings.Join(result, "\n")
}
// api/bind.go
func checkfixZone(c *gin.Context) {
    var req struct {
        Domain string `json:"domain"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        fail(c, 400, "invalid request")
        return
    }
    if !domainRe.MatchString(req.Domain) {
        fail(c, 400, "invalid domain")
        return
    }

    // 1. Εξωτερικό IP
    out, err := exec.Command("curl", "-s", "ifconfig.me").Output()
    if err != nil {
        fail(c, 500, "cannot get external IP: "+err.Error())
        return
    }
    extip := strings.TrimSpace(string(out))

    // 2. Bind active;
    status, _ := exec.Command("systemctl", "is-active", "bind9").Output()
    if strings.TrimSpace(string(status)) != "active" {
        fail(c, 500, "bind9 not active")
        return
    }

    // 3. Zone file exists;
    zones, err := parseNamedConf()
    if err != nil {
        fail(c, 500, "parse named.conf.remote failed: "+err.Error())
        return
    }

    var zonePath string
    for _, z := range zones {
        if z.Domain == req.Domain {
            zonePath = z.FilePath
            break
        }
    }
    if zonePath == "" {
        fail(c, 404, "zone not found in named.conf.remote")
        return
    }

    // 4. named-checkzone
    check := exec.Command("named-checkzone", req.Domain, zonePath)
    if out, err := check.CombinedOutput(); err != nil {
        fail(c, 400, "named-checkzone failed: "+string(out))
        return
    }

    ok(c, gin.H{
        "domain":      req.Domain,
        "zone_file":   zonePath,
        "external_ip": extip,
        "status":      "ok",
    })
}