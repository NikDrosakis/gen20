#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/gen20.log"  # Adjust if needed
CLI_ROOT="/var/www/gs/cli"
UTILS="$CLI_ROOT/lib/utils.sh"
GOD_ROOT="/var/www/gs/god"  # Path to the GoGin application

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_ROOT/lib/" >&2
    exit 1
fi

# Function to check if the GoGin process is already running
is_god_running() {
    if pgrep -f "main.go" >/dev/null; then
        log "✅ GoGin process is already running (main.go)"
        return 0
    else
        return 1
    fi
}

# Function to start the GoGin process
start_god() {
    local port=3008

    # Check if the process is already running
    if is_god_running; then
        error "❌ GoGin is already running. Aborting start."
        exit 1
    fi

    # Change to the GoGin application directory
    cd "$GOD_ROOT" || {
        error "❌ Failed to change to GoGin directory at $GOD_ROOT"
        exit 1
    }
    log "✅ Changed to GoGin directory at $GOD_ROOT"

    # Start the GoGin process in the background
    log "🚀 Starting GoGin service on port $port..."
    nohup go run main.go >> "$LOG_FILE" 2>&1 &

    # Wait for the process to start
    sleep 2

    # Verify if the process started successfully
    if is_god_running; then
        log "✅ GoGin service started successfully on port $port"
        exit 0
    else
        error "❌ Failed to start GoGin service on port $port"
        exit 1
    fi
}

# Run the start function
start_god