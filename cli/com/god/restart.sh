#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/god.log"  # Adjust if needed
CLI_ROOT="/var/www/gs/cli"
UTILS="$CLI_ROOT/utils.sh"
GOD_ROOT="/var/www/gs/god"  # Path to the GoGin application

# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh in $CLI_ROOT/lib/" >&2
    exit 1
fi
if ! source "$CLI_ROOT/com/god/common.sh" 2>/dev/null; then
    echo "❌ Error: Missing common.sh" >&2
    exit 1
fi
# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: $UTILS" >&2
    exit 1
fi
# Clear log file
> "$LOG_FILE"
# Main restart function
restart_god() {
    if is_god_running; then
        stop_god
    else
        log "ℹ️ GoGin service not currently running"
    fi
    start_god
}

# Run the restart function
restart_god