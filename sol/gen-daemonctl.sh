#!/bin/bash
# /var/www/gs/sol/gen-daemonctl.sh

set -u

# Shared configuration
if [[ ! -r /var/www/gs/sol/.env ]]; then
    echo "Missing configuration: /var/www/gs/sol/.env" >&2
    exit 1
fi

source /var/www/gs/sol/.env

# Shared logger
if [[ ! -r "$SOL_ROOT/init.sh" ]]; then
    echo "Missing shared logger: $SOL_ROOT/init.sh" >&2
    exit 1
fi

source "$SOL_ROOT/init.sh"

mkdir -p "$LOG_DIR"

log() {
    log_action "GENDCTL: ${1:-}"
}

is_running() {
    [[ -f "$PID_FILE" ]] || return 1

    local pid
    pid=$(cat "$PID_FILE" 2>/dev/null) || return 1

    if [[ ! "$pid" =~ ^[0-9]+$ ]]; then
        rm -f "$PID_FILE"
        return 1
    fi

    if kill -0 "$pid" 2>/dev/null; then
        if tr '\0' '\n' < "/proc/$pid/cmdline" 2>/dev/null |
            grep -Fxq -- "$DAEMON"; then
            return 0
        fi
    fi

    log "Stale PID detected: $pid"
    rm -f "$PID_FILE"
    return 1
}

start_daemon() {
    exec 9>"$SOL_ROOT/gen.lock"

    if ! flock -n 9; then
        echo "Another instance is starting..."
        return 1
    fi

    if is_running; then
        local pid
        pid=$(cat "$PID_FILE")
        log "Daemon already running (PID: $pid)"
        echo "Daemon already running (PID: $pid)"
        return 0
    fi

    if [[ ! -x "$DAEMON" ]]; then
        log "ERROR: daemon not executable: $DAEMON"
        echo "ERROR: $DAEMON not found or not executable"
        return 1
    fi

    log "Starting daemon"
    echo "Starting gen daemon..."

    nohup "$DAEMON" >> "$LOG_FILE" 2>&1 &

    local pid=$!
    printf '%s\n' "$pid" > "$PID_FILE"

    sleep 2

    if is_running; then
        log "Daemon started (PID: $pid)"
        echo "Daemon started (PID: $pid)"
        return 0
    fi

    log "ERROR: daemon failed to start"
    echo "Daemon failed to start"
    rm -f "$PID_FILE"
    return 1
}

stop_daemon() {
    if ! is_running; then
        log "Daemon not running"
        echo "Daemon not running"
        return 1
    fi

    local pid
    pid=$(cat "$PID_FILE")

    log "Stopping daemon (PID: $pid)"
    echo "Stopping daemon (PID: $pid)"

    kill -TERM "$pid" 2>/dev/null || true

    for _ in {1..10}; do
        kill -0 "$pid" 2>/dev/null || break
        sleep 1
    done

    if kill -0 "$pid" 2>/dev/null; then
        log "Daemon did not stop gracefully; sending SIGKILL"
        kill -KILL "$pid" 2>/dev/null || true
        sleep 1
    fi

    rm -f "$PID_FILE"

    log "Daemon stopped"
    echo "Daemon stopped"
    return 0
}

case "${1:-}" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        stop_daemon || true
        sleep 1
        start_daemon
        ;;
    status)
        if is_running; then
            echo "Running (PID: $(cat "$PID_FILE"))"
            exit 0
        fi

        echo "Not running"
        exit 1
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac