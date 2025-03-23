package core

import (
	"context"
	"encoding/json"
	"log"
	"net/url"
	"os"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
)

// WebSocketClient encapsulates the WebSocket connection
type WebSocketClient struct {
	client *websocket.Conn
	ctx    context.Context
}

// NewWebSocketClient initializes a new WebSocketClient instance
func NewWebSocketClient() (*WebSocketClient, error) {
	godotenv.Load()
	serverURL := os.Getenv("WEBSOCKET_URL")
	u, err := url.Parse(serverURL)
	if err != nil {
		return nil, err
	}

	conn, _, err := websocket.DefaultDialer.DialContext(context.Background(), u.String(), nil)
	if err != nil {
		return nil, err
	}

	return &WebSocketClient{
		client: conn,
		ctx:    context.Background(),
	}, nil
}

// SendMessage sends a structured message through the WebSocket connection
func (ws *WebSocketClient) SendMessage() error {
	message := map[string]string{
		"system":    "god",
		"domaffect": "*",
		"type":      "open",
		"verba":     "god pings",
		"userid":    "1",
		"to":        "1",
		"cast":      "one",
	}

	jsonMessage, err := json.Marshal(message)
	if err != nil {
		return err
	}

	err = ws.client.WriteMessage(websocket.TextMessage, jsonMessage)
	if err != nil {
		return err
	}
	log.Printf("Sent message: %s", jsonMessage)
	return nil
}

// Close gracefully closes the WebSocket connection
func (ws *WebSocketClient) Close() error {
	return ws.client.Close()
}
