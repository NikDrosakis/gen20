#!/bin/bash
# /var/www/gs/SON/gen-daemonctl.sh

set -u

ROOT="/var/www/gs"
SOL_DIR="$ROOT/sol"
DAEMON="$SOL_DIR/gen-daemon"
PID_FILE="$SOL_DIR/gen.pid"
LOCK_FILE="$SOL_DIR/gen.lock"
LOG_FILE="$ROOT/log/gen.log"
LOG_MAX_SIZE=$((10 * 1024 * 1024))

ensure_dirs() {
    mkdir -p "$(dirname "$LOG_FILE")" "$SOL_DIR" || {
        echo "Cannot create required directories" >&2
        exit 1
    }
}

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

rotate_log() {
    if [ -f "$LOG_FILE" ] && [ "$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)" -gt "$LOG_MAX_SIZE" ]; then
        mv "$LOG_FILE" "${LOG_FILE}.$(date +%Y%m%d%H%M%S)"
        log "Log rotated"
    fi
}

is_running() {
    [ -f "$PID_FILE" ] || return 1
    local pid
    pid=$(cat "$PID_FILE" 2>/dev/null) || return 1
    [ -n "$pid" ] || return 1

    if kill -0 "$pid" 2>/dev/null; then
        if grep -q "gen-daemon" "/proc/$pid/cmdline" 2>/dev/null; then
            return 0
        fi
    fi

    log "Stale PID detected, removing: $pid"
    rm -f "$PID_FILE"
    return 1
}

start_daemon() {
    ensure_dirs
    rotate_log

    exec 9>"$LOCK_FILE"
    if ! flock -n 9; then
        echo "Another instance is starting..."
        return 1
    fi

    if is_running; then
        local pid; pid=$(cat "$PID_FILE")
        log "Daemon already running (PID: $pid)"
        echo "Daemon already running (PID: $pid)"
        return 0
    fi

    if [ ! -x "$DAEMON" ]; then
        log "ERROR: Daemon executable not found: $DAEMON"
        echo "ERROR: $DAEMON not found/executable"
        return 1
    fi

    log "Starting daemon..."
    echo "Starting gen daemon..."

    nohup "$DAEMON" >> "$LOG_FILE" 2>&1 &
    local pid=$!
    echo "$pid" > "$PID_FILE"
    sleep 1

    if is_running; then
        log "Daemon started successfully (PID: $pid)"
        echo "Daemon started (PID: $pid)"
        return 0
    else
        log "Daemon failed to start"
        echo "Daemon failed to start"
        rm -f "$PID_FILE"
        return 1
    fi
}

stop_daemon() {
    if ! is_running; then
        log "Daemon not running"
        echo "Daemon not running"
        return 1
    fi

    local pid; pid=$(cat "$PID_FILE")
    log "Stopping daemon (PID: $pid)"
    echo "Stopping daemon (PID: $pid)"

    kill -TERM "$pid" 2>/dev/null
    for _ in $(seq 1 10); do
        kill -0 "$pid" 2>/dev/null || break
        sleep 1
    done
    if kill -0 "$pid" 2>/dev/null; then
        log "Daemon did not stop gracefully, SIGKILL"
        kill -KILL "$pid" 2>/dev/null
        sleep 1
    fi

    rm -f "$PID_FILE"
    log "Daemon stopped"
    echo "Daemon stopped"
    return 0
}

case "${1:-}" in
    start)   start_daemon ;;
    stop)    stop_daemon ;;
    restart) stop_daemon || true; sleep 1; start_daemon ;;
    status)
        if is_running; then echo "Running (PID: $(cat "$PID_FILE"))"; exit 0
        else echo "Not running"; exit 1; fi ;;
    *) echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac