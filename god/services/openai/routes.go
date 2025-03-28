package openai
//
import (
    "context"
    "fmt"
    "github.com/sashabaranov/go-openai" // Updated import to correct package
)

// DavinciCompletion generates a completion using GPT-3.5-turbo
func DavinciCompletion(prompt string) (string, error) {
    apiKey := "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"
    client := openai.NewClient(apiKey)

    req := openai.ChatCompletionRequest{
        Model: "gpt-3.5-turbo", // Updated to correct model
        Messages: []openai.ChatCompletionMessage{
            {
                Role:    openai.ChatMessageRoleUser, // Corrected usage
                Content: prompt,
            },
        },
    }

    resp, err := client.CreateChatCompletion(context.Background(), req)
    if err != nil {
        return "", fmt.Errorf("error creating completion: %w", err)
    }

    if len(resp.Choices) > 0 {
        return resp.Choices[0].Message.Content, nil
    }

    return "", fmt.Errorf("no completion response received")
}