package main
/**

*/
//TODO Integrate WebSocket for Realtime
//TODO  action.go
//TODO CI/CD
import (
    "fmt"
    "log"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "god/services/misc" // Change this to your actual module name
    "god/services/openai" // Change this to your actual module name
    "god/services/claude" // Change this to your actual module name
)
func main() {
	// Initialize a Gin router
  err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
    r := gin.Default()

// Claude Client
	apiKey := "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"
	clau := claude.NewClient(apiKey)

	// Initialize the Gin router using Claude's SetupRouter
	clauRouter := clau.SetupRouter()
	r.Any("/apy/v1/claude/*any", func(c *gin.Context) {
		clauRouter.HandleContext(c)  // Delegate all Claude routes
	})

	// Define other routes
	r.GET("/god/v1/users", misc.GetUsers)    // Define the route for fetching users
	r.GET("/god/v1/product", misc.GetProducts)  // Define the route for fetching products

	// Example route for poem generation (using OpenAI in this case)
	r.POST("/gor/v1/openai/poem", func(c *gin.Context) {
		var json struct {
			Prompt string `json:"prompt"`
		}
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(400, gin.H{"error": "Invalid JSON body"})
			return
		}

		// Assuming you have a service for OpenAI completion
		result, err := openai.DavinciCompletion(json.Prompt)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"poem": result})
	})

	// Start the Gin server
	if err := r.Run(":3008"); err != nil {
		fmt.Println("Error starting server:", err)
	}
}