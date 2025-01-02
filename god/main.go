package main
/**

*/
//TODO Integrate WebSocket for Realtime
//TODO  action.go
//TODO CI/CD
import (
    "fmt"
    "log"
    "os"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "github.com/gorilla/websocket"
    "god/services/misc" // Change this to your actual module name
//    "god/services/openai" // Change this to your actual module name
    "god/services/claude" // Change this to your actual module name
)
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool { return true }, // Allow all origins (for testing, restrict in production)
}
func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Fatal(err)
    }
    defer ws.Close()

    for {
        messageType, p, err := ws.ReadMessage()
        if err != nil {
            log.Println(err)
            return
        }
        fmt.Println(string(p))
        if err := ws.WriteMessage(messageType, p); err != nil {
            log.Println(err)
            return
        }
    }
}

func main() {
  http.HandleFunc("/ws", handleConnections)
	// Initialize a Gin router
  err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
    r := gin.Default()

	// Define other routes
	r.GET("/god/v1/users", misc.GetUsers)    // Define the route for fetching users
	r.GET("/god/v1/product", misc.GetProducts)  // Define the route for fetching products

    // Initialize Claude client and set up its routes
    apiKey := os.Getenv("CLAUDE_ADMINκKEY")
    if apiKey == "" {
        log.Fatal("CLAUDE_KEY is not set in the environment")
    }
    clau := claude.NewClient(apiKey)
    clau.SetupRouter(r) // Pass the existing router to the SetupRouter method


	// Start the Gin server
	if err := r.Run(":3008"); err != nil {
		fmt.Println("Error starting server:", err)
	}
}