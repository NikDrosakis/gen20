// god/cubos/terminal/terminal.go
// PTY WebSocket terminal — τρέχει το SOL shell (gen.sh) με το gen> prompt.
package terminal

import (
	"net/http"
	"os"
	"os/exec"
	"syscall"

	"github.com/creack/pty"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"god/cubos"
)

const SOL_SH = "/var/www/gs/sol/gen.sh"

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// init — εγγράφει το terminal στο cubo registry (όπως το chat)
func init() {
	cubos.RegisterCubo("terminal", func(a *cubos.Aggregator) {
		RegisterRoutes(a.Router())
	})
}

// RegisterRoutes — WebSocket endpoint για το PTY terminal
func RegisterRoutes(router *gin.Engine) {
	router.GET("/god/v1/pty", handleWS)
}

func handleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	// SOL shell (gen>) — plain text PTY
	cmd := exec.Command("bash", SOL_SH)
	cmd.Dir = "/var/www/gs"
	cmd.Env = append(os.Environ(),
		"TERM=xterm-256color",
		"COLUMNS=80", "LINES=24",
	)

	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{Cols: 80, Rows: 24})
	if err != nil {
		_ = conn.WriteMessage(
			websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseInternalServerErr, "PTY start failed"),
		)
		return
	}

	defer func() {
		_ = ptmx.Close()
		if cmd.Process != nil {
			_ = syscall.Kill(-cmd.Process.Pid, syscall.SIGTERM)
			_ = cmd.Process.Kill()
			_ = cmd.Wait()
		}
	}()

	conn.SetReadLimit(1024 * 1024)

	// PTY → WebSocket (plain text)
	go func() {
		buf := make([]byte, 32*1024)
		for {
			n, readErr := ptmx.Read(buf)
			if n > 0 {
				if writeErr := conn.WriteMessage(websocket.TextMessage, buf[:n]); writeErr != nil {
					return
				}
			}
			if readErr != nil {
				return
			}
		}
	}()

	// WebSocket → PTY
	for {
		messageType, message, readErr := conn.ReadMessage()
		if readErr != nil {
			break
		}

		// legacy: αν έρθει binary με frame byte, αφαίρεσέ το
		if messageType == websocket.BinaryMessage {
			if len(message) > 1 {
				message = message[1:]
			} else {
				continue
			}
		}
		if len(message) == 0 {
			continue
		}

		if _, err := ptmx.Write(message); err != nil {
			break
		}
	}
}
