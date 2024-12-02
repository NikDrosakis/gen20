// services/openai.go

package openai

import (
    "context"
    "github.com/gin-gonic/gin"
    "github.com/openai/openai-go"
    "github.com/openai/openai-go/option"
    "net/http"
)

type OpenAIService struct {
    client *openai.Client
}

func NewOpenAIService(apiKey string) *OpenAIService {
    return &OpenAIService{
        client: openai.NewClient(option.WithAPIKey("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")),
    }
}

func (s *OpenAIService) ChatHandler(c *gin.Context) {
    var req struct {
        Message string `json:"message"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }

    chatCompletion, err := s.client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
        Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
            openai.UserMessage(req.Message),
        }),
        Model: openai.F(openai.ChatModelGPT4o),
    })

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, chatCompletion)
}
