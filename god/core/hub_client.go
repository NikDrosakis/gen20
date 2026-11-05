// core/hub_client.go
package core

import (
	"encoding/json"
	"time"
"os"
"os/exec"
	"github.com/gorilla/websocket"
"strings"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 64 * 1024
)

// ReadPump διαβάζει μηνύματα από τον client και τα προωθεί στο hub.
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

        var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		// 🆕 Terminal command
if msg.Type == "terminal" {
    domain := msg.Domain  // 🆕
    if domain == "" {
        domain = msg.DomAffect  // fallback
    }
    go c.handleTerminalCommand(msg.Verba, domain)
    continue
}

		// Αν ο client στέλνει "subscribe" σε domain
		if msg.Type == "subscribe" && msg.DomAffect != "" {
			c.mu.Lock()
			c.Domains[msg.DomAffect] = true
			c.mu.Unlock()

			c.Hub.mu.Lock()
			if c.Hub.byDomain[msg.DomAffect] == nil {
				c.Hub.byDomain[msg.DomAffect] = make(map[*Client]bool)
			}
			c.Hub.byDomain[msg.DomAffect][c] = true
			c.Hub.mu.Unlock()
			continue
		}

		// Ο client στέλνει μήνυμα — το προωθούμε στο hub
		if msg.UserID == "" {
			msg.UserID = c.UserID
		}
		c.Hub.Broadcast(&msg)
	}
}

// WritePump στέλνει μηνύματα από το Send channel στον client.
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case data, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.Conn.WriteMessage(websocket.TextMessage, data); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handlePeerMessage επεξεργάζεται ένα chat μήνυμα από peer.
//
// Χρησιμοποιεί το AppendMessage του Gredis, το οποίο κάνει:
// read → append → set → mark dirty (μπορείς να προσθέσεις MarkDirty αν θέλεις).
//
// ⚠️ Το ChatMessage πρέπει να έχει πεδίο CID int (ή άλλως περνάς το cid ως όρισμα).
func (c *Client) handlePeerMessage(cid int, msg ChatMessage) {
	// 1. Append στο conversation (δημιουργεί αν δεν υπάρχει)
	conv, err := c.Hub.redis.AppendMessage(cid, msg)
	if err != nil {
		// Αν το conversation δεν υπάρχει, δημιούργησέ το με αρχικό participant
		conv = &Conversation{
			CID:          cid,
			Chat:         []ChatMessage{msg},
			Modified:     time.Now().Unix(),
			Participants: map[string]Participant{},
		}

		// ⚠️ Πρόσθεσε participants ανάλογα με τα πεδία του ChatMessage.
		// Παραδείγματα (προσάρμοσε στα δικά σου πεδία):
		// if msg.FromUID != 0 {
		//     conv.Participants[fmt.Sprintf("%d", msg.FromUID)] = Participant{UID: msg.FromUID}
		// }
		// if msg.ToUID != 0 {
		//     conv.Participants[fmt.Sprintf("%d", msg.ToUID)] = Participant{UID: msg.ToUID}
		// }

		if setErr := c.Hub.redis.SetConversation(conv); setErr != nil {
			// log.Printf("SetConversation error: %v", setErr)
			return
		}
	}

	// 2. Mark dirty (αν το AppendMessage δεν το κάνει ήδη)
	if err := c.Hub.redis.MarkDirty(cid); err != nil {
		// log.Printf("MarkDirty error: %v", err)
	}

	// 3. Broadcast στους online participants (realtime)
	// ⚠️ Έλεγξε την υπογραφή του Broadcast στον Hub σου.
	// Αν δέχεται *Message, μετέτρεψε το ChatMessage σε Message πριν.
	c.Hub.BroadcastConversation(cid, msg)
}

// handleTerminalCommand εκτελεί μια bash εντολή και στέλνει το output
// πίσω στον client ως Message{type: "terminal_output"}.
func (c *Client) handleTerminalCommand(command string, domain string) {
	// Whitelist
	allowed := []string{
		"yarn build", "yarn install", "yarn dev",
		"git pull", "git status", "git log",
		"ls", "pwd", "whoami", "cat",
	}
	ok := false
	for _, a := range allowed {
		if strings.HasPrefix(command, a) {
			ok = true
			break
		}
	}
	if !ok {
		c.Hub.Broadcast(&Message{
			Type:   "terminal_output",
			Verba:  "[denied] command not allowed: " + command,
			UserID: "system",
			Cast:   "one",
			To:     c.UserID,
		})
		return
	}

	// 🆕 Domain → folder
	if domain == "" {
		domain = "gen20.gr" // fallback
	}

	// Sanitize: μόνο γράμματα, αριθμοί, τελείες, παύλες
	if !isValidDomain(domain) {
		c.Hub.Broadcast(&Message{
			Type:   "terminal_output",
			Verba:  "[denied] invalid domain: " + domain,
			UserID: "system",
			Cast:   "one",
			To:     c.UserID,
		})
		return
	}

	workDir := "/var/www/gs/public/" + domain

	// Έλεγχος ότι ο φάκελος υπάρχει
	if _, err := os.Stat(workDir); os.IsNotExist(err) {
		c.Hub.Broadcast(&Message{
			Type:   "terminal_output",
			Verba:  "[error] folder does not exist: " + workDir,
			UserID: "system",
			Cast:   "one",
			To:     c.UserID,
		})
		return
	}

	cmd := exec.Command("bash", "-lc", command)
	cmd.Dir = workDir

	output, err := cmd.CombinedOutput()

	response := &Message{
		Type:   "terminal_output",
		Verba:  string(output),
		UserID: "system",
		Cast:   "one",
		To:     c.UserID,
	}
	if err != nil {
		response.Verba += "\n[error] " + err.Error()
	}

	c.Hub.Broadcast(response)
}

// isValidDomain επιτρέπει μόνο [a-z0-9.-]
func isValidDomain(s string) bool {
	if s == "" || len(s) > 253 {
		return false
	}
	for _, r := range s {
		if !((r >= 'a' && r <= 'z') ||
			(r >= '0' && r <= '9') ||
			r == '.' || r == '-') {
			return false
		}
	}
	return true
}