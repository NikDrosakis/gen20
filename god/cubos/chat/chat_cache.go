// cubos/chat/chat_cache.go
package chat

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"god/core"
)

// Redis keys:
//   chat:conv:<cid>          → ConvDoc JSON
//   chat:msgs:<cid>          → λίστα από MsgDoc (append-only)
//   chat:conversations:dirty → set από cids που άλλαξαν

func convKey(cid string) string { return fmt.Sprintf("chat:conv:%s", cid) }
func msgsKey(cid string) string { return fmt.Sprintf("chat:msgs:%s", cid) }

const dirtyKey = "chat:conversations:dirty"

// CacheConv — γράφει ConvDoc στο Redis (TTL 1 ώρα)
func CacheConv(r *core.Gredis, conv *ConvDoc) error {
	b, err := json.Marshal(conv)
	if err != nil {
		return err
	}
	return r.Set(convKey(conv.ID), string(b), 3600)
}

// GetCachedConv — διαβάζει ConvDoc από Redis
func GetCachedConv(r *core.Gredis, cid string) (*ConvDoc, error) {
	val, err := r.Get(convKey(cid))
	if err != nil || val == "" {
		return nil, err
	}
	var conv ConvDoc
	if err := json.Unmarshal([]byte(val), &conv); err != nil {
		return nil, err
	}
	return &conv, nil
}

// CacheMessage — προσθέτει MsgDoc σε Redis list (RPUSH)
func CacheMessage(r *core.Gredis, msg *MsgDoc) error {
	b, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	// Το cid εξάγεται από το _id: "msg:<cid>:<ulid>"
	parts := strings.SplitN(strings.TrimPrefix(msg.ID, "msg:"), ":", 2)
	if len(parts) != 2 {
		return fmt.Errorf("CacheMessage: bad msg id %q", msg.ID)
	}
	cid := parts[0]

	client := r.Client()
	if err := client.RPush(r.Ctx(), msgsKey(cid), string(b)).Err(); err != nil {
		return err
	}
	// TTL 1 ώρα
	return client.Expire(r.Ctx(), msgsKey(cid), time.Hour).Err()
}

// MarkDirty — σημαδεύει conversation για flush στο CouchDB
func MarkDirty(r *core.Gredis, cid string) error {
	return r.SAdd(dirtyKey, cid)
}

// ClearDirty — αφαιρεί από dirty set (μετά από flush)
func ClearDirty(r *core.Gredis, cid string) error {
	return r.SRem(dirtyKey, cid)
}

// ListDirty — όλα τα cids που θέλουν flush
func ListDirty(r *core.Gredis) ([]string, error) {
	return r.SMembers(dirtyKey)
}
