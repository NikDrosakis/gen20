package messaging

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"god/core"
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

// RegisterRoutes συνδέει το hub με το gin router.
func RegisterRoutes(router *gin.Engine, hub *core.Hub) {
	router.GET("/god/v1/messaging/ws", func(c *gin.Context) {
		userID := c.Query("userid")
		if userID == "" {
			userID = "anonymous"
		}

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}

		client := &core.Client{
			ID:      userID + "-" + conn.RemoteAddr().String(),
			UserID:  userID,
			Domains: make(map[string]bool),
			Conn:    conn,
			Send:    make(chan []byte, 256),
			Hub:     hub,
		}

		hub.Register(client)

		go client.WritePump()
		go client.ReadPump()
	})
}