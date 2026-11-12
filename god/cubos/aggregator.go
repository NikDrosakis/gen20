// cubos/aggregator.go
package cubos

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"

	"github.com/gin-gonic/gin"

	"god/core"
)

// ============================================================
//  CUBO REGISTRY (global)
// ============================================================

// CuboFunc — function που καλείται για register ενός cubo
type CuboFunc func(a *Aggregator)

// registry — global map από όνομα cubo → register function
var registry = make(map[string]CuboFunc)

// RegisterCubo — καλείται από init() κάθε cubo
func RegisterCubo(name string, fn CuboFunc) {
	if _, exists := registry[name]; exists {
		log.Printf("[cubos] ⚠️  duplicate registration: %s", name)
	}
	registry[name] = fn
}

// ============================================================
//  MANIFEST
// ============================================================

type CuboEntry struct {
	Name         string   `json:"name"`
	Enabled      bool     `json:"enabled"`
	Location     string   `json:"location,omitempty"`
	Package      string   `json:"package,omitempty"`
	Register     string   `json:"register,omitempty"`
	RegisterLine string   `json:"register_line"`
	Signature    string   `json:"signature,omitempty"`
	Endpoints    []string `json:"endpoints,omitempty"`
	Files        []string `json:"files,omitempty"`
}

type Manifest struct {
	Version string      `json:"version"`
	Cubos   []CuboEntry `json:"cubos"`
}

func loadManifest() (*Manifest, error) {
	paths := []string{
		"cubos/manifest.json",
		"./cubos/manifest.json",
		"/var/www/gs/god/cubos/manifest.json",
	}

	if exe, err := os.Executable(); err == nil {
		paths = append(paths, filepath.Join(filepath.Dir(exe), "cubos", "manifest.json"))
	}

	for _, p := range paths {
		data, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		var m Manifest
		if err := json.Unmarshal(data, &m); err != nil {
			return nil, fmt.Errorf("manifest %s: %w", p, err)
		}
		log.Printf("[cubos] loaded manifest: %s (%d cubos)", p, len(m.Cubos))
		return &m, nil
	}
	return nil, fmt.Errorf("manifest.json not found")
}

// ============================================================
//  AGGREGATOR
// ============================================================

type Aggregator struct {
	router *gin.Engine
	hub    *core.Hub
	couch  *core.Gcouch
	base   string
}

func NewAggregator(router *gin.Engine, hub *core.Hub, couch *core.Gcouch) *Aggregator {
	return &Aggregator{
		router: router,
		hub:    hub,
		couch:  couch,
		base:   "/god/v1",
	}
}

func (a *Aggregator) RegisterAll() {
	log.Println("[cubos] registering...")

	manifest, err := loadManifest()
	if err != nil {
		log.Printf("[cubos] ❌ %v", err)
		log.Println("[cubos] no manifest — nothing registered")
		return
	}

	// Sort by name για deterministic order
	sort.Slice(manifest.Cubos, func(i, j int) bool {
		return manifest.Cubos[i].Name < manifest.Cubos[j].Name
	})

	okCount := 0
	failCount := 0

	for _, cubo := range manifest.Cubos {
		if !cubo.Enabled {
			log.Printf("[cubos] ⏭  %s (disabled)", cubo.Name)
			continue
		}

		fn, exists := registry[cubo.Name]
		if !exists {
			log.Printf("[cubos] ⚠️  %s — no register function (cubo not imported?)", cubo.Name)
			failCount++
			continue
		}

		fn(a)
		log.Printf("[cubos] ✓ %s", cubo.Name)
		okCount++
	}

	log.Printf("[cubos] all registered (ok=%d, fail=%d)", okCount, failCount)
}

// RegisterAll — convenience για main.go
func RegisterAll(router *gin.Engine, hub *core.Hub, couch *core.Gcouch) {
	NewAggregator(router, hub, couch).RegisterAll()
}

// Accessors για τα cubos
func (a *Aggregator) Router() *gin.Engine { return a.router }
func (a *Aggregator) Hub() *core.Hub      { return a.hub }
func (a *Aggregator) Couch() *core.Gcouch { return a.couch }
func (a *Aggregator) Base() string        { return a.base }
