package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/gorilla/websocket"
	"god/services/claude"
//	"god/services/googleal" // Correct import path
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Get API keys from environment variables
//googleAPIKey := os.Getenv("GOOGLEAI_APIKEY")
	claudeAPIKey := os.Getenv("CLAUDE_APIKEY")

	// Initialize Gin router
	router := gin.Default()

	// Initialize Google AI client
	//googleClient, err := stream.NewClient(googleAPIKey)
	//if err != nil {
//		log.Fatalf("Failed to create Google AI client: %v", err)
///	}

	// Initialize Claude client
	claudeClient := claude.NewClient(claudeAPIKey)

	// Set up routes for Google AI
	//router = googleal.SetupRouter(router)

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

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3006"
	}
	log.Printf("Server starting on port %s\n", port)
	router.Run(fmt.Sprintf(":%s", port))
}