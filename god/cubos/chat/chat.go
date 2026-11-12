// cubos/chat/chat.go
package chat

import (
	"god/core"
	"god/cubos"
)

// Register — καλείται από τον aggregator μέσω registry
func Register(hub *core.Hub, couch *core.Gcouch) {
	core.RegisterWSHook(&wsHandler{})
}

// init — εγγράφει το chat στο cubo registry
func init() {
	cubos.RegisterCubo("chat", func(a *cubos.Aggregator) {
		Register(a.Hub(), a.Couch())
	})
}
