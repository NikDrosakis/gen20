// cubos/chat/couchdb.go
package chat

import (
    "context"
    "fmt"
    "sync"

    kivik "github.com/go-kivik/kivik/v4"
    "god/core"
)

const chatDBName = "gen_chat"

var (
    chatDBOnce sync.Once
    chatDB     *kivik.DB
    chatDBErr  error
)

// ChatDB — singleton, δημιουργείται μία φορά
func ChatDB(couch *core.Gcouch) (*kivik.DB, error) {
    chatDBOnce.Do(func() {
        client := couch.Client()
        if client == nil {
            chatDBErr = fmt.Errorf("chat: couch client is nil")
            return
        }
        // Δημιουργία αν δεν υπάρχει (idempotent)
        _ = client.CreateDB(context.Background(), chatDBName)
        chatDB = client.DB(chatDBName)
    })
    return chatDB, chatDBErr
}