package api

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

// Register καταχωρεί όλα τα /god/v1/* endpoints.
func Register(router *gin.Engine) {
    v1 := router.Group("/god/v1")

    // nginx
v1.GET("/hosts/list", listHosts)          // ← νέο
v1.POST("/hosts/save", saveHost)
v1.POST("/hosts/test", testConfig)
v1.POST("/hosts/reload", reloadNginx)
v1.GET("/hosts/read", readHost)
v1.GET("/hosts/shared", readShared)          // ← νέο
v1.POST("/hosts/shared", saveShared)

 // bind (DNS)
    v1.GET("/bind/list", listZones)
    v1.GET("/bind/read", readZone)
    v1.POST("/bind/save", saveZone)
    v1.GET("/bind/named-conf", readNamedConf)       // ← νέο
    v1.POST("/bind/named-conf", saveNamedConf)      // ← νέο
    v1.POST("/bind/test", testZones)
    v1.POST("/bind/reload", reloadBind)
    v1.POST("/bind/delete", deleteZone)
    v1.POST("/bind/checkfix", deleteZone)

    // ssl
    v1.POST("/ssl/action", sslAction)
 v1.GET("/ssl/list", sslList)
    // domain setup
    v1.POST("/setup/domain", createDomain)

}

// --- Response helpers ---

func ok(c *gin.Context, data any) {
    c.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}

func fail(c *gin.Context, status int, msg string) {
    c.JSON(status, gin.H{"success": false, "error": msg})
}