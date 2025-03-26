#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/gen20.log"  # Adjust if needed
CLI_ROOT="/var/www/gs/cli"
UTILS="$CLI_ROOT/utils.sh"
MARS_ROOT="/var/www/gs/mars"  # Path to the Mars application

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_ROOT/lib/" >&2
    exit 1
fi

# Function to check if the Mars process is running
is_mars_running() {
    if pgrep -f "./main" >/dev/null; then
        log "✅ Mars process is running (./main)"
        return 0
    else
        return 1
    fi
}

# Function to check if port 3004 is listening
is_port_listening() {
    local port=3004

    if netstat -tuln | grep -q ":$port.*LISTEN"; then
        log "✅ Port $port is listening"
        return 0
    else
        error "❌ Port $port is NOT listening"
        return 1
    fi
}

# Function to check Mars status
check_mars_status() {
    # Check if the Mars process is running
    if ! is_mars_running; then
        error "❌ Mars process is NOT running"
        return 1
    fi

    # Check if port 3004 is listening
    if ! is_port_listening; then
        error "❌ Port 3004 is NOT listening"
        return 1
    fi

    log "✅ Mars service is running and port 3004 is listening"
    return 0
}

# Run the status check
if check_mars_status; then
    log "✅ All checks passed! Mars service is running smoothly."
    exit 0
else
    error "❌ Mars service check failed"
    exit 1
fi