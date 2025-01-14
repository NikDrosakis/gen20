package main

import (
	"fmt"
	"log"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/gorilla/websocket"
	"god/services/claude"
	"god/services/mermaid"
	"god/core"
)

func main() {
	// Load environment variables
	godotenv.Load()

// Initialize a new Gredis instance
gredisInstance, err := core.NewGredis()
if err != nil {
    log.Fatalf("Failed to create Gredis instance: %v", err)
}

// Retrieve and print all keys
keys, err := gredisInstance.Keys("*") // "*" pattern retrieves all keys
if err != nil {
    log.Fatalf("Failed to retrieve keys: %v", err)
}
fmt.Printf("Keys: %v\n", keys)
	// Initialize action loop
	//go action.ActionLoop()

	// Get API keys from environment variables
	claudeAPIKey := os.Getenv("CLAUDE_APIKEY")

	// Initialize Gin router
	router := gin.Default()

	// Register the Mermaid routes
	mermaid.RegisterRoutes(router)

	// Initialize Claude client
	claudeClient := claude.NewClient(claudeAPIKey)

	// Set up routes for Claude
	router = claudeClient.SetupRouter(router)

	// Example WebSocket route (if needed)
	router.GET("/ws", func(c *gin.Context) {
		upgrader := websocket.Upgrader{}
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Println("Error upgrading connection:", err)
			return
		}
		defer conn.Close()

		for {
			messageType, p, err := conn.ReadMessage()
			if err != nil {
				log.Println("Error reading message:", err)
				return
			}
			log.Printf("Received message: %s\n", string(p))
			err = conn.WriteMessage(messageType, p)
			if err != nil {
				log.Println("Error writing message:", err)
				return
			}
		}
	})


	// Initialize WebSocket client
	wsClient, err := core.NewWebSocketClient()
	if err != nil {
		log.Fatalf("Failed to create WebSocket client: %v", err)
	}
	defer wsClient.Close()

	// Send the structured message
	err = wsClient.SendMessage()
	if err != nil {
		log.Fatalf("Failed to send message: %v", err)
	}

	log.Println("Message sent successfully.")


	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3006"
	}
	log.Printf("Server starting on port %s\n", port)
	router.Run(fmt.Sprintf(":%s", port))
}
