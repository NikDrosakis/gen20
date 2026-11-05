// god/core/conversation_flusher.go
package core

import (
	"context"
	"log"
	"time"
)

// ConversationFlusher γράφει ανά διαστήματα τα dirty conversations από Redis → CouchDB.
type ConversationFlusher struct {
	redis    *Gredis
	couch    *Gcouch
	interval time.Duration
	cancel   context.CancelFunc
	done     chan struct{}
}

func NewConversationFlusher(redis *Gredis, couch *Gcouch, interval time.Duration) *ConversationFlusher {
	if interval <= 0 {
		interval = 30 * time.Second
	}
	return &ConversationFlusher{
		redis:    redis,
		couch:    couch,
		interval: interval,
		done:     make(chan struct{}),
	}
}

// Start ξεκινά το background flush loop.
func (f *ConversationFlusher) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	f.cancel = cancel

	go func() {
		defer close(f.done)
		ticker := time.NewTicker(f.interval)
		defer ticker.Stop()

		log.Printf("💾 ConversationFlusher: started (interval=%s)", f.interval)

		for {
			select {
			case <-ctx.Done():
				log.Println("💾 ConversationFlusher: stopping, final flush...")
				f.flushAll()
				return
			case <-ticker.C:
				f.flushAll()
			}
		}
	}()
}

// Stop σταματάει τον flusher και κάνει ένα τελευταίο flush.
func (f *ConversationFlusher) Stop() {
	if f.cancel != nil {
		f.cancel()
		<-f.done
	}
}

// flushAll γράφει όλα τα dirty conversations στο CouchDB.
func (f *ConversationFlusher) flushAll() {
	ctx := context.Background()

	dirty, err := f.redis.ListDirty()
	if err != nil {
		log.Printf("❌ ConversationFlusher: list dirty: %v", err)
		return
	}

	if len(dirty) == 0 {
		return
	}

	log.Printf("💾 ConversationFlusher: flushing %d conversation(s)", len(dirty))

	for _, cid := range dirty {
		if err := f.flushOne(ctx, cid); err != nil {
			log.Printf("❌ ConversationFlusher: cid=%d: %v", cid, err)
			continue
		}
	}
}

// flushOne γράφει ένα conversation στο CouchDB.
func (f *ConversationFlusher) flushOne(ctx context.Context, cid int) error {
	conv, err := f.redis.GetConversation(cid)
	if err != nil {
		return err
	}
	if conv == nil {
		// Δεν υπάρχει πια στο Redis — clear dirty
		return f.redis.ClearDirty(cid)
	}

	// Έλεγχος αν υπάρχει ήδη στο CouchDB για _rev
	id := conversationDocID(cid)
var existing Conversation
if err := f.couch.Get(ctx, f.couch.MainDB(), id, &existing); err == nil {
		conv.Rev = existing.Rev
	}

	conv.ID = id
	conv.Type = "conversation"

	if _, err := f.couch.MainDB().Put(ctx, id, conv); err != nil {
		return err
	}

	// Καθαρισμός dirty
	return f.redis.ClearDirty(cid)
}

func conversationDocID(cid int) string {
	return "conversation:" + itoa(cid)
}

func itoa(n int) string {
	// μικρό helper, αποφεύγουμε strconv για συντομία
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}