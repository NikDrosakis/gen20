#!/bin/bash

# ==========================================
# KRONOS Runtime Manager
# FastAPI + Gunicorn + Uvicorn
# ==========================================

ROOT="/var/www/gs/kronos"
VENV="$ROOT/genenv"

GUNICORN="$VENV/bin/gunicorn"

HOST="0.0.0.0"
PORT="3006"

APP="main:app"
WORKERS="1"
LOG_LEVEL="debug"

PIDFILE="$ROOT/kronos.pid"
LOGFILE="/var/www/gs/data/gen20.net/kronos.txt"

cd "$ROOT" || exit 1

# ==========================================
# PROCESS VALIDATION
# ==========================================

is_kronos_running() {
    local PID="$1"
    local CMD
    local CWD

    [[ "$PID" =~ ^[0-9]+$ ]] || return 1
    kill -0 "$PID" 2>/dev/null || return 1

    CMD=$(tr '\0' ' ' < "/proc/$PID/cmdline" 2>/dev/null)
    CWD=$(readlink -f "/proc/$PID/cwd" 2>/dev/null)

    [[ "$CMD" == *gunicorn* ]] || return 1
    [[ "$CMD" == *"$APP"* ]] || return 1
    [[ "$CWD" == "$ROOT" ]] || return 1

    return 0
}

get_pid() {
    [ -f "$PIDFILE" ] || return 1

    local PID
    PID=$(cat "$PIDFILE")

    is_kronos_running "$PID" || return 1

    echo "$PID"
}

# ==========================================
# API HEALTH
# ==========================================

health() {
    curl -fsS \
        --max-time 3 \
        "http://127.0.0.1:$PORT/apy/v1/openapi.json" \
        >/dev/null 2>&1
}

# ==========================================
# START
# ==========================================

start() {

    if [ ! -x "$GUNICORN" ]; then
        echo "ERROR: Gunicorn not found: $GUNICORN"
        return 1
    fi

    if [ -f "$PIDFILE" ]; then
        PID=$(cat "$PIDFILE")

        if is_kronos_running "$PID"; then
            echo "KRONOS already running (PID: $PID)"
            return 0
        fi

        rm -f "$PIDFILE"
    fi

    mkdir -p "$(dirname "$LOGFILE")"

    echo "Starting KRONOS..."

    nohup "$GUNICORN" \
        --workers "$WORKERS" \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind "$HOST:$PORT" \
        --log-level "$LOG_LEVEL" \
        --timeout 300 \
        --graceful-timeout 20 \
        --access-logfile - \
        --error-logfile - \
        --pid "$PIDFILE" \
        "$APP" \
        >> "$LOGFILE" 2>&1 \
        </dev/null &

    for i in {1..10}; do
        sleep 1

        if PID=$(get_pid); then
            echo "KRONOS process running (PID: $PID)"
            break
        fi
    done

    if [ -z "${PID:-}" ] || ! is_kronos_running "$PID"; then
        echo "ERROR: KRONOS failed to start."
        tail -n 40 "$LOGFILE"
        return 1
    fi

    # Wait for FastAPI
    for i in {1..15}; do
        if health; then
            echo "KRONOS API ready on port $PORT"
            return 0
        fi

        sleep 1
    done

    echo "WARNING: KRONOS process is running, but API is not responding."
    tail -n 30 "$LOGFILE"

    return 1
}

# ==========================================
# STOP
# ==========================================

stop() {

    if ! PID=$(get_pid); then
        rm -f "$PIDFILE"
        echo "KRONOS is not running."
        return 0
    fi

    echo "Stopping KRONOS (PID: $PID)..."

    kill -TERM "$PID"

    for i in {1..20}; do
        if ! is_kronos_running "$PID"; then
            break
        fi

        sleep 1
    done

    if is_kronos_running "$PID"; then
        echo "Force stopping KRONOS..."
        kill -KILL "$PID"
    fi

    rm -f "$PIDFILE"

    echo "KRONOS stopped."
}

# ==========================================
# STATUS
# ==========================================

status() {

    if ! PID=$(get_pid); then
        echo "KRONOS stopped."
        return 1
    fi

    echo "KRONOS running (PID: $PID)"

    if health; then
        echo "KRONOS API ready (port $PORT)"
        return 0
    fi

    echo "KRONOS API not responding."
    return 1
}

# ==========================================
# RESTART
# ==========================================

restart() {
    stop || return 1
    start
}

# ==========================================
# COMMANDS
# ==========================================

case "${1:-restart}" in

    start)
        start
        ;;

    stop)
        stop
        ;;

    restart)
        restart
        ;;

    status)
        status
        ;;

    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;

esac