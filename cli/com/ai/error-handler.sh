#!/bin/bash

# ==============================================
# ERROR HANDLER - DeepSeek AI Integration
# ==============================================
ROOT="/var/www/gs"
ERROR_MESSAGE="$1"
LOG_FILE="$ROOT/log/cli.log"
API_URL="https://api.deepseek.com/v1/chat/completions"
API_KEY="sk-6f9b9c7c2f88482db3d4c2a367e0da0b"

# Prepare AI prompt with dynamic context (directly from the error message)
ERROR_INPUT="Check Error in Gen CLI: $ERROR_MESSAGE"

# Log the detected error
echo "❌ Error Detected: $ERROR_MESSAGE" | tee -a "$LOG_FILE"

# Send request to DeepSeek API with the full error context
PAYLOAD=$(jq -n \
  --arg model "deepseek-chat" \
  --arg role "user" \
  --arg content "$ERROR_INPUT" \
  '{model: $model, messages: [{role: $role, content: $content}]}')

RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "$PAYLOAD")

# Extract AI suggestion
AI_SUGGESTION=$(echo "$RESPONSE" | jq -r '.choices[0].message.content')

# Log & display suggestion
echo "💡 AI Suggestion: $AI_SUGGESTION" | tee -a "$LOG_FILE"
echo "-----------------------------------"

# Ensure the script exits with an error status
exit 1
