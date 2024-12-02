package main

import (
 "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
        "gor/services/misc" // Change this to your actual module name
        "gor/services/openai" // Change this to your actual module name
        "gor/services/claude" // Change this to your actual module name
)
func main() {
	// Initialize a Gin router
  err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
    r := gin.Default()



	// Claude
	apiKey := "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"
	clau := conversation.NewClient(apiKey)
	r.GET("/gor/v1/claude", claude.SetupRouter(r))
	// Use the client methods directly
	conversationID := uuid.New()
	_, err = clau.AddMessage(conversationID, "Hello, how are you?")
	if err != nil {
		fmt.Println("Error adding message:", err)
		return
	}
	conv, err := clau.GetConversation(conversationID)
	if err != nil {
		fmt.Println("Error getting conversation:", err)
		return
	}
	fmt.Printf("Conversation: %+v\n", conv)



	// Define routes
	r.GET("/gor/v1/users", misc.GetUsers)
	r.GET("/gor/v1/product", misc.GetProducts)


    // Define the route for chat completion
 //   r.POST("/gor/v1/openai/chat", openaiService.ChatHandler)
     // Route for poem generation using DavinciCompletion
  // Define the route for chat completion
    r.POST("/gor/v1/openai/poem", func(c *gin.Context) {
        var json struct {
            Prompt string `json:"prompt"`
        }
        if err := c.ShouldBindJSON(&json); err != nil {
            c.JSON(400, gin.H{"error": "Invalid JSON body"})
            return
        }

        // Use the DavinciCompletion from openai package
        result, err := openai.DavinciCompletion(json.Prompt)
        if err != nil {
            c.JSON(500, gin.H{"error": err.Error()})
            return
        }
        c.JSON(200, gin.H{"poem": result})
    })


	r.Run(":3008")
}