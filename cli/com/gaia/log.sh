#!/bin/bash

# API Endpoint for AI insights
API_URL="https://vivalibro.com/apy/v1/gemini/conversation"


CONVERSATIONID="$3"

# Function to collect system data
collect_system_data() {
    php_modules=$(php -m | grep -v '^\[.*\]$' | tr '\n' ',' | sed 's/,$//')
    os_details=$(php -r 'echo php_uname();')
    disk_usage=$(df -h | tr '\n' ';')
    ram_usage=$(free -m | tr '\n' ';')
    php_fpm_status=$(top -b -n 1 | grep php-fpm | tr '\n' ';')

    # Format data as JSON
    jq -n \
        --arg php_modules "$php_modules" \
        --arg os_details "$os_details" \
        --arg disk_usage "$disk_usage" \
        --arg ram_usage "$ram_usage" \
        --arg php_fpm_status "$php_fpm_status" \
        '{
            php_modules: $php_modules,
            os_details: $os_details,
            disk_usage: $disk_usage,
            ram_usage: $ram_usage,
            php_fpm_status: $php_fpm_status
        }'
}

# Function to send data to AI API for analysis
send_log() {
    local system_data="$1"
    local conversation_id="$2"

    # Create YAML payload
    payload=$(cat <<EOF
message: $system_data
CONVERSATIONID: $conversation_id
request_type: log_analysis
EOF
)

    # Send the payload to the API
    response=$(curl -s -H "Content-Type: application/yaml" -d "$payload" "$API_URL")

    # Extract AI-generated insights and code suggestions from YAML response
insights=$(echo "$response" | yq eval '.result.analysis.insights' -)
code_suggestions=$(echo "$response" | yq eval '.result.analysis.code' -)

    # Log structured output in YAML format
    cat <<EOF
timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
log_message: $system_data
insights: $insights
code_suggestions: $code_suggestions
EOF
}
# Collect system data
echo "Collecting system data..."
system_data=$(collect_system_data)

# Print collected data (debug)
echo "Collected Data:"
echo "$system_data" | jq .

# Send log to AI for insights
echo "Sending system log to AI..."
send_log "$system_data" "$CONVERSATIONID"
