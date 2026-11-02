package main

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
	terminalData   byte = 0x30
	terminalResize byte = 0x31
	terminalTitle  byte = 0x32
)

var terminalUpgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	// Η προεπιλεγμένη συμπεριφορά του Gorilla ελέγχει το Origin
	// έναντι του Origin του request.
}

type terminalSize struct {
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

func terminalWS(c *gin.Context) {
	// Απαραίτητος έλεγχος ταυτότητας πριν από το Upgrade.
	// Θα συνδεθεί με το υπάρχον authentication middleware του GOD.

	conn, err := terminalUpgrader.Upgrade(c.Writer, c.Request, nil)
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

		// Το PTY δημιουργεί ξεχωριστό session/process group.
		// Τερματίζουμε και τυχόν child processes του shell.
		if cmd.Process != nil {
			_ = syscall.Kill(-cmd.Process.Pid, syscall.SIGTERM)
			_ = cmd.Process.Kill()
			_ = cmd.Wait()
		}
	}()

	conn.SetReadLimit(1024 * 1024)

	// Μοναδικός writer προς το WebSocket.
	go func() {
		buf := make([]byte, 32*1024)

		for {
			n, readErr := ptmx.Read(buf)

			if n > 0 {
				frame := make([]byte, n+1)
				frame[0] = terminalData
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

	// Ο κύριος handler διαβάζει μόνο από το WebSocket.
	for {
		messageType, message, readErr := conn.ReadMessage()
		if readErr != nil {
			break
		}

		// Το Terminal.jsx στέλνει binary frames.
		if messageType != websocket.BinaryMessage || len(message) == 0 {
			continue
		}

		frameType := message[0]
		payload := message[1:]

		switch frameType {
		case terminalData:
			if len(payload) > 0 {
				if _, err := ptmx.Write(payload); err != nil {
					return
				}
			}

		case terminalResize:
			var size terminalSize

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

		case terminalTitle:
			// Δεν δεχόμαστε TITLE από τον client.
		}
	}
}