// cubos/chat/ws.go
package chat

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"god/core"
)

type wsHandler struct{}

func (h *wsHandler) HandleWS(c *core.Client, msg core.Message) bool {
	switch msg.Type {
	case "insert", "message":
		h.handleInsert(c, msg)
		return true
	case "get":
		h.handleGet(c, msg)
		return true
	case "getlist":
		h.handleGetList(c, msg)
		return true
	}
	return false
}

// handleInsert — νέο μήνυμα
func (h *wsHandler) handleInsert(c *core.Client, msg core.Message) {
	if msg.UserID == "" {
		msg.UserID = c.UserID
	}
	if msg.To == "" {
		sendError(c, msg, "insert: to required")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	couch := c.Hub.Couch()
	if couch == nil {
		sendError(c, msg, "couch unavailable")
		return
	}

	db, err := ChatDB(couch)
	if err != nil {
		sendError(c, msg, err.Error())
		return
	}

	cid := CID([]string{msg.UserID, msg.To})

	content := msg.C
	if content == "" {
		content = msg.Verba
	}
	if content == "" {
		sendError(c, msg, "insert: empty message")
		return
	}

	saved, err := SaveMessage(ctx, db, cid, msg.UserID, content)
	if err != nil {
		sendError(c, msg, "save: "+err.Error())
		return
	}

	if redis := c.Hub.Redis(); redis != nil {
		_ = CacheMessage(redis, saved)
		_ = MarkDirty(redis, cid)
	}

	c.Hub.Broadcast(&core.Message{
		System: "chat",
		Type:   "insert",
		C:      saved.C,
		UserID: saved.UID,
		To:     msg.To,
		CID:    cid,
	})
}

// handleGet — ιστορικό για cid
func (h *wsHandler) handleGet(c *core.Client, msg core.Message) {
	if msg.UserID == "" {
		msg.UserID = c.UserID
	}
	if msg.To == "" {
		sendError(c, msg, "get: to required")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	couch := c.Hub.Couch()
	if couch == nil {
		sendError(c, msg, "couch unavailable")
		return
	}

	db, err := ChatDB(couch)
	if err != nil {
		sendError(c, msg, err.Error())
		return
	}

	cid := CID([]string{msg.UserID, msg.To})
	log.Printf("[chat] handleGet: cid=%s", cid)

	msgs, err := ListMessages(ctx, db, cid)
	if err != nil {
		sendError(c, msg, "get: "+err.Error())
		return
	}

	log.Printf("[chat] handleGet: found %d for cid=%s", len(msgs), cid)

	payload, _ := json.Marshal(msgs)
	c.Hub.Broadcast(&core.Message{
		System: "chat",
		Type:   "res",
		C:      string(payload),
		UserID: "system",
		To:     c.UserID,
		CID:    cid,
	})
}

// handleGetList — online users
func (h *wsHandler) handleGetList(c *core.Client, msg core.Message) {
	users := c.Hub.OnlineUsers()

	out := make([]string, 0, len(users))
	for _, u := range users {
		if u != c.UserID && u != "" {
			out = append(out, u)
		}
	}

	payload, _ := json.Marshal(out)
	c.Hub.Broadcast(&core.Message{
		System: "chat",
		Type:   "reslist",
		C:      string(payload),
		UserID: "system",
		To:     c.UserID,
	})
}

func sendError(c *core.Client, msg core.Message, errMsg string) {
	c.Hub.Broadcast(&core.Message{
		System: "chat",
		Type:   "error",
		C:      errMsg,
		UserID: "system",
		To:     c.UserID,
	})
}
