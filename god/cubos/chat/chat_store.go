// cubos/chat/chat_store.go
package chat

import (
    "context"
    "crypto/rand"
    "fmt"
    "sort"
    "time"

    kivik "github.com/go-kivik/kivik/v4"
)

// ============================================================
//  TYPES
// ============================================================

type ConvDoc struct {
    ID       string   `json:"_id"`
    Rev      string   `json:"_rev,omitempty"`
    Type     string   `json:"type"`
    CID      string   `json:"cid"`
    IDs      []string `json:"ids"`
    Modified int64    `json:"modified"`
}

type MsgDoc struct {
    ID       string `json:"_id"`
    Rev      string `json:"_rev,omitempty"`
    Type     string `json:"type"`
    CID      string `json:"cid"`
    UID      string `json:"uid"`
    C        string `json:"c"`
    Modified int64  `json:"modified"`
}

// ============================================================
//  HELPERS
// ============================================================

// CID — deterministic από 2 uids
func CID(uids []string) string {
    if len(uids) == 2 {
        sorted := make([]string, 2)
        copy(sorted, uids)
        sort.Strings(sorted)
        return fmt.Sprintf("%s-%s", sorted[0], sorted[1])
    }
    return ""
}

// genID — τυχαίο hex id (32 chars, CouchDB-friendly)
func genID() string {
    b := make([]byte, 16)
    _, _ = rand.Read(b)
    return fmt.Sprintf("%032x", b)
}

// nowUnix
func nowUnix() int64 {
    return time.Now().Unix()
}

// ============================================================
//  STORE
// ============================================================

// EnsureConv — δημιουργεί ή επιστρέφει conversation
func EnsureConv(ctx context.Context, db *kivik.DB, ids []string) (*ConvDoc, error) {
    if db == nil {
        return nil, fmt.Errorf("EnsureConv: db not initialized")
    }

    cid := CID(ids)
    if cid == "" {
        return nil, fmt.Errorf("EnsureConv: need 2 uids")
    }

    // Ψάξε υπάρχον με _find
    selector := map[string]any{
        "type": "conversation",
        "cid":  cid,
    }
    result := db.Find(ctx, selector)

    var existing ConvDoc
    if result.Next() {
        if err := result.ScanDoc(&existing); err == nil && existing.ID != "" {
            result.Close()
            return &existing, nil
        }
    }
    result.Close()

    // Δεν βρέθηκε — δημιούργησε με _id
    conv := &ConvDoc{
        ID:       genID(),
        Type:     "conversation",
        CID:      cid,
        IDs:      ids,
        Modified: nowUnix(),
    }
    if _, err := db.Put(ctx, conv.ID, conv); err != nil {
        return nil, fmt.Errorf("EnsureConv: put: %w", err)
    }
    return conv, nil
}

// SaveMessage — προσθέτει μήνυμα
func SaveMessage(ctx context.Context, db *kivik.DB, cid, uid, content string) (*MsgDoc, error) {
    if db == nil {
        return nil, fmt.Errorf("SaveMessage: db not initialized")
    }
    if cid == "" {
        return nil, fmt.Errorf("SaveMessage: cid required")
    }

    now := nowUnix()

    msg := &MsgDoc{
        ID:       genID(),
        Type:     "message",
        CID:      cid,
        UID:      uid,
        C:        content,
        Modified: now,
    }
    if _, err := db.Put(ctx, msg.ID, msg); err != nil {
        return nil, fmt.Errorf("SaveMessage: put: %w", err)
    }

    return msg, nil
}

// ListMessages — όλα τα μηνύματα ενός cid, order by modified asc
func ListMessages(ctx context.Context, db *kivik.DB, cid string) ([]MsgDoc, error) {
    if db == nil {
        return nil, fmt.Errorf("ListMessages: db not initialized")
    }

    selector := map[string]any{
        "type": "message",
        "cid":  cid,
    }
    result := db.Find(ctx, selector)
    defer result.Close()

    var out []MsgDoc
    for result.Next() {
        var m MsgDoc
        if err := result.ScanDoc(&m); err != nil {
            continue
        }
        out = append(out, m)
    }

    sort.Slice(out, func(i, j int) bool {
        return out[i].Modified < out[j].Modified
    })

    return out, result.Err()
}

// GetConversation — φέρνει conversation από cid
func GetConversation(ctx context.Context, db *kivik.DB, cid string) (*ConvDoc, error) {
    selector := map[string]any{
        "type": "conversation",
        "cid":  cid,
    }
    result := db.Find(ctx, selector)
    defer result.Close()

    if result.Next() {
        var conv ConvDoc
        if err := result.ScanDoc(&conv); err == nil {
            return &conv, nil
        }
    }
    return nil, nil
}