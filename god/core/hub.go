package core

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Message είναι το protocol που έστελνε το god στο ermis.
// Τώρα το god το δέχεται και το προωθεί.
type Message struct {
	System    string `json:"system"`     // "god", "admin", "chat", ...
	DomAffect string `json:"domaffect"`  // "*" ή "example.com"
	Type      string `json:"type"`       // "open", "message", "close", "notify", ...
	Verba     string `json:"verba"`      // το περιεχόμενο
	UserID    string `json:"userid"`     // ποιος στέλνει
	To        string `json:"to"`         // σε ποιον (userID ή "*")
	Cast      string `json:"cast"`       // "one", "all", "system"
	Timestamp int64  `json:"timestamp,omitempty"`
}

// Client είναι ένα συνδεδεμένο WebSocket.
type Client struct {
	ID        string
	UserID    string
	Domains   map[string]bool  // σε ποια domains έχει subscribe
	Conn      *websocket.Conn
	Send      chan []byte
	Hub       *Hub
	mu        sync.RWMutex
}

// Hub διαχειρίζεται όλες τις ενεργές συνδέσεις.
type Hub struct {
	clients    map[*Client]bool
	byUser     map[string]map[*Client]bool  // userID → clients
	byDomain   map[string]map[*Client]bool  // domain → clients
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message
	mu         sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		byUser:     make(map[string]map[*Client]bool),
		byDomain:   make(map[string]map[*Client]bool),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
		broadcast:  make(chan *Message, 256),
	}
}

// Run είναι ο κεντρικός loop — πρέπει να τρέχει σε goroutine.
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

// dispatch στέλνει το μήνυμα στους σωστούς clients.
func (h *Hub) dispatch(msg *Message) {
	msg.Timestamp = time.Now().Unix()

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	// Επιλογή παραληπτών με βάση cast + to + domaffect
	var targets []*Client

	switch msg.Cast {
	case "one":
		// 1-1: μόνο στον συγκεκριμένο user
		for c := range h.byUser[msg.To] {
			targets = append(targets, c)
		}

	case "all":
		// Broadcast σε όλους όσοι ταιριάζουν με domaffect
		for c := range h.clients {
			if msg.DomAffect == "*" || c.Domains[msg.DomAffect] {
				targets = append(targets, c)
			}
		}

	case "system":
		// System notification: πάει σε όλους
		for c := range h.clients {
			targets = append(targets, c)
		}

	default:
		// fallback: σαν "all"
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
			// Client αργός — drop το μήνυμα, μην μπλοκάρεις
		}
	}
}

// Broadcast στέλνει μήνυμα στο hub (από HTTP handler ή εξωτερικό).
func (h *Hub) Broadcast(msg *Message) {
	select {
	case h.broadcast <- msg:
	default:
		// Buffer γεμάτος — drop
	}
}

// Register προσθέτει client.
func (h *Hub) Register(c *Client) {
	h.register <- c
}

// Unregister αφαιρεί client.
func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}