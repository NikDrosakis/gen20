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