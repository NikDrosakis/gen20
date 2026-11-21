package core

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var (
	solActions = map[string]time.Duration{ // whitelist + timeout
		"build":    15 * time.Minute,
		"install":  15 * time.Minute,
		"status":   10 * time.Second,
		"domain":   30 * time.Minute, // moon domain <arg>: fs + db + nginx + dns + ssl
		"internal": 30 * time.Minute, // moon internal <arg>: fs + db + nginx (no dns/ssl)
		"tor":      30 * time.Minute, // moon tor: fs + db + tor hidden service
	}
	solArgRe    = regexp.MustCompile(`^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,251}[a-zA-Z0-9])?$`) // domain ή cubo (επιτρέπει κεφαλαία, π.χ. sliderBG)
	solUpgrader = websocket.Upgrader{CheckOrigin: func(*http.Request) bool { return true }}
)

// SolResult είναι το αποτέλεσμα μίας εντολής προς τον sol daemon.
type SolResult struct {
	Status string `json:"status"`
	Msg    string `json:"msg"`
	Code   int    `json:"code"`
}

type pendingCmd struct {
	client *Client
	conn   *websocket.Conn
	timer  *time.Timer
	ch     chan SolResult // για HTTP callers (Run) — nil για WS clients
}

type SolBridge struct {
	mu      sync.Mutex
	wmu     sync.Mutex
	conn    *websocket.Conn
	pending map[string]*pendingCmd
}

func NewSolBridge() *SolBridge {
	return &SolBridge{pending: map[string]*pendingCmd{}}
}

func newID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (b *SolBridge) reply(c *Client, id, status, msg string, code int) {
	if c == nil {
		return
	}
	defer func() { recover() }() // το Send μπορεί να έχει κλείσει αν έφυγε ο client
	out, _ := json.Marshal(map[string]any{
		"type": "sol.event", "id": id, "status": status, "msg": msg, "code": code,
	})
	select {
	case c.Send <- out:
	default:
	}
}

// Καλείται από το ReadPump όταν type == "sol.cmd".
func (b *SolBridge) Command(c *Client, raw []byte) {
	if c.Role != "admin" {
		b.reply(c, "", "error", "forbidden", 403)
		return
	}
	var m struct {
		Action string `json:"action"`
		Arg    string `json:"arg"`
	}
	if json.Unmarshal(raw, &m) != nil {
		b.reply(c, "", "error", "invalid command", 400)
		return
	}
	timeout, ok := solActions[m.Action]
	if !ok || !solArgRe.MatchString(m.Arg) {
		b.reply(c, "", "error", "invalid command", 400)
		return
	}

	// domain από το token (πρώτο Domains entry)
	domain := ""
	for d := range c.Domains {
		domain = d
		break
	}

	id := newID()
	b.mu.Lock()
	conn := b.conn
	if conn == nil {
		b.mu.Unlock()
		b.reply(c, id, "error", "sol offline", 503)
		return
	}
	p := &pendingCmd{client: c, conn: conn}
	p.timer = time.AfterFunc(timeout, func() { b.finish(id, "error", "timeout", 124) })
	b.pending[id] = p
	b.mu.Unlock()

	line, _ := json.Marshal(map[string]string{"id": id, "action": m.Action, "arg": m.Arg, "domain": domain})
	b.wmu.Lock()
	err := conn.WriteMessage(websocket.TextMessage, line)
	b.wmu.Unlock()
	if err != nil {
		b.finish(id, "error", "sol write failed", 502)
	}
}

func (b *SolBridge) finish(id, status, msg string, code int) {
	b.mu.Lock()
	p := b.pending[id]
	delete(b.pending, id)
	b.mu.Unlock()
	if p == nil {
		return
	}
	if p.timer != nil {
		p.timer.Stop()
	}
	if p.client != nil {
		b.reply(p.client, id, status, msg, code)
	}
	if p.ch != nil {
		select {
		case p.ch <- SolResult{Status: status, Msg: msg, Code: code}:
		default:
		}
	}
}

// Run στέλνει μία εντολή στον sol daemon και μπλοκάρει μέχρι την απάντηση
// (ή μέχρι το ctx να ακυρωθεί). Χρησιμοποιείται από HTTP handlers (π.χ.
// createDomain) που δεν έχουν WebSocket Client.
func (b *SolBridge) Run(ctx context.Context, action, arg string) (SolResult, error) {
	timeout, ok := solActions[action]
	if !ok {
		return SolResult{}, fmt.Errorf("invalid action: %s", action)
	}
	if arg == "" || !solArgRe.MatchString(arg) {
		return SolResult{}, fmt.Errorf("invalid arg: %s", arg)
	}

	id := newID()
	b.mu.Lock()
	conn := b.conn
	if conn == nil {
		b.mu.Unlock()
		return SolResult{}, fmt.Errorf("sol offline")
	}
	p := &pendingCmd{conn: conn, ch: make(chan SolResult, 1)}
	p.timer = time.AfterFunc(timeout, func() { b.finish(id, "error", "timeout", 124) })
	b.pending[id] = p
	b.mu.Unlock()

	line, _ := json.Marshal(map[string]string{"id": id, "action": action, "arg": arg, "domain": ""})
	b.wmu.Lock()
	err := conn.WriteMessage(websocket.TextMessage, line)
	b.wmu.Unlock()
	if err != nil {
		b.finish(id, "error", "sol write failed", 502)
	}

	select {
	case res := <-p.ch:
		return res, nil
	case <-ctx.Done():
		b.finish(id, "error", "canceled", 499)
		return SolResult{}, ctx.Err()
	}
}

func (b *SolBridge) Register(router *gin.Engine) {
	token := os.Getenv("SOL_WS_TOKEN")
	router.GET("/god/v1/sol/ws", func(c *gin.Context) {
		// Οι browsers δεν μπορούν να βάλουν custom header σε WebSocket,
		// άρα το header-token αποκλείει από μόνο του τον browser.
		if token == "" ||
			subtle.ConstantTimeCompare([]byte(c.GetHeader("X-Sol-Token")), []byte(token)) != 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		conn, err := solUpgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		b.attach(conn)
	})
}

func (b *SolBridge) attach(conn *websocket.Conn) {
	b.mu.Lock()
	old := b.conn
	b.conn = conn
	b.mu.Unlock()
	if old != nil {
		old.Close()
	}
	log.Println("sol connected")

	defer func() {
		conn.Close()
		b.mu.Lock()
		if b.conn == conn {
			b.conn = nil
		}
		var dead []string
		for id, p := range b.pending {
			if p.conn == conn {
				dead = append(dead, id)
			}
		}
		b.mu.Unlock()
		for _, id := range dead {
			b.finish(id, "error", "sol disconnected", 125)
		}
		log.Println("sol disconnected")
	}()

	const idle = 60 * time.Second
	conn.SetReadLimit(64 << 10)
	conn.SetReadDeadline(time.Now().Add(idle))
	conn.SetPingHandler(func(d string) error {
		conn.SetReadDeadline(time.Now().Add(idle))
		return conn.WriteControl(websocket.PongMessage, []byte(d), time.Now().Add(time.Second))
	})

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			return
		}
		conn.SetReadDeadline(time.Now().Add(idle))

		var ev struct {
			Type   string `json:"type"`
			ID     string `json:"id"`
			Status string `json:"status"`
			Msg    string `json:"msg"`
			Code   int    `json:"code"`
		}
		if json.Unmarshal(data, &ev) != nil || ev.Type != "sol.event" {
			continue
		}
		b.mu.Lock()
		p := b.pending[ev.ID]
		b.mu.Unlock()
		if p == nil {
			continue
		}
		if ev.Status == "progress" {
			b.reply(p.client, ev.ID, "progress", ev.Msg, 0)
		} else {
			b.finish(ev.ID, ev.Status, ev.Msg, ev.Code)
		}
	}
}