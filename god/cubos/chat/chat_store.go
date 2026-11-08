// cubos/chat/chat_store.go
package chat

import (
	"context"
	"crypto/rand"
	"fmt"
	"sort"
	"strings"
	"time"

	kivik "github.com/go-kivik/kivik/v4"
)

// ============================================================
//  TYPES (CouchDB documents)
// ============================================================

type ConvDoc struct {
	ID       string    `json:"_id"`
	Rev      string    `json:"_rev,omitempty"`
	Type     string    `json:"type"`
	IDs      []string  `json:"ids"`
	Modified int64     `json:"modified"`
	Last     *ConvLast `json:"last,omitempty"`
}

type ConvLast struct {
	UID   string `json:"uid"`
	Verba string `json:"verba"`
	C     string `json:"c"`
	T     int64  `json:"t"`
}

type MsgDoc struct {
	ID   string `json:"_id"`
	Rev  string `json:"_rev,omitempty"`
	Type string `json:"type"`
	UID  string `json:"uid"`
	C    string `json:"c"`
	T    int64  `json:"t"`
}

// ============================================================
//  HELPERS
// ============================================================

// newULID — sortable, monotonic, CouchDB-friendly message id suffix
func newULID() string {
	ms := time.Now().UnixMilli()
	var rnd [10]byte
	_, _ = rand.Read(rnd[:])
	const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
	var out [26]byte
	t := ms
	for i := 9; i >= 0; i-- {
		out[i] = alphabet[t&0x1f]
		t >>= 5
	}
	for i := 0; i < 16; i++ {
		out[10+i] = alphabet[rnd[i%len(rnd)]&0x1f]
	}
	return string(out[:])
}

// newUUID — για group conversations
func newUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}

// ConvID — deterministic για 1-1 (sorted), random για groups
func ConvID(uids []string) string {
	if len(uids) == 2 {
		sorted := make([]string, 2)
		copy(sorted, uids)
		sort.Strings(sorted)
		return fmt.Sprintf("conv:%s-%s", sorted[0], sorted[1])
	}
	return fmt.Sprintf("conv:%s", newUUID())
}

// MsgID — "msg:<short-cid>:<ULID>"
func MsgID(convID, ulidStr string) string {
	short := strings.TrimPrefix(convID, "conv:")
	return fmt.Sprintf("msg:%s:%s", short, ulidStr)
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}

func isNotFound(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "not_found") ||
		strings.Contains(err.Error(), "missing")
}

func isConflict(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "conflict")
}

// ============================================================
//  COUCHDB STORE
// ============================================================

// SaveMessage — γράφει msg doc + ενημερώνει conv.last (με retry για conflicts)
func SaveMessage(ctx context.Context, db *kivik.DB, convID, uid, text string) (*MsgDoc, error) {
	if db == nil {
		return nil, fmt.Errorf("SaveMessage: db not initialized")
	}

	now := time.Now().Unix()
	ulidStr := newULID()
	msgID := MsgID(convID, ulidStr)

	msg := &MsgDoc{
		ID:   msgID,
		Type: "message",
		UID:  uid,
		C:    text,
		T:    now,
	}
	if _, err := db.Put(ctx, msgID, msg); err != nil {
		return nil, fmt.Errorf("SaveMessage: put msg: %w", err)
	}

	for attempt := 0; attempt < 3; attempt++ {
		conv, err := GetConv(ctx, db, convID)
		if err != nil {
			return msg, fmt.Errorf("SaveMessage: get conv: %w", err)
		}
		if conv == nil {
			return msg, fmt.Errorf("SaveMessage: conv %s not found", convID)
		}
		conv.Last = &ConvLast{
			UID:   uid,
			Verba: text,
			C:     truncate(text, 80),
			T:     now,
		}
		conv.Modified = now
		if _, err := db.Put(ctx, conv.ID, conv); err != nil {
			if isConflict(err) {
				time.Sleep(time.Duration(10*(attempt+1)) * time.Millisecond)
				continue
			}
			return msg, fmt.Errorf("SaveMessage: put conv: %w", err)
		}
		return msg, nil
	}
	return msg, fmt.Errorf("SaveMessage: conv update conflict after 3 retries")
}

// EnsureConv — επιστρέφει υπάρχουσα ή δημιουργεί νέα conversation
func EnsureConv(ctx context.Context, db *kivik.DB, ids []string) (*ConvDoc, error) {
	id := ConvID(ids)
	existing, err := GetConv(ctx, db, id)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return existing, nil
	}
	conv := &ConvDoc{
		ID:       id,
		Type:     "conversation",
		IDs:      ids,
		Modified: time.Now().Unix(),
	}
	if _, err := db.Put(ctx, conv.ID, conv); err != nil {
		if isConflict(err) {
			return GetConv(ctx, db, id)
		}
		return nil, err
	}
	return conv, nil
}

// GetConv — επιστρέφει (nil, nil) αν δεν υπάρχει
func GetConv(ctx context.Context, db *kivik.DB, id string) (*ConvDoc, error) {
	var doc ConvDoc
	err := db.Get(ctx, id).ScanDoc(&doc)
	if err != nil {
		if isNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return &doc, nil
}

// ListMessages — όλα τα μηνύματα ενός conversation, ταξινομημένα
func ListMessages(ctx context.Context, db *kivik.DB, convID string) ([]MsgDoc, error) {
	if db == nil {
		return nil, fmt.Errorf("ListMessages: db not initialized")
	}
	short := strings.TrimPrefix(convID, "conv:")
	startKey := fmt.Sprintf("msg:%s:", short)
	endKey := startKey + "\uffff"

	rows := db.AllDocs(ctx, kivik.Params(map[string]any{
		"startkey":     startKey,
		"endkey":       endKey,
		"include_docs": true,
	}))
	defer rows.Close()

	var out []MsgDoc
	for rows.Next() {
		var m MsgDoc
		if err := rows.ScanDoc(&m); err != nil {
			continue
		}
		out = append(out, m)
	}
	return out, rows.Err()
}
