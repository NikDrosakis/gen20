#!/bin/bash

ROOT="/var/www/gs"                     # Root directory
ENV_FILE="$ROOT/.env"                  # Path to .env
CLI_ROOT="$ROOT/cli"                   # CLI scripts directory
COMMON="$CLI_ROOT/utils.sh"            # utils.sh path
PID_FILE="$CLI_ROOT/bg/gen-daemon.pid"         # PID file
LOG_FILE="$ROOT/log/cli.log"     # Log file

# Load .env
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "❌ Error: Missing .env file at $ENV_FILE" >&2
    exit 1
fi

# Load utils.sh
if [ -f "$COMMON" ]; then
    source "$COMMON"
else
    echo "❌ Error: Missing utils.sh at $COMMON" >&2
    exit 1
fi

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check command argument
if [ -z "$1" ]; then
    echo "Usage: gen <start|stop|restart|status>" >&2
    exit 1
fi

# Handle command
case "$1" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        restart_daemon
        ;;
    status)
        status_daemon
        ;;
    *)
        echo "❌ Error: Unknown command '$1'" >&2
        echo "Usage: gen <start|stop|restart|status>" >&2
        exit 1
        ;;
esac

exit $?