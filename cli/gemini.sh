#!/bin/bash

# Set the API endpoint URL
API_URL="https://vivalibro.com/apy/v1/gemini/conversation" # Replace with your actual URL

# Function to send a message and get the response
send_message() {
  local message="$1"
  local conversation_id="$2"

  # Construct the JSON payload (using jq)
  payload=$(jq -n --arg msg "$message" --arg conv_id "$conversation_id" '{message: $msg, conversation_id: $conv_id}')

  # Send the request using curl
  local response=$(curl -s -H "Content-Type: application/json" -d "$payload" "$API_URL")

  # Handle response (e.g., print it)
  echo "$response"

  # OPTIONAL: Parse the json output (unchanged)
  # ... (rest of the function remains the same)
}

# Example Usage:
if [ -z "$1" ]; then
  echo "Please provide a message as the first argument."
  exit 1
fi

if [ -z "$2" ]; then
  echo "Please provide a conversation_id as the second argument."
    exit 1
fi


message="$1"
conversation_id="$2"
send_message "$message" "$conversation_id"