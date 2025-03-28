package googleal

import (
	"fmt"
	"github.com/google/generative-ai-go/genai"
)

// printResponse is a helper function to print the response
func printResponse(resp *genai.GenerateContentResponse) {
	if resp == nil {
		fmt.Println("Response is nil")
		return
	}
	fmt.Println("Response:")
	for _, cand := range resp.Candidates {
		fmt.Println("  Candidate:")
		for _, part := range cand.Content.Parts {
			if textPart, ok := part.(genai.Text); ok {
				fmt.Printf("    Text: %s\n", textPart)
			} else {
				fmt.Printf("    Part: %+v\n", part)
			}
		}
	}
}