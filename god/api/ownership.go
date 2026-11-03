package api

import (
    "log"
    "os"
    "os/user"
    "path/filepath"
    "strconv"
)

const (
    ownerName      = "dros"
    fileMode       = 0644
    dirMode        = 0755
)

var (
    ownerUID  int
    ownerGID  int
    ownerInit bool
)

func initOwner() {
    if ownerInit {
        return
    }
    u, err := user.Lookup(ownerName)
    if err != nil {
        log.Printf("ownership: cannot lookup %s: %v", ownerName, err)
        return
    }
    ownerUID, _ = strconv.Atoi(u.Uid)
    ownerGID, _ = strconv.Atoi(u.Gid)
    ownerInit = true
}

// fixOwnership — chown + chmod σε αρχείο
func fixOwnership(path string) {
    initOwner()
    if !ownerInit {
        return
    }
    if err := os.Chown(path, ownerUID, ownerGID); err != nil {
        log.Printf("chown %s failed: %v", path, err)
    }
    if err := os.Chmod(path, fileMode); err != nil {
        log.Printf("chmod %s failed: %v", path, err)
    }
}

// fixOwnershipDir — recursive chown + chmod
func fixOwnershipDir(path string) {
    initOwner()
    if !ownerInit {
        return
    }
    filepath.Walk(path, func(p string, info os.FileInfo, err error) error {
        if err != nil {
            return nil
        }
        os.Chown(p, ownerUID, ownerGID)
        if info.IsDir() {
            os.Chmod(p, dirMode)
        } else {
            os.Chmod(p, fileMode)
        }
        return nil
    })
}