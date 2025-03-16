#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/gen20.log"
CLI_ROOT="/var/www/gs/cli"
UTILS="$CLI_ROOT/lib/utils.sh"

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_ROOT/lib/" >&2
    exit 1
fi

# Function to check GoGin service status
check_god_status() {
    local port=3008

    # Check if port is listening
    if ! check_port_listening "$port"; then
        error "❌ Port $port is NOT in LISTEN state"
        return 1
    fi

    # Check if GoGin process is running
    if ! GO_PROCESS=$(pgrep -f 'main.go'); then
        error "❌ GoGin process is NOT running (main.go not found)"
        return 1
    fi
    log "✅ GoGin process is running (PID: $GO_PROCESS)"

    return 0
}

# Run the GoGin status check
if check_god_status; then
    log "✅ All checks passed! GoGin service is running smoothly."
    exit 0
else
    error "❌ GoGin service check failed"
    exit 1
fi