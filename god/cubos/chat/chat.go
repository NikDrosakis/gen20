// cubos/chat/chat.go
package chat

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"god/core"
)

// Register δένει τα /god/v1/chat/* endpoints.
func Register(router *gin.Engine, hub *core.Hub, couch *core.Gcouch) {
	v1 := router.Group("/god/v1/chat")
	{
		v1.POST("/message", postMessage(hub, couch))
		v1.GET("/list", listMessages(couch))
		v1.GET("/conversations", listConversations(couch))
	}
}

// POST /god/v1/chat/message
func postMessage(hub *core.Hub, couch *core.Gcouch) gin.HandlerFunc {
	return func(c *gin.Context) {
		var in struct {
			UID  string `json:"uid" binding:"required"`
			To   string `json:"to" binding:"required"`
			Text string `json:"c" binding:"required"`
		}
		if err := c.ShouldBindJSON(&in); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		db, err := ChatDB(couch)
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": err.Error()})
			return
		}

		conv, err := EnsureConv(ctx, db, []string{in.UID, in.To})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		msg, err := SaveMessage(ctx, db, conv.ID, in.UID, in.Text)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if hub != nil {
			hub.Broadcast(&core.Message{
				System:    "chat",
				DomAffect: "*",
				Type:      "message",
				Verba:     in.Text,
				UserID:    in.UID,
				To:        in.To,
				Cast:      "one",
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": msg,
			"conv_id": conv.ID,
		})
	}
}

// GET /god/v1/chat/list?cid=conv:...
func listMessages(couch *core.Gcouch) gin.HandlerFunc {
	return func(c *gin.Context) {
		convID := c.Query("cid")
		if convID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "cid required"})
			return
		}

		db, err := ChatDB(couch)
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": err.Error()})
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		msgs, err := ListMessages(ctx, db, convID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": true, "messages": msgs})
	}
}

// GET /god/v1/chat/conversations?uid=...
func listConversations(couch *core.Gcouch) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.Query("uid")
		if uid == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "uid required"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "conversations": []any{}})
	}
}
