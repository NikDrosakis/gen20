#!/bin/bash
# Define paths
ROOT="/var/www/gs"
LOG_FILE="$ROOT/log/god.log"  # Adjust if needed
CLI_ROOT="$ROOT/cli"
UTILS="$ROOT/cli/utils.sh"
GOD_ROOT="$ROOT/god"  # Path to the GoGin application

# Source utils.sh if exists
if [ -f "$UTILS" ]; then
    source "$UTILS"
else
    echo "❌ Error: Missing utils.sh at $UTILS" >&2
    exit 1
fi

# Function to check if the GoGin process is already running
is_god_running() {
    # First try to find the exact running process
    local exact_match=$(pgrep -f "^go run $(pwd)/main\.go$|^$(pwd)/god$")

    # If no exact match, try broader match (with path handling)
    if [ -z "$exact_match" ]; then
        exact_match=$(pgrep -f "go run.*/main\.go")
    fi

    if [ -n "$exact_match" ]; then
        log "✅ GoGin process running (PID: $exact_match)"
        return 0
    fi

    # Check for compiled binary
    local binary_match=$(pgrep -fx "$GOD_ROOT/god")
    if [ -n "$binary_match" ]; then
        log "✅ GoGin binary running (PID: $binary_match)"
        return 0
    fi

    return 1
}

# Function to check GoGin service status
check_god_status() {
    local port=3008

    # Check if port is listening
    if ! check_port_listening "$port"; then
        error "❌ Port $port is NOT in LISTEN state"
        return 1
    fi

    # Check if GoGin process is running
    if ! GO_PROCESS=$(pgrep -f "$GOD_ROOT/main.go"); then
        error "❌ GoGin process is NOT running (main.go not found)"
        return 1
    fi
    log "✅ GoGin process is running (PID: ${GO_PROCESS:-"unknown"})"

    return 0
}

# Function to start the GoGin process
start_god() {
    local port=3008

    # Check if the process is already running
    if is_god_running; then
        error "❌ GoGin is already running. Aborting start."
        return 1
    fi

    # Change to the GoGin application directory
    if ! cd "$GOD_ROOT"; then
        error "❌ Failed to change to GoGin directory at $GOD_ROOT"
        return 1
    fi
    log "✅ Changed to GoGin directory at $GOD_ROOT"

    # Start the GoGin process in the background
    log "🚀 Starting GoGin service on port $port..."
    nohup go run main.go >> "$LOG_FILE" 2>&1 &

    # Wait for the process to start
    sleep 2

    # Verify if the process started successfully
    if is_god_running; then
        log "✅ GoGin service started successfully on port $port"
        return 0
    else
        error "❌ Failed to start GoGin service on port $port"
        return 1
    fi
}

# Function to stop the GoGin process
stop_god() {
    # Check if the process is running
    if ! is_god_running; then
        log "ℹ️ GoGin is not running. Nothing to stop."
        return 0
    fi

    # Find the GoGin process PIDs
    local pids=($(pgrep -f "$GOD_ROOT/main.go"))
    if [ ${#pids[@]} -eq 0 ]; then
        error "❌ Could not find GoGin process"
        return 1
    fi

    log "🛑 Stopping GoGin process(es) with PIDs: ${pids[*]}..."

    # Kill the GoGin process(es)
    kill -TERM "${pids[@]}"

    # Wait for processes to stop
    local timeout=5
    while ((timeout-- > 0)); do
        if ! is_god_running; then
            log "✅ GoGin service stopped successfully"
            return 0
        fi
        sleep 1
    done

    # If still running, force kill
    if is_god_running; then
        log "⚠️ Process still running, sending SIGKILL..."
        kill -9 "${pids[@]}"
        sleep 1
    fi

    if ! is_god_running; then
        log "✅ GoGin service stopped successfully"
        return 0
    else
        error "❌ Failed to stop GoGin service"
        return 1
    fi
}