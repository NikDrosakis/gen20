#!/bin/bash

set -x  # Enable debugging

# Print all arguments
echo "Arguments passed: $@"

# Check if the message argument is provided
if [ -z "$1" ]; then
  echo "You must provide a message as the first argument."
  exit 1
fi

# Define variables
API_URL="https://vivalibro.com/apy/v1/gemini/conversation"
CONVERSATIONID="1"
API_KEY="YOUR_API_KEY_HERE"  # Replace with your actual API key

# Get the message from the first argument
message="$1"
echo "Sending message: $message"

# Use jq to create the JSON payload
payload=$(jq -n --arg msg "$message" --arg conv_id "$CONVERSATIONID" '{message: $msg, conversation_id: $conv_id}')

# Execute cURL to send the message with the API key in the header
response=$(curl -s -H "Content-Type: application/json" -H "X-API-Key: $API_KEY" -d "$payload" "$API_URL")

# Check if the response is empty
if [[ -z "$response" ]]; then
  echo "Error: No response from the server."
  exit 1
fi

# Print the response
echo "Response from API:"
echo "$response" | jq .