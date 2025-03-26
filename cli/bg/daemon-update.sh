#!/bin/bash

ROOT="/var/www/gs"                     # Root directory
ENV_FILE="$ROOT/.env"                  # Path to .env
CLI_ROOT="$ROOT/cli"                   # CLI scripts directory
COMMON="$CLI_ROOT/utils.sh"            # utils.sh path
PID_FILE="/tmp/gen-daemon.pid"         # PID file
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

# Start Daemon
start_daemon() {
    # Clean up stale PID first with more detailed checks
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if [ -n "$PID" ] && [ "$PID" -eq "$PID" ] 2>/dev/null; then  # Verify it's a number
            if kill -0 "$PID" 2>/dev/null; then
                log "⚠️ Daemon already running (PID: $PID)"
                return 1
            else
                log "⚠️ Cleaning up stale PID file (dead PID: $PID)"
                rm -f "$PID_FILE"
            fi
        else
            log "⚠️ Invalid PID found in $PID_FILE"
            rm -f "$PID_FILE"
        fi
    fi

    log "🚀 Starting Gen daemon..."
    if nohup "$CLI_ROOT/bg/daemon-update.sh" &>> "$LOG_FILE" & then
        PID=$!
        echo "$PID" > "$PID_FILE"
        sleep 1  # Give process time to start
        if kill -0 "$PID" 2>/dev/null; then
            log "✅ Daemon started successfully (PID: $PID)"
            return 0
        else
            log "❌ Daemon failed to start (PID: $PID exited immediately)"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        log "❌ Failed to execute daemon process"
        return 1
    fi
}

stop_daemon() {
    local TIMEOUT=5  # Seconds to wait for graceful shutdown
    local FORCE_TIMEOUT=3  # Additional seconds before force kill

    if [ ! -f "$PID_FILE" ]; then
        log "⚠️ No PID file found at $PID_FILE"
        return 1
    fi

    PID=$(cat "$PID_FILE")
    if [ -z "$PID" ] || ! [ "$PID" -eq "$PID" ] 2>/dev/null; then
        log "❌ Invalid PID in $PID_FILE"
        rm -f "$PID_FILE"
        return 1
    fi

    if kill -0 "$PID" 2>/dev/null; then
        log "🛑 Stopping daemon (PID: $PID)..."
        kill "$PID"  # Send SIGTERM

        # Wait for graceful shutdown
        local waited=0
        while kill -0 "$PID" 2>/dev/null && [ "$waited" -lt "$TIMEOUT" ]; do
            sleep 1
            ((waited++))
        done

        if kill -0 "$PID" 2>/dev/null; then
            log "⚠️ Daemon not responding to SIGTERM, forcing kill..."
            kill -9 "$PID"
            sleep "$FORCE_TIMEOUT"
            if kill -0 "$PID" 2>/dev/null; then
                log "❌ Failed to kill daemon (PID: $PID)"
                return 1
            fi
        fi

        rm -f "$PID_FILE"
        log "✅ Daemon stopped successfully"
        return 0
    else
        log "⚠️ No running daemon found (stale PID: $PID)"
        rm -f "$PID_FILE"
        return 1
    fi
}
# Restart Daemon
restart_daemon() {
    stop_daemon
    sleep 1
    start_daemon
}

# Check Daemon Status
status_daemon() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "✅ Daemon is running (PID: $PID)"
        else
            log "⚠️ Stale PID file found (dead PID: $PID)"
            rm -f "$PID_FILE"
        fi
    else
        log "⚠️ Daemon is not running"
    fi
}

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