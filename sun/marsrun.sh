#!/bin/bash

# ==========================================
# MARS Runtime Manager
# Native C++ daemon
# ==========================================

ROOT="/var/www/gs/mars"

BIN="$ROOT/main"
PIDFILE="$ROOT/mars.pid"
LOGFILE="/var/www/gs/data/gen20.net/mars.txt"

cd "$ROOT" || exit 1

# ==========================================
# PROCESS VALIDATION
# ==========================================

is_mars_running() {

    local PID="$1"
    local EXE
    local EXPECTED

    [[ "$PID" =~ ^[0-9]+$ ]] || return 1
    kill -0 "$PID" 2>/dev/null || return 1

    EXE=$(readlink -f "/proc/$PID/exe" 2>/dev/null)
    EXPECTED=$(readlink -f "$BIN" 2>/dev/null)

    [[ -n "$EXPECTED" && "$EXE" == "$EXPECTED" ]]
}

get_pid() {

    [ -f "$PIDFILE" ] || return 1

    local PID
    PID=$(cat "$PIDFILE")

    is_mars_running "$PID" || return 1

    echo "$PID"
}

# ==========================================
# BUILD
# ==========================================

build() {

    if PID=$(get_pid); then
        echo "ERROR: MARS is running (PID: $PID). Stop it before building."
        return 1
    fi

    echo "Building MARS..."

    if ! make -j"$(nproc)"; then
        echo "ERROR: MARS build failed."
        return 1
    fi

    if [ ! -x "$BIN" ]; then
        echo "ERROR: MARS executable not found."
        return 1
    fi

    echo "MARS build completed."
}

# ==========================================
# START
# ==========================================

start() {

    if [ -f "$PIDFILE" ]; then

        if PID=$(get_pid); then
            echo "MARS already running (PID: $PID)"
            return 0
        fi

        rm -f "$PIDFILE"
    fi

    if [ ! -x "$BIN" ]; then
        echo "ERROR: MARS executable not found."
        echo "Run: ./marsrun.sh build"
        return 1
    fi

    mkdir -p "$(dirname "$LOGFILE")"

    echo "Starting MARS..."

    nohup "$BIN" \
        >> "$LOGFILE" 2>&1 \
        </dev/null &

    PID=$!

    echo "$PID" > "$PIDFILE"

    sleep 2

    if is_mars_running "$PID"; then
        echo "MARS running (PID: $PID)"
        return 0
    fi

    echo "ERROR: MARS failed to start."

    rm -f "$PIDFILE"

    tail -n 40 "$LOGFILE"

    return 1
}

# ==========================================
# STOP
# ==========================================

stop() {

    if ! PID=$(get_pid); then
        rm -f "$PIDFILE"
        echo "MARS is not running."
        return 0
    fi

    echo "Stopping MARS (PID: $PID)..."

    kill -TERM "$PID"

    for i in {1..20}; do

        if ! is_mars_running "$PID"; then
            break
        fi

        sleep 1
    done

    if is_mars_running "$PID"; then
        echo "Force stopping MARS..."
        kill -KILL "$PID"
    fi

    rm -f "$PIDFILE"

    echo "MARS stopped."
}

# ==========================================
# STATUS
# ==========================================

status() {

    if ! PID=$(get_pid); then
        echo "MARS stopped."
        return 1
    fi

    echo "MARS running (PID: $PID)"

    return 0
}

# ==========================================
# RESTART
# ==========================================

restart() {

    stop || return 1

    build || return 1

    start
}

# ==========================================
# CLEAN
# ==========================================

clean() {

    stop || return 1

    echo "Cleaning MARS..."

    make clean
}

# ==========================================
# INFO
# ==========================================

info() {
    make info
}

# ==========================================
# COMMANDS
# ==========================================

case "${1:-restart}" in

    build)
        build
        ;;

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

    clean)
        clean
        ;;

    info)
        info
        ;;

    *)
        echo "Usage: $0 {build|start|stop|restart|status|clean|info}"
        exit 1
        ;;

esac