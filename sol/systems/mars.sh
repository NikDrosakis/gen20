#!/bin/bash
# MARS — native C++ services and fast tasks
# Source-only. Όλες οι εκφράσεις είναι functions: mars_<verb>.

# --------------------------------------------------
# Paths
# --------------------------------------------------

MARS_ROOT="${MARS_ROOT:-/var/www/gs/mars}"
MARS_BIN="${MARS_BIN:-$MARS_ROOT/main}"
MARS_PID="${MARS_PID:-$MARS_ROOT/mars.pid}"
MARS_LOG="${MARS_LOG:-/var/www/gs/data/gen20.net/mars.txt}"
MARS_PORT="${MARS_PORT:-3004}"

mkdir -p "$(dirname "$MARS_LOG")"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

mars_log() {
    printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$MARS_LOG"
}

mars_error() {
    printf '❌ %s\n' "$*" >&2
    mars_log "ERROR: $*"
}

mars_is_running() {
    local pid="$1"
    local exe expected

    [[ "$pid" =~ ^[0-9]+$ ]] || return 1
    kill -0 "$pid" 2>/dev/null || return 1

    exe=$(readlink -f "/proc/$pid/exe" 2>/dev/null)
    expected=$(readlink -f "$MARS_BIN" 2>/dev/null)

    [[ -n $expected && $exe == "$expected" ]]
}

mars_get_pid() {
    [[ -f "$MARS_PID" ]] || return 1
    local pid
    pid=$(cat "$MARS_PID")
    mars_is_running "$pid" || return 1
    echo "$pid"
}

# --------------------------------------------------
# Expressions
# --------------------------------------------------

mars_about() { printf '%s\n' 'MARS | native C++ services and fast tasks'; }
mars_esti()  { printf '%s\n' 'MARS | native C++ services and fast tasks'; }
mars_help()  { printf '%s\n' 'Expressions: about esti help build start stop restart status clean info'; }

mars_build() {
    local pid

    if pid=$(mars_get_pid); then
        mars_error "running (PID $pid) — stop before building"
        return 1
    fi

    if ! cd "$MARS_ROOT"; then
        mars_error "cannot cd to $MARS_ROOT"
        return 1
    fi

    mars_log "🔨 building..."
    if ! make -j"$(nproc)" >> "$MARS_LOG" 2>&1; then
        mars_error "build failed"
        tail -n 40 "$MARS_LOG" >&2
        return 1
    fi

    if [[ ! -x $MARS_BIN ]]; then
        mars_error "executable not found: $MARS_BIN"
        return 1
    fi

    mars_log "✅ build completed"
    return 0
}

mars_start() {
    local pid

    if [[ -f "$MARS_PID" ]]; then
        if pid=$(mars_get_pid); then
            mars_log "already running (PID $pid)"
            return 0
        fi
        rm -f "$MARS_PID"
    fi

    if [[ ! -x $MARS_BIN ]]; then
        mars_error "executable not found: $MARS_BIN (run: mars build)"
        return 1
    fi

    mars_log "🚀 starting"

    nohup "$MARS_BIN" >> "$MARS_LOG" 2>&1 </dev/null &
    pid=$!
    echo "$pid" > "$MARS_PID"

    sleep 2

    if mars_is_running "$pid"; then
        mars_log "✅ running (PID $pid)"
        return 0
    fi

    mars_error "failed to start"
    rm -f "$MARS_PID"
    tail -n 40 "$MARS_LOG" >&2
    return 1
}

mars_stop() {
    local pid

    if ! pid=$(mars_get_pid); then
        rm -f "$MARS_PID"
        mars_log "ℹ️ not running"
        return 0
    fi

    mars_log "🛑 stopping PID $pid"
    kill -TERM "$pid" 2>/dev/null

    local i
    for i in {1..20}; do
        mars_is_running "$pid" || break
        sleep 1
    done

    if mars_is_running "$pid"; then
        mars_log "⚠️ SIGKILL"
        kill -KILL "$pid" 2>/dev/null
    fi

    rm -f "$MARS_PID"
    mars_log "✅ stopped"
    return 0
}

mars_restart() {
    mars_stop
    mars_build
    mars_start
}

mars_status() {
    local pid

    if ! pid=$(mars_get_pid); then
        mars_error "stopped"
        return 1
    fi

    mars_log "✅ running (PID $pid)"
    return 0
}

mars_clean() {
    mars_stop

    if ! cd "$MARS_ROOT"; then
        mars_error "cannot cd to $MARS_ROOT"
        return 1
    fi

    mars_log "🧹 cleaning"
    make clean >> "$MARS_LOG" 2>&1
    return $?
}

mars_info() {
    if ! cd "$MARS_ROOT"; then
        mars_error "cannot cd to $MARS_ROOT"
        return 1
    fi
    make info
}

mars_list() {
    local dir="${1:-$MARS_ROOT/cubos}"

    [[ -d $dir ]] || { mars_error "not found: $dir"; return 1; }

    local items=()
    while IFS= read -r -d '' entry; do
        items+=("$(basename -- "$entry")")
    done < <(find "$dir" -mindepth 1 -maxdepth 1 -print0 2>/dev/null | sort -z)

    ((${#items[@]})) || { mars_error "empty: $dir"; return 1; }

    printf '%s\n' "${items[*]}"
}