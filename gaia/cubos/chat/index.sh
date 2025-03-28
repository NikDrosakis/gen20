#!/bin/bash

# Set your WebSocket server URL
WEBSOCKET_URL="wss://vivalibro.com:3009"


# Function to send WebSocket message
send_ws_message() {
    local message="$1"
    local user="$2"
    # Construct the WebSocket URL with the user parameter
    local websocket_url="${WEBSOCKET_URL}?user=${user}"

    # Send the message using wscat and capture the response
    local response=$(wscat -c "$websocket_url" --text "$message" | grep -o '\{.*\}')
      # Check if grep command was successful
       if [[ -z "$response" ]]; then
            echo "[ERROR] No valid response from wscat."
            return 1
       fi
    echo "$response"
  # If a response is expected parse the JSON response
   # if command -v jq >/dev/null 2>&1; then
   #    # Parse and display specific parts of the JSON
   #    jq -r '.text' <<< "$response"
   # else
   #  echo "[WARN] jq not found, can't parse JSON"
   # fi
}

# Check for required arguments
if [ -z "$1" ]; then
    echo "Usage: $0 <message> <user>"
    exit 1
fi
if [ -z "$2" ]; then
  echo "Usage: $0 <message> <user>"
  exit 1
fi


# Command argument processing
message="$1"
user="$2"

# Send the message and output the result
send_ws_message "$message" "$user"