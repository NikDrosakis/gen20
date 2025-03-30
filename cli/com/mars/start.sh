#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/gen20.log"  # Adjust if needed
CLI_DIR="/var/www/gs/cli"
UTILS="$CLI_DIR/lib/utils.sh"
MARS_ROOT="/var/www/gs/mars"  # Path to the Mars application

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_DIR/lib/" >&2
    exit 1
fi

# Function to check if the Mars process is already running
is_mars_running() {
    if pgrep -f "./main" >/dev/null; then
        log "✅ Mars process is already running (./main)"
        return 0
    else
        return 1
    fi
}

# Function to start the Mars process
start_mars() {
    # Check if the process is already running
    if is_mars_running; then
        error "❌ Mars is already running. Aborting start."
        exit 1
    fi

    # Change to the Mars application directory
    cd "$MARS_ROOT" || {
        error "❌ Failed to change to Mars directory at $MARS_ROOT"
        exit 1
    }
    log "✅ Changed to Mars directory at $MARS_ROOT"

    # Clean and build the application
    log "🚀 Running 'make clean'..."
    if ! make clean >> "$LOG_FILE" 2>&1; then
        error "❌ 'make clean' failed"
        exit 1
    fi

    log "🚀 Running 'make'..."
    if ! make >> "$LOG_FILE" 2>&1; then
        error "❌ 'make' failed"
        exit 1
    fi

    # Start the Mars process in the background
    log "🚀 Starting Mars service..."
    nohup ./main >> "$LOG_FILE" 2>&1 &

    # Wait for the process to start
    sleep 2

    # Verify if the process started successfully
    if is_mars_running; then
        log "✅ Mars service started successfully"
        exit 0
    else
        error "❌ Failed to start Mars service"
        exit 1
    fi
}

# Run the start function
start_mars