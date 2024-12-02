package openai

import (
    "context"
    "fmt"
    "os"

    "github.com/sashabaranov/go-openai" // Updated package name for the OpenAI API client
)

// DavinciCompletion handles the generation of text using OpenAI's text-davinci-003 model.
func DavinciCompletion(prompt string) (string, error) {
    // Load API key from environment variable.
    apiKey := os.Getenv("OPENAI_API_KEY")
    if apiKey == "" {
        return "", fmt.Errorf("OpenAI API key is not set")
    }

    // Create a new OpenAI client using the API key.
    client := openai.NewClient(apiKey)

    // Define the completion request parameters.
    req := openai.CompletionRequest{
        Model:     openai.GPT3TextDavinci003, // Set the model to text-davinci-003
        Prompt:    prompt,
        MaxTokens: 100,                       // Number of tokens to generate
    }

    // Make the API request to OpenAI.
    resp, err := client.CreateCompletion(context.TODO(), req)
    if err != nil {
        return "", fmt.Errorf("error creating completion: %v", err)
    }

    // Return the generated text from the response.
    if len(resp.Choices) > 0 {
        return resp.Choices[0].Text, nil
    }

    return "", fmt.Errorf("no choices found in response")
}
