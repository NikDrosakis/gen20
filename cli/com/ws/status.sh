#!/bin/bash

# Configuration
WSS_URI="wss://vivalibro.com:3010/?userid=1"
SYSTEMS=("gaia" "ermis" "god" "kronos" "mars")

# Check dependencies
check_deps() {
    if ! command -v websocat &>/dev/null; then
        echo "Error: websocat is required. Install with:"
        echo "  cargo install websocat  # or"
        echo "  sudo apt-get install websocat"
        exit 1
    fi
    if ! command -v jq &>/dev/null; then
        echo "Note: jq is recommended for better JSON handling"
    fi
}

# Robust WebSocket message sender
send_ws_message() {
    local message="$1"
    local attempts=0
    local max_attempts=3

    while [ $attempts -lt $max_attempts ]; do
        if echo "$message" | websocat -t "$WSS_URI" 2>/dev/null; then
            return 0
        fi

        # Fallback methods
        echo "$message" | websocat -H "Content-Type: application/json" "$WSS_URI" 2>/dev/null && return 0
        echo "message: $message" | websocat "$WSS_URI" 2>/dev/null && return 0

        attempts=$((attempts+1))
        sleep 1
    done

    echo "Error: Failed to send message after $max_attempts attempts" >&2
    return 1
}

# Generate valid JSON (using jq if available)
generate_json() {
    local system="$1"
    local action="$2"
    local verb="$3"

    if command -v jq &>/dev/null; then
        jq -n \
            --arg sys "$system" \
            --arg act "$action" \
            --arg vb "$verb" \
            '{
                system: $sys,
                execute: $act,
                cast: "all",
                type: "N",
                verba: $vb,
                domaffects: "*",
                domappend: ""
            }'
    else
        cat <<EOF
{
    "system": "$system",
    "execute": "$action",
    "cast": "all",
    "type": "N",
    "verba": "$verb",
    "domaffects": "*",
    "domappend": ""
}
EOF
    fi
}

# Ping WebSocket server
ping_ws() {
    local json_msg
    json_msg=$(generate_json "ping" "ping command" "Pinging the WebSocket server...")
    send_ws_message "$json_msg"
}

# Get system status
get_status() {
    local json_msg
    json_msg=$(generate_json "status" "fetch status" "Fetching system status...")
    send_ws_message "$json_msg"
}

# Monitor all systems
monitor_servers() {
    for system in "${SYSTEMS[@]}"; do
        local json_msg
        json_msg=$(generate_json "$system" "check system status" "$system system is online and connected.")
        send_ws_message "$json_msg"
        sleep 0.5  # Rate limiting
    done
}

# Main menu
show_menu() {
    while true; do
        clear
        echo "┌────────────────────────────────────────────┐"
        echo "│   WebSocket System Status Manager          │"
        echo "├────────────────────────────────────────────┤"
        echo "│  1. Ping WebSocket Server                  │"
        echo "│  2. Get System Status                     │"
        echo "│  3. Monitor All Systems                   │"
        echo "│  4. Exit                                  │"
        echo "└────────────────────────────────────────────┘"

        read -p "Choose an option (1-4): " OPTION

        case $OPTION in
            1) ping_ws ;;
            2) get_status ;;
            3) monitor_servers ;;
            4) echo "Exiting..."; exit 0 ;;
            *) echo "Invalid option"; sleep 1 ;;
        esac

        read -p "Press Enter to continue..."
    done
}

# Main execution
check_deps
show_menu