// core/hub_client.go
package core

import (
	"encoding/json"
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
			domain := "gen20.gr" // default
			go c.handleTerminalCommand(msg.C, domain) // Χρησιμοποιούμε το C αντί για Verba
			continue
		}

		// Sol bridge command (admin → sol daemon)
		if msg.Type == "sol.cmd" && c.Hub.Sol != nil {
			c.Hub.Sol.Command(c, data)
			continue
		}

		// Cubo WS hooks
		if DispatchWS(c, msg) {
			continue
		}

		// Default: broadcast με βάση το CID
		if msg.UID == "" {
			msg.UID = c.UserID
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
	// ... (η λογική παραμένει ίδια, αλλά χρησιμοποιεί το C αντί για Verba)
	// (Επειδή το μήνυμα terminal_output θα πρέπει να έχει τα νέα πεδία,
	// θα χρειαστεί να προσαρμόσουμε και εκεί το struct)
}