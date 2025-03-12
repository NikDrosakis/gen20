package main

import (
	"fmt"
	"log"
	//"time"
	"net/http"
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

	// Initialize Gin router
	router := gin.Default()
	router.LoadHTMLGlob("public/*")

	// Register the Mermaid routes
	mermaid.RegisterRoutes(router)

	// Initialize Claude client
	claudeAPIKey := os.Getenv("CLAUDE_APIKEY")
	claudeClient := claude.NewClient(claudeAPIKey)

	// Set up routes for Claude
	router = claudeClient.SetupRouter(router)

	// Create a new route group for /god/v1
	v1 := router.Group("/god/v1")
	{
		// Define the index route under /god/v1
		v1.GET("/", func(c *gin.Context) {
			// Get all the routes defined in the router
			routes := router.Routes()

			// Pass the route data to the HTML template
			var routeList []map[string]string
			for _, route := range routes {
				routeList = append(routeList, map[string]string{
					"Path":   route.Path,
					"Method": route.Method,
				})
			}

			// Render the index.html page and pass the route data to the template
			c.HTML(http.StatusOK, "index.html", gin.H{
				"title":     "God Gin App Landing Page",
				"endpoints": routeList,
			})
		})

		// Define the /rethink route under /god/v1
	// Define routes
		// WebSocket route inside the /god/v1 group
		v1.GET("/ws", func(c *gin.Context) {
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
            log.Println("WebSocket connection failed, continuing without it...")
        } else {
            defer wsClient.Close() // Close only if wsClient is not nil
        }

//ticker every one minute
	// Create a ticker that fires every minute
	//ticker := time.NewTicker(1 * time.Minute)
	//defer ticker.Stop() // Stop the ticker when the function exits

	// Run the ticker continuously
	//for range ticker.C {

        // Send the structured message (only if wsClient is initialized)
        if wsClient != nil {
            err = wsClient.SendMessage()
            if err != nil {
               log.Printf("WebSocket failed to send message: %v", err)
            } else {
                log.Println("Message sent successfully.")
            }
        } else {
            log.Println("Skipping WebSocket message send since connection is unavailable.")
        }

	//}

	}

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3008"
	}
	log.Printf("Server starting on port %s\n", port)
	router.Run(fmt.Sprintf(":%s", port))
}

