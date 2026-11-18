// god/core/hub.go
package core

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"strings"
	"sync"
	"time"
)

// Message είναι το generic protocol του hub.
type Message struct {
    System   string `json:"system,omitempty"`
    Type     string `json:"type"`
    CID      string `json:"cid"`
    UID      string `json:"uid"`
    To       string `json:"to,omitempty"`
    Cast     string `json:"cast,omitempty"`
    C        string `json:"c,omitempty"`
    Modified int64  `json:"modified,omitempty"`
}
// Client είναι ένα συνδεδεμένο WebSocket.
type Client struct {
	Role    string // "user" | "admin", από το signed token
	ID      string
	UserID  string // Κρατάμε το UserID για εσωτερική χρήση (από το query param)
	Domains map[string]bool
	Conn    *websocket.Conn
	Send    chan []byte
	Hub     *Hub
	mu      sync.RWMutex
}

// Hub διαχειρίζεται όλες τις ενεργές συνδέσεις.
type Hub struct {
	Sol        *SolBridge
	clients    map[*Client]bool
	byUser     map[string]map[*Client]bool
	byDomain   map[string]map[*Client]bool
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
		unregister: make(chan *Client, 64),
		broadcast:  make(chan *Message, 1024),
		redis:      redis,
	}
}

func (h *Hub) SetCouch(g *Gcouch) { h.couch = g }

func (h *Hub) Run() {
	for {
		select {
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
				log.Printf("[hub] unregistered: %s", client.UserID)
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.dispatch(msg)
		}
	}
}

// dispatch — στέλνει το μήνυμα στους σωστούς clients με βάση το CID.
func (h *Hub) dispatch(msg *Message) {
	// Ενημερώνουμε το modified αν δεν υπάρχει
	if msg.Modified == 0 {
		msg.Modified = time.Now().Unix()
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	var targets []*Client

	if msg.CID != "" {
		// Το CID είναι της μορφής "user1-user2". Στέλνουμε και στους δύο.
		parts := strings.Split(msg.CID, "-")
		for _, uid := range parts {
			for c := range h.byUser[uid] {
				targets = append(targets, c)
			}
		}
	} else {
		// Αν δεν υπάρχει CID, κάνουμε broadcast σε όλους (fallback)
		for c := range h.clients {
			targets = append(targets, c)
		}
	}

	for _, c := range targets {
		select {
		case c.Send <- data:
		default:
			log.Printf("[hub] ⚠️  slow client %s — dropping %s", c.UserID, msg.Type)
		}
	}
}

func (h *Hub) Broadcast(msg *Message) {
	select {
	case h.broadcast <- msg:
	default:
		log.Printf("[hub] ⚠️  broadcast full — dropping %s", msg.Type)
	}
}

func (h *Hub) Register(c *Client) {
	h.mu.Lock()
	h.clients[c] = true
	if h.byUser[c.UserID] == nil {
		h.byUser[c.UserID] = make(map[*Client]bool)
	}
	h.byUser[c.UserID][c] = true
	h.mu.Unlock()
	log.Printf("[hub] registered: %s", c.UserID)
}

func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}

// ============================================================
//  CUBO WS HOOKS (generic — για όλα τα cubos)
// ============================================================

type WSHook interface {
	HandleWS(c *Client, msg Message) bool
}

var wsHooks []WSHook

func RegisterWSHook(h WSHook) {
	wsHooks = append(wsHooks, h)
}

func DispatchWS(c *Client, msg Message) bool {
	for _, h := range wsHooks {
		if h.HandleWS(c, msg) {
			return true
		}
	}
	return false
}

func (h *Hub) Couch() *Gcouch { return h.couch }
func (h *Hub) Redis() *Gredis { return h.redis }

func (h *Hub) OnlineUsers() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	users := make([]string, 0, len(h.byUser))
	for uid := range h.byUser {
		users = append(users, uid)
	}
	log.Printf("[hub] OnlineUsers: %d → %v", len(users), users)
	return users
}
