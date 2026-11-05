// god/core/gredis.go
package core

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

// ============================================================
// Gredis client
// ============================================================

// Gredis είναι ο wrapper για τον Redis client.
type Gredis struct {
	client *redis.Client
	ctx    context.Context
}

// NewGredis δημιουργεί έναν νέο Gredis client.
func NewGredis() (*Gredis, error) {
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}
	password := os.Getenv("REDIS_PASS")
	db := 0

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	ctx := context.Background()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("gredis: ping failed: %w", err)
	}

	return &Gredis{
		client: rdb,
		ctx:    ctx,
	}, nil
}

// Get επιστρέφει την τιμή για ένα key. Επιστρέφει ("", nil) αν το key δεν υπάρχει.
func (g *Gredis) Get(key string) (string, error) {
	val, err := g.client.Get(g.ctx, key).Result()
	if err == redis.Nil {
		return "", nil
	}
	return val, err
}

// Set γράφει μια τιμή με TTL σε δευτερόλεπτα. TTL=0 σημαίνει no expiration.
func (g *Gredis) Set(key, value string, ttl int) error {
	var expiration time.Duration
	if ttl > 0 {
		expiration = time.Duration(ttl) * time.Second
	}
	return g.client.Set(g.ctx, key, value, expiration).Err()
}

// Keys επιστρέφει όλα τα keys που ταιριάζουν με ένα pattern.
func (g *Gredis) Keys(pattern string) ([]string, error) {
	return g.client.Keys(g.ctx, pattern).Result()
}

// Client επιστρέφει τον underlying redis client (για προχωρημένες χρήσεις).
func (g *Gredis) Client() *redis.Client {
	return g.client
}

// Ctx επιστρέφει το context.
func (g *Gredis) Ctx() context.Context {
	return g.ctx
}

// ============================================================
// CONVERSATION HELPERS
// ============================================================

// ConversationKey επιστρέφει το Redis key για ένα conversation.
func ConversationKey(cid int) string {
	return fmt.Sprintf("conversation:%d", cid)
}

// GetConversation διαβάζει το conversation από Redis.
// Επιστρέφει (nil, nil) αν δεν υπάρχει.
func (g *Gredis) GetConversation(cid int) (*Conversation, error) {
	val, err := g.Get(ConversationKey(cid))
	if err != nil {
		return nil, err
	}
	if val == "" {
		return nil, nil
	}

	var conv Conversation
	if err := json.Unmarshal([]byte(val), &conv); err != nil {
		return nil, fmt.Errorf("gredis: unmarshal conversation %d: %w", cid, err)
	}
	return &conv, nil
}

// SetConversation γράφει το conversation στο Redis.
// TTL 0 = no expiration (persistent μέχρι flush).
func (g *Gredis) SetConversation(conv *Conversation) error {
	if conv == nil {
		return fmt.Errorf("gredis: conversation is nil")
	}
	conv.Modified = time.Now().Unix()

	b, err := json.Marshal(conv)
	if err != nil {
		return fmt.Errorf("gredis: marshal conversation: %w", err)
	}

	return g.Set(ConversationKey(conv.CID), string(b), 0)
}

// AppendMessage προσθέτει ένα μήνυμα στο conversation (read-modify-write).
// Επιστρέφει το ενημερωμένο conversation.
func (g *Gredis) AppendMessage(cid int, msg ChatMessage) (*Conversation, error) {
	conv, err := g.GetConversation(cid)
	if err != nil {
		return nil, err
	}
	if conv == nil {
		return nil, fmt.Errorf("gredis: conversation %d not found", cid)
	}

	conv.Chat = append(conv.Chat, msg)
	conv.Modified = time.Now().Unix()

	if err := g.SetConversation(conv); err != nil {
		return nil, err
	}
	return conv, nil
}

// UpdateUnread ενημερώνει το unread count για έναν participant.
func (g *Gredis) UpdateUnread(cid int, uid int, delta int) error {
	conv, err := g.GetConversation(cid)
	if err != nil {
		return err
	}
	if conv == nil {
		return fmt.Errorf("gredis: conversation %d not found", cid)
	}

	for k, p := range conv.Participants {
		if p.UID == uid {
			p.Unread += delta
			if p.Unread < 0 {
				p.Unread = 0
			}
			conv.Participants[k] = p
			break
		}
	}

	return g.SetConversation(conv)
}

// DeleteConversation διαγράφει από Redis (μετά από flush).
func (g *Gredis) DeleteConversation(cid int) error {
	return g.client.Del(g.ctx, ConversationKey(cid)).Err()
}

// ListConversationKeys επιστρέφει όλα τα cids που είναι ενεργά στο Redis.
func (g *Gredis) ListConversationKeys() ([]int, error) {
	keys, err := g.Keys("conversation:*")
	if err != nil {
		return nil, err
	}

	cids := make([]int, 0, len(keys))
	for _, k := range keys {
		var cid int
		if _, err := fmt.Sscanf(k, "conversation:%d", &cid); err == nil {
			cids = append(cids, cid)
		}
	}
	return cids, nil
}

// ============================================================
// DIRTY TRACKING
// ============================================================

// MarkDirty σημαδεύει ένα conversation ως "άλλαξε, χρειάζεται flush".
func (g *Gredis) MarkDirty(cid int) error {
	return g.client.SAdd(g.ctx, "conversations:dirty", cid).Err()
}

// ClearDirty αφαιρεί από το dirty set (μετά από επιτυχές flush).
func (g *Gredis) ClearDirty(cid int) error {
	return g.client.SRem(g.ctx, "conversations:dirty", cid).Err()
}

// ListDirty επιστρέφει όλα τα cids που χρειάζονται flush.
func (g *Gredis) ListDirty() ([]int, error) {
	vals, err := g.client.SMembers(g.ctx, "conversations:dirty").Result()
	if err != nil {
		return nil, err
	}

	cids := make([]int, 0, len(vals))
	for _, v := range vals {
		var cid int
		if _, err := fmt.Sscanf(v, "%d", &cid); err == nil {
			cids = append(cids, cid)
		}
	}
	return cids, nil
}