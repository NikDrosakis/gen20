package core

import (
	"log"
	"net/url"
	"time"

	"github.com/gorilla/websocket"
)

// ConnectToWebSocket establishes a connection to the WebSocket server
func ConnectToWebSocket() {
	serverURL := "wss://vivalibro.com:3006/userid=god"

	u := url.URL{Scheme: "wss", Host: "vivalibro.com:3006", Path: "/", RawQuery: "userid=god"}
	log.Printf("Connecting to %s", u.String())

	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatalf("Failed to connect to WebSocket server: %v", err)
		return
	}
	defer conn.Close()

	done := make(chan struct{})

	// Start a goroutine to read messages from the server
	go func() {
		defer close(done)
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error reading message:", err)
				return
			}
			log.Printf("Received message: %s", message)
		}
	}()

	// Send a ping message periodically to keep the connection alive
	ticker := time.NewTicker(time.Second * 10)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case t := <-ticker.C:
			err := conn.WriteMessage(websocket.TextMessage, []byte("ping"))
			if err != nil {
				log.Println("Error sending ping message:", err)
				return
			}
			log.Printf("Sent ping at %s", t)
		}
	}
}
