// cubos/aggregator.go
package cubos

import (
	"log"

	"github.com/gin-gonic/gin"

	"god/core"
//	"god/cubos/chat"
	"god/cubos/mermaid"
	"god/cubos/terminal"
)

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

	// Core: hosts + bind + ssl + setup (όλα στο core.Register)
	core.Register(a.router)
	log.Println("[cubos] ✓ core (hosts/bind/ssl/setup)")

	// Core: build
	core.RegisterBuildRoutes(a.router, a.base)
	log.Println("[cubos] ✓ build")

	// Cubos
//	chat.Register(a.router, a.hub, a.couch)
//	log.Println("[cubos] ✓ chat")

	mermaid.RegisterRoutes(a.router)
	log.Println("[cubos] ✓ mermaid")

	terminal.RegisterRoutes(a.router)
	log.Println("[cubos] ✓ terminal")

	log.Println("[cubos] all registered")
}

// RegisterAll — convenience για main.go
func RegisterAll(router *gin.Engine, hub *core.Hub, couch *core.Gcouch) {
	NewAggregator(router, hub, couch).RegisterAll()
}
