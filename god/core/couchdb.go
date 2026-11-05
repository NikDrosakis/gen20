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

// ===== DOCUMENT TYPES =====

// BaseDoc — embedded σε όλα τα documents
type BaseDoc struct {
	ID   string `json:"_id,omitempty"`
	Rev  string `json:"_rev,omitempty"`
	Type string `json:"type"`
}

// BootstrapMessage  — το πρώτο document (bootstrap/schema marker)
type BootstrapMessage  struct {
	BaseDoc
	Version   string          `json:"version"`
	CreatedAt int64           `json:"created_at"`
	Payload   json.RawMessage `json:"payload,omitempty"`
}

// Conversation — μήνυμα-first document για chat
type Conversation struct {
	BaseDoc
	CID          int                    `json:"cid"`
	Participants map[string]Participant `json:"participants"`
	Modified     int64                  `json:"modified"`
	Chat         []ChatMessage          `json:"chat"`
}

type Participant struct {
	UID     int     `json:"uid"`
	Unread  int     `json:"unread"`
	Profile Profile `json:"profile"`
}

type Profile struct {
	Name  string `json:"name"`
	FName string `json:"fname"`
	Img   string `json:"img"`
}

type ChatMessage struct {
	ID  string `json:"id"`
	UID int    `json:"uid"`
	C   string `json:"c"`
	T   int64  `json:"t"`
}

// ===== GPM (Gen20 Package Manager) =====

type GPMRoot struct {
	BaseDoc
	Version   string `json:"version"`
	CreatedAt int64  `json:"created_at"`
}

type Cubo struct {
	BaseDoc
	Domain    string                 `json:"domain"`
	Name      string                 `json:"name"`
	Path      string                 `json:"path"`
	Kind      string                 `json:"kind"`
	View      string                 `json:"view,omitempty"`
	Props     map[string]interface{} `json:"props,omitempty"`
	Deps      []string               `json:"deps,omitempty"`
	Preview   string                 `json:"preview,omitempty"`
	Sort      int                    `json:"sort"`
	CreatedAt int64                  `json:"created_at"`
	UpdatedAt int64                  `json:"updated_at"`
}

type CuboLayout struct {
	BaseDoc
	Domain string `json:"domain"`
	Page   string `json:"page"`
	Area   string `json:"area"`
	CuboID string `json:"cubo_id"`
	Sort   int    `json:"sort"`
}

// ===== CLIENT =====

type Gcouch struct {
	client *kivik.Client
	mainDB *kivik.DB
	gpmDB  *kivik.DB
	ctx    context.Context
}

// NewGcouch συνδέεται στο CouchDB.
// Περιμένει COUCHDB_URI (π.χ. http://admin:pass@localhost:5984)
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

// EnsureDB δημιουργεί τη database αν δεν υπάρχει.
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

// ===== BOOTSTRAP =====

func (g *Gcouch) Bootstrap() error {
	ctx := g.ctx

	mainDB, err := g.EnsureDB(ctx, "god")
	if err != nil {
		return err
	}
	g.mainDB = mainDB

	gpmDB, err := g.EnsureDB(ctx, "gpm")
	if err != nil {
		return err
	}
	g.gpmDB = gpmDB

	if err := g.ensureMessage(ctx); err != nil {
		return fmt.Errorf("bootstrap: message: %w", err)
	}
	if err := g.ensureGPMRoot(ctx); err != nil {
		return fmt.Errorf("bootstrap: gpm root: %w", err)
	}
	return nil
}

func (g *Gcouch) ensureMessage(ctx context.Context) error {
    const id = "message"
    var existing BootstrapMessage  // ← πρέπει να είναι BootstrapMessage
    if err := g.Get(ctx, g.mainDB, id, &existing); err == nil {
        if existing.Version != "1.0.0" {
            // TODO: migration
        }
        return nil
    }

    msg := BootstrapMessage{  // ← πρέπει να είναι BootstrapMessage
        BaseDoc:   BaseDoc{ID: id, Type: "message"},
        Version:   "1.0.0",
        CreatedAt: time.Now().Unix(),
    }

    if _, err := g.Put(ctx, g.mainDB, id, msg); err != nil {
        return err
    }
    return nil
}

func (g *Gcouch) ensureGPMRoot(ctx context.Context) error {
	const id = "gpm:root"
	var existing GPMRoot
	if err := g.gpmDB.Get(ctx, id).ScanDoc(&existing); err == nil {
		return nil
	}

	root := GPMRoot{
		BaseDoc:   BaseDoc{ID: id, Type: "gpm_root"},
		Version:   "1.0.0",
		CreatedAt: time.Now().Unix(),
	}
	_, err := g.gpmDB.Put(ctx, id, root)
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

// ===== DOMAIN-SPECIFIC =====

func (g *Gcouch) MainDB() *kivik.DB { return g.mainDB }
func (g *Gcouch) GPMDB() *kivik.DB  { return g.gpmDB }

func (g *Gcouch) PutCubo(ctx context.Context, c *Cubo) error {
	now := time.Now().Unix()
	c.UpdatedAt = now
	if c.CreatedAt == 0 {
		c.CreatedAt = now
	}
	if c.ID == "" {
		c.ID = fmt.Sprintf("cubo:%s:%s", c.Domain, c.Name)
	}
	c.Type = "cubo"

	_, err := g.gpmDB.Put(ctx, c.ID, c)
	return err
}

func (g *Gcouch) ListCubosByDomain(ctx context.Context, domain string) ([]Cubo, error) {
	selector := map[string]interface{}{
		"type":   "cubo",
		"domain": domain,
	}
	var out []Cubo
	if err := g.Find(ctx, g.gpmDB, selector, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (g *Gcouch) PutLayout(ctx context.Context, l *CuboLayout) error {
	if l.ID == "" {
		l.ID = fmt.Sprintf("layout:%s:%s:%s:%s", l.Domain, l.Page, l.Area, l.CuboID)
	}
	l.Type = "cubo_layout"
	_, err := g.gpmDB.Put(ctx, l.ID, l)
	return err
}

func (g *Gcouch) GetPageCubo(ctx context.Context, domain, page string) (map[string][]Cubo, error) {
	selector := map[string]interface{}{
		"type":   "cubo_layout",
		"domain": domain,
		"page":   page,
	}
	var layouts []CuboLayout
	if err := g.Find(ctx, g.gpmDB, selector, &layouts); err != nil {
		return nil, err
	}

	result := map[string][]Cubo{
		"h": {}, "sl": {}, "m": {}, "sr": {}, "f": {},
	}
	for _, l := range layouts {
		var c Cubo
		if err := g.gpmDB.Get(ctx, l.CuboID).ScanDoc(&c); err != nil {
			continue
		}
		if _, ok := result[l.Area]; ok {
			result[l.Area] = append(result[l.Area], c)
		}
	}
	return result, nil
}

func (g *Gcouch) Close() error {
	return g.client.Close()
}