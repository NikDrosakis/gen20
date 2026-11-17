// core/ws_hub.go
package core

import (
	"log"
	"net/http"
	"os"
	"runtime/debug"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}
		host := r.Host
		return strings.HasSuffix(origin, "://"+host) ||
			strings.HasSuffix(origin, "://localhost") ||
			strings.HasSuffix(origin, "://127.0.0.1")
	},
}

func RegisterRoutes(router *gin.Engine, hub *Hub) {
	router.GET("/god/v1/messaging/ws", func(c *gin.Context) {
		db, uid, role, err := VerifyAuthToken(c.Query("token"), os.Getenv("GOD_SHARED_SECRET"))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("ws upgrade: %v", err) // ο upgrader έχει ήδη απαντήσει στον client
			return
		}

		guid := GUID(db, uid)
		client := &Client{
			ID:      guid + "-" + conn.RemoteAddr().String(),
			UserID:  guid,
			Role:    role, // νέο πεδίο στο Client
			Domains: map[string]bool{db: true},
			Conn:    conn,
			Send:    make(chan []byte, 256),
			Hub:     hub,
		}

		hub.Register(client)
		safeGo(client.WritePump)
		safeGo(client.ReadPump)
	})
}

func safeGo(fn func()) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("PANIC in goroutine: %v\n%s", r, debug.Stack())
			}
		}()
		fn()
	}()
}