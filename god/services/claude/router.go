package claude

import (

	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"net/http"
)

type Client struct {
	APIKey string
}

type Message struct {
	Content string `json:"content"`
}

type Conversation struct {
	ID       uuid.UUID           `json:"id"`
	Messages []map[string]string `json:"messages"`
}

var (
    conversations = make(map[uuid.UUID][]map[string]string)
    apiKey        = "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"
)
func NewClient(apiKey string) *Client {
	return &Client{APIKey: apiKey}
}

func (c *Client) SetupRouter() *gin.Engine {
	router := gin.Default()
	api := router.Group("/apy/v1/claude")
	api.Use(c.authMiddleware())
	{
		api.POST("/conversations/:conversation_id/messages", c.addMessage)
		api.GET("/conversations/:conversation_id", c.getConversation)
	}
	return router
}

func (c *Client) authMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		apiKey := ctx.GetHeader("vivalibro")
		if apiKey != c.APIKey {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "Invalid API key"})
			ctx.Abort()
			return
		}
		ctx.Next()
	}
}

func (c *Client) addMessage(ctx *gin.Context) {
	conversationID, err := uuid.Parse(ctx.Param("conversation_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var message Message
	if err := ctx.ShouldBindJSON(&message); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, exists := conversations[conversationID]; !exists {
		conversations[conversationID] = []map[string]string{}
	}
	conversations[conversationID] = append(conversations[conversationID], map[string]string{"role": "user", "content": message.Content})

	ctx.JSON(http.StatusOK, gin.H{"id": conversationID.String(), "message": message.Content})
}

func (c *Client) getConversation(ctx *gin.Context) {
	conversationID, err := uuid.Parse(ctx.Param("conversation_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	messages, exists := conversations[conversationID]
	if !exists {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	ctx.JSON(http.StatusOK, Conversation{ID: conversationID, Messages: messages})
}

func (c *Client) AddMessage(conversationID uuid.UUID, content string) (string, error) {
	if _, exists := conversations[conversationID]; !exists {
		conversations[conversationID] = []map[string]string{}
	}
	conversations[conversationID] = append(conversations[conversationID], map[string]string{"role": "user", "content": content})
	return conversationID.String(), nil
}

func (c *Client) GetConversation(conversationID uuid.UUID) (*Conversation, error) {
	messages, exists := conversations[conversationID]
	if !exists {
		return nil, fmt.Errorf("conversation not found")
	}
	return &Conversation{ID: conversationID, Messages: messages}, nil
}