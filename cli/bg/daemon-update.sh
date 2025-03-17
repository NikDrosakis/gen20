#!/bin/bash

# Ensure .env is loaded
ENV_FILE="/var/www/gs/.env"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "❌ Error: Missing .env file at $ENV_FILE"
    exit 1
fi

# Source utils.sh
if [ -f "$CLI_UTILS" ]; then
    source "$CLI_UTILS"
else
    echo "❌ Error: Missing utils.sh in $CLI_ROOT/lib/"
    exit 1
fi

# Display version
echo "Gen version: $GEN_VERSION"

# Ensure log function is available
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check arguments
if [ -z "$1" ]; then
    log "⚠️ Usage: $0 <system> <command> [args...]"
    exit 1
fi

# Parse system and subcommand
SYSTEM="$1"       # First argument is the system (e.g., gaia, mars)
SUBCOMMAND="$2"   # Second argument is the subcommand (e.g., start, status)

# Check if it's a predefined daemon command
case "$SUBCOMMAND" in
    start)
        start_daemon
        exit 0
        ;;
    stop)
        stop_daemon
        exit 0
        ;;
    restart)
        restart_daemon
        exit 0
        ;;
esac

# Construct script path
SCRIPT="$BASE_DIR/com/$SYSTEM/$SUBCOMMAND.sh"
echo "$SCRIPT"
# Ensure the script exists and is executable
if [ -f "$SCRIPT" ] && [ -x "$SCRIPT" ]; then
    log "🚀 Executing command: $SYSTEM $SUBCOMMAND"
    shift 2  # Remove the system and subcommand from the arguments
    bash "$SCRIPT" "$@"  # Execute the subcommand with remaining arguments
    exit $?  # Exit with the same status as the script
else
    if [ ! -f "$SCRIPT" ]; then
        log "❌ Unknown or invalid command: $SYSTEM $SUBCOMMAND (Script not found: $SCRIPT)"
    elif [ ! -x "$SCRIPT" ]; then
        log "❌ Unknown or invalid command: $SYSTEM $SUBCOMMAND (Script not executable: $SCRIPT)"
    else
        log "❌ Unknown or invalid command: $SYSTEM $SUBCOMMAND"
    fi
    exit 1
fi