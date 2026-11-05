// god/services/terminal/terminal.go
package terminal

import (
	"encoding/json"
	"errors"
	"os"
	"os/exec"
	"syscall"
	"time"

	"github.com/creack/pty"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

const (
	FrameData   byte = 0x30
	FrameResize byte = 0x31
	FrameTitle  byte = 0x32
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
}

type sizePayload struct {
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

// RegisterRoutes συνδέει το WebSocket terminal με τον gin router.
func RegisterRoutes(router *gin.Engine) {
	router.GET("/god/v1/ws", handleWS)
}

func handleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	cmd := exec.Command("/bin/bash", "--login")
	cmd.Env = append(os.Environ(), "TERM=xterm-256color")

	ptmx, err := pty.StartWithSize(cmd, &pty.Winsize{
		Cols: 80,
		Rows: 24,
	})
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

	// PTY → WebSocket
	go func() {
		buf := make([]byte, 32*1024)

		for {
			n, readErr := ptmx.Read(buf)

			if n > 0 {
				frame := make([]byte, n+1)
				frame[0] = FrameData
				copy(frame[1:], buf[:n])

				if writeErr := conn.WriteMessage(websocket.BinaryMessage, frame); writeErr != nil {
					return
				}
			}

			if readErr != nil {
				if !errors.Is(readErr, os.ErrClosed) {
					_ = conn.WriteControl(
						websocket.CloseMessage,
						websocket.FormatCloseMessage(websocket.CloseNormalClosure, "PTY closed"),
						time.Now().Add(time.Second),
					)
				}
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

		if messageType != websocket.BinaryMessage || len(message) == 0 {
			continue
		}

		frameType := message[0]
		payload := message[1:]

		switch frameType {
		case FrameData:
			if len(payload) > 0 {
				if _, err := ptmx.Write(payload); err != nil {
					return
				}
			}

		case FrameResize:
			var size sizePayload
			if err := json.Unmarshal(payload, &size); err != nil {
				continue
			}
			if size.Cols == 0 || size.Rows == 0 {
				continue
			}
			if err := pty.Setsize(ptmx, &pty.Winsize{
				Cols: size.Cols,
				Rows: size.Rows,
			}); err != nil {
				return
			}

		case FrameTitle:
			// ignore
		}
	}
}