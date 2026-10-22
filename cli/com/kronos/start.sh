#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/gen20.log"  # Adjust if needed
CLI_DIR="/var/www/gs/cli"
UTILS="$CLI_DIR/utils.sh"
VENV_ROOT="/var/www/gs/kronos/genenv"  # Path to the virtual environment
KRONOS_ROOT="/var/www/gs/kronos"       # Path to the Kronos application

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_DIR/lib/" >&2
    exit 1
fi

# Function to check if the uvicorn process is already running
is_kronos_running() {
    if pgrep -f "uvicorn main:app --host 0.0.0.0 --port 3006 --reload --log-level debug" >/dev/null; then
        log "✅ Uvicorn process is already running for Kronos on port 3006"
        return 0
    else
        return 1
    fi
}

# Function to start the uvicorn process
start_kronos() {
    local port=3006

    # Check if the process is already running
    if is_kronos_running; then
        error "❌ Kronos is already running. Aborting start."
        exit 1
    fi

    # Activate the virtual environment
    if [ -f "$VENV_ROOT/bin/activate" ]; then
        source "$VENV_ROOT/bin/activate"
        log "✅ Activated virtual environment at $VENV_ROOT"
    else
        error "❌ Virtual environment not found at $VENV_ROOT"
        exit 1
    fi

    # Change to the Kronos application directory
    cd "$KRONOS_ROOT" || {
        error "❌ Failed to change to Kronos directory at $KRONOS_ROOT"
        exit 1
    }
    log "✅ Changed to Kronos directory at $KRONOS_ROOT"

    # Start the uvicorn process in the background
    log "🚀 Starting Kronos service on port $port..."
    nohup uvicorn main:app --host 0.0.0.0 --port "$port" --reload --log-level debug >> "$LOG_FILE" 2>&1 &

    # Wait for the process to start
    sleep 2

    # Verify if the process started successfully
    if is_kronos_running; then
        log "✅ Kronos service started successfully on port $port"
        exit 0
    else
        error "❌ Failed to start Kronos service on port $port"
        exit 1
    fi
}

# Run the start function
start_kronos