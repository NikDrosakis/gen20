// god/core/couchdb.go
package core

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	kivik "github.com/go-kivik/kivik/v4"
	_ "github.com/go-kivik/kivik/v4/couchdb"
	"github.com/joho/godotenv"
)

// ===== DOCUMENT TYPES (generic) =====

type BaseDoc struct {
	ID   string `json:"_id,omitempty"`
	Rev  string `json:"_rev,omitempty"`
	Type string `json:"type"`
}

type BootstrapMessage struct {
	BaseDoc
	Version   string          `json:"version"`
	CreatedAt int64           `json:"created_at"`
	Payload   json.RawMessage `json:"payload,omitempty"`
}

// ===== CLIENT (generic) =====

type Gcouch struct {
	client *kivik.Client
	mainDB *kivik.DB
	ctx    context.Context
}

func NewGcouch() (*Gcouch, error) {
	godotenv.Load()

	uri := os.Getenv("COUCHDB_URI")
	if uri == "" {
		uri = "http://admin:password@localhost:5984"
	}

	client, err := kivik.New("couch", uri)
	if err != nil {
		return nil, fmt.Errorf("couchdb: connect failed: %w", err)
	}

	ctx := context.Background()

	if _, err := client.Ping(ctx); err != nil {
		return nil, fmt.Errorf("couchdb: ping failed: %w", err)
	}

	return &Gcouch{
		client: client,
		ctx:    ctx,
	}, nil
}

// EnsureDB — idempotent create
func (g *Gcouch) EnsureDB(ctx context.Context, name string) (*kivik.DB, error) {
	exists, err := g.client.DBExists(ctx, name)
	if err != nil {
		return nil, fmt.Errorf("couchdb: db exists check failed: %w", err)
	}
	if !exists {
		if err := g.client.CreateDB(ctx, name); err != nil {
			return nil, fmt.Errorf("couchdb: create db %q failed: %w", name, err)
		}
	}
	return g.client.DB(name), nil
}

// Bootstrap — ΜΟΝΟ το mainDB
func (g *Gcouch) Bootstrap() error {
	ctx := g.ctx

	mainDB, err := g.EnsureDB(ctx, "god")
	if err != nil {
		return err
	}
	g.mainDB = mainDB

	if err := g.ensureMessage(ctx); err != nil {
		return fmt.Errorf("bootstrap: message: %w", err)
	}
	return nil
}

func (g *Gcouch) ensureMessage(ctx context.Context) error {
	const id = "message"
	var existing BootstrapMessage
	if err := g.Get(ctx, g.mainDB, id, &existing); err == nil {
		return nil
	}

	msg := BootstrapMessage{
		BaseDoc:   BaseDoc{ID: id, Type: "message"},
		Version:   "1.0.0",
		CreatedAt: time.Now().Unix(),
	}

	_, err := g.Put(ctx, g.mainDB, id, msg)
	return err
}

// ===== GENERIC CRUD =====

func (g *Gcouch) Get(ctx context.Context, db *kivik.DB, id string, out interface{}) error {
	return db.Get(ctx, id).ScanDoc(out)
}

func (g *Gcouch) Put(ctx context.Context, db *kivik.DB, id string, doc interface{}) (string, error) {
	return db.Put(ctx, id, doc)
}

func (g *Gcouch) Find(ctx context.Context, db *kivik.DB, selector map[string]interface{}, out interface{}) error {
	result := db.Find(ctx, selector)

	var docs []json.RawMessage
	for result.Next() {
		var raw json.RawMessage
		if err := result.ScanDoc(&raw); err != nil {
			return err
		}
		docs = append(docs, raw)
	}
	if err := result.Err(); err != nil {
		return err
	}

	b, err := json.Marshal(docs)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, out)
}

// ===== ACCESSORS =====

func (g *Gcouch) Client() *kivik.Client { return g.client }
func (g *Gcouch) MainDB() *kivik.DB     { return g.mainDB }
func (g *Gcouch) Ctx() context.Context  { return g.ctx }

func (g *Gcouch) Close() error {
	return g.client.Close()
}