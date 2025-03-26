#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/kronos.log"  # Adjust if needed
CLI_ROOT="/var/www/gs/cli"
UTILS="$CLI_ROOT/utils.sh"

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_ROOT/lib/" >&2
    exit 1
fi

# Function to check if the uvicorn process is running
check_kronos_status() {
    local port=3006

    # Check if the uvicorn process is running
    if pgrep -f "uvicorn main:app --host 0.0.0.0 --port $port --reload --log-level debug" >/dev/null; then
        log "✅ Uvicorn process is running for Kronos on port $port"
        return 0
    else
        error "❌ Uvicorn process is NOT running for Kronos on port $port"
        return 1
    fi
}

# Run the status check
if check_kronos_status; then
    log "✅ Kronos service is running."
    exit 0
else
    error "❌ Kronos service is NOT running."
    exit 1
fi