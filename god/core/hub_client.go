// core/hub_client.go
package core

import (
	"encoding/json"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/gorilla/websocket"
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

		// Terminal
		if msg.Type == "terminal" {
			domain := msg.Domain
			if domain == "" {
				domain = "gen20.gr"
			}
			go c.handleTerminalCommand(msg.Verba, domain)
			continue
		}

		// Cubo WS hooks (chat, κ.λπ.)
		if DispatchWS(c, msg) {
			continue
		}

		// Default: broadcast
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

// handleTerminalCommand εκτελεί bash εντολή και στέλνει output πίσω.
func (c *Client) handleTerminalCommand(command string, domain string) {
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
			To:     c.UserID,
		})
		return
	}

	if domain == "" {
		domain = "gen20.gr"
	}

	if !isValidDomain(domain) {
		c.Hub.Broadcast(&Message{
			Type:   "terminal_output",
			Verba:  "[denied] invalid domain: " + domain,
			UserID: "system",
			To:     c.UserID,
		})
		return
	}

	workDir := "/var/www/gs/public/" + domain

	if _, err := os.Stat(workDir); os.IsNotExist(err) {
		c.Hub.Broadcast(&Message{
			Type:   "terminal_output",
			Verba:  "[error] folder does not exist: " + workDir,
			UserID: "system",
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
