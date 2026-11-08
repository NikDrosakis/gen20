// god/core/hub.go
package core

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Message είναι το generic protocol του hub.
type Message struct {
	System    string `json:"system"`
	DomAffect string `json:"domaffect"`
	Type      string `json:"type"`
	Verba     string `json:"verba"`
	UserID    string `json:"userid"`
	To        string `json:"to"`
	Cast      string `json:"cast"`
	Domain    string `json:"domain,omitempty"`
	Timestamp int64  `json:"timestamp,omitempty"`
}

// Client είναι ένα συνδεδεμένο WebSocket.
type Client struct {
	ID      string
	UserID  string
	Domains map[string]bool
	Conn    *websocket.Conn
	Send    chan []byte
	Hub     *Hub
	mu      sync.RWMutex
}

// Hub διαχειρίζεται όλες τις ενεργές συνδέσεις.
type Hub struct {
	clients    map[*Client]bool
	byUser     map[string]map[*Client]bool
	byDomain   map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
	mu         sync.RWMutex
	redis      *Gredis
	couch      *Gcouch
}

func NewHub(redis *Gredis) *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		byUser:     make(map[string]map[*Client]bool),
		byDomain:   make(map[string]map[*Client]bool),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
		broadcast:  make(chan *Message, 256),
		redis:      redis,
	}
}

// SetCouch — εισάγει το Gcouch (generic).
func (h *Hub) SetCouch(g *Gcouch) { h.couch = g }

// Run — κεντρικός loop.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if h.byUser[client.UserID] == nil {
				h.byUser[client.UserID] = make(map[*Client]bool)
			}
			h.byUser[client.UserID][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				delete(h.byUser[client.UserID], client)
				if len(h.byUser[client.UserID]) == 0 {
					delete(h.byUser, client.UserID)
				}
				for domain := range client.Domains {
					delete(h.byDomain[domain], client)
					if len(h.byDomain[domain]) == 0 {
						delete(h.byDomain, domain)
					}
				}
				close(client.Send)
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.dispatch(msg)
		}
	}
}

// dispatch — στέλνει το μήνυμα στους σωστούς clients.
func (h *Hub) dispatch(msg *Message) {
	msg.Timestamp = time.Now().Unix()

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	var targets []*Client

	switch msg.Cast {
	case "one":
		for c := range h.byUser[msg.To] {
			targets = append(targets, c)
		}
	case "all":
		for c := range h.clients {
			if msg.DomAffect == "*" || c.Domains[msg.DomAffect] {
				targets = append(targets, c)
			}
		}
	case "system":
		for c := range h.clients {
			targets = append(targets, c)
		}
	default:
		for c := range h.clients {
			if msg.DomAffect == "*" || c.Domains[msg.DomAffect] {
				targets = append(targets, c)
			}
		}
	}

	for _, c := range targets {
		select {
		case c.Send <- data:
		default:
			// Client αργός — drop
		}
	}
}

// Broadcast — στέλνει μήνυμα στο hub.
func (h *Hub) Broadcast(msg *Message) {
	select {
	case h.broadcast <- msg:
	default:
		// Buffer γεμάτος — drop
	}
}

// Register — προσθέτει client.
func (h *Hub) Register(c *Client) {
	h.register <- c
}

// Unregister — αφαιρεί client.
func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}