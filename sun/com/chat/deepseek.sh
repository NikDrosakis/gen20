#!/bin/bash

API_URL="https://api.deepseek.com/v1/chat/completions"
API_KEY="sk-6f9b9c7c2f88482db3d4c2a367e0da0b"

# Define the conversation
PAYLOAD=$(jq -n \
  --arg model "deepseek-chat" \
  --arg role "user" \
  --arg content "Hello, how are you?" \
  '{model: $model, messages: [{role: $role, content: $content}]}')

# Make the API call
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$PAYLOAD")

# Print the response
echo "Response from DeepSeek:"
echo "$RESPONSE" | jq .
