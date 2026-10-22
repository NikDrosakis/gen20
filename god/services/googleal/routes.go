// googleal/stream/stream.go
package googleal

import (
    "context"
    "fmt"
    "io"
    "log"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/google/generative-ai-go/genai"
    "google.golang.org/api/iterator"
)

// Client struct to hold the genai client and other configurations
type Client struct {
    genaiClient *genai.Client
    googleAPIKey      string
    // Add other configurations here
}

// NewClient creates a new Client instance
func NewClient(googleAPIKey string) (*Client, error) {
    ctx := context.Background()
    client, err := genai.NewClient(ctx, genai.WithAPIKey(googleAPIKey))
    if err != nil {
        return nil, fmt.Errorf("failed to create genai client: %w", err)
    }
    return &Client{genaiClient: client, googleAPIKey: googleAPIKey}, nil
}

// authMiddleware is a placeholder for your authentication logic
func (c *Client) authMiddleware() gin.HandlerFunc {
    return func(ctx *gin.Context) {
        // Implement your authentication logic here
        // For example, check for a valid API key in the header
        googleAPIKey := ctx.GetHeader("Authorization")
        if googleAPIKey == "" {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is missing"})
            return
        }
        if googleAPIKey != c.googleAPIKey {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
            return
        }
        ctx.Next()
    }
}

// stream handles the streaming response from the Gemini API
func (c *Client) stream(ctx *gin.Context) {
    model := c.genaiClient.GenerativeModel("gemini-1.5-flash")
    iter := model.GenerateContentStream(ctx, genai.Text("Write a story about a magic backpack."))

    ctx.Stream(func(w io.Writer) bool {
        resp, err := iter.Next()
        if err == iterator.Done {
            return false // Stop streaming
        }
        if err != nil {
            log.Printf("Error during streaming: %v\n", err)
            return false // Stop streaming on error
        }

        // Send the response to the client
        if resp != nil && len(resp.Candidates) > 0 && len(resp.Candidates[0].Content.Parts) > 0 {
            if textPart, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
                fmt.Fprintf(w, "%s", textPart)
            }
        }
        return true // Continue streaming
    })
}

// SetupRouter sets up the routes for the stream package
func (c *Client) SetupRouter(router *gin.Engine) *gin.Engine {
    api := router.Group("/god/v1/googleai")
    api.Use(c.authMiddleware())
    api.POST("/conversations/:conversation_id/messages", c.stream)
    return router
}