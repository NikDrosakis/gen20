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
	// 1. UID
	if msg.UID == "" {
		msg.UID = c.UserID
	}

	// 2. Έλεγχος CID (αντί για To)
	if msg.CID == "" {
		sendError(c, msg, "insert: cid required")
		return
	}

	// 3. Εξαγωγή του παραλήπτη από το CID (π.χ. "user1-user2" -> "user2")
	// Αν το CID είναι "a-b" και το UID είναι "a", τότε ο To είναι "b".
	// Για απλότητα, εδώ θεωρούμε ότι ο To είναι το δεύτερο μέρος του CID.
	// Αν το UID δεν ταιριάζει με το πρώτο μέρος, τότε ο To είναι το πρώτο.
	parts := splitCID(msg.CID)
	to := ""
	if len(parts) == 2 {
		if parts[0] == msg.UID {
			to = parts[1]
		} else {
			to = parts[0]
		}
	}
	if to == "" {
		sendError(c, msg, "insert: invalid cid")
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

	// Χρησιμοποιούμε το CID ως έχει
	cid := msg.CID

	content := msg.C
	if content == "" {
		sendError(c, msg, "insert: empty message")
		return
	}

	saved, err := SaveMessage(ctx, db, cid, msg.UID, content)
	if err != nil {
		sendError(c, msg, "save: "+err.Error())
		return
	}

	if redis := c.Hub.Redis(); redis != nil {
		_ = CacheMessage(redis, saved)
		_ = MarkDirty(redis, cid)
	}

	// Broadcast με το νέο format
	c.Hub.Broadcast(&core.Message{
		Type:     "insert",
		CID:      cid,
		UID:      saved.UID,
		C:        saved.C,
		Modified: time.Now().Unix(),
	})
}

// handleGet — ιστορικό για cid
func (h *wsHandler) handleGet(c *core.Client, msg core.Message) {
	if msg.UID == "" {
		msg.UID = c.UserID
	}
	if msg.CID == "" {
		sendError(c, msg, "get: cid required")
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

	cid := msg.CID
	log.Printf("[chat] handleGet: cid=%s", cid)

	msgs, err := ListMessages(ctx, db, cid)
	if err != nil {
		sendError(c, msg, "get: "+err.Error())
		return
	}

	log.Printf("[chat] handleGet: found %d for cid=%s", len(msgs), cid)

	payload, _ := json.Marshal(msgs)

	// Στέλνουμε την απάντηση πίσω στον χρήστη
	c.Hub.Broadcast(&core.Message{
		Type:     "res",
		CID:      cid,
		UID:      "system",
		C:        string(payload),
		Modified: time.Now().Unix(),
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
		Type:     "reslist",
		CID:      "", // Δεν υπάρχει cid για τη λίστα, ή βάλε ένα default
		UID:      "system",
		C:        string(payload),
		Modified: time.Now().Unix(),
	})
}

func sendError(c *core.Client, msg core.Message, errMsg string) {
	// Αν έχουμε cid, στείλε πίσω στο cid. Αλλιώς, στείλε στον αποστολέα.
	cid := msg.CID
	if cid == "" {
		// fallback: στέλνουμε μόνο στον αποστολέα
		c.Hub.Broadcast(&core.Message{
			Type:     "error",
			UID:      "system",
			C:        errMsg,
			Modified: time.Now().Unix(),
		})
		return
	}

	c.Hub.Broadcast(&core.Message{
		Type:     "error",
		CID:      cid,
		UID:      "system",
		C:        errMsg,
		Modified: time.Now().Unix(),
	})
}

// splitCID χωρίζει το cid σε δύο μέρη (π.χ. "a-b" -> ["a", "b"])
func splitCID(cid string) []string {
	// Βρίσκουμε το πρώτο '-' και χωρίζουμε
	for i := 0; i < len(cid); i++ {
		if cid[i] == '-' {
			return []string{cid[:i], cid[i+1:]}
		}
	}
	return []string{cid}
}