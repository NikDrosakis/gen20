#!/bin/bash
# GOD — Go API and WebSocket gateway
# Source-only. Όλες οι εκφράσεις είναι functions: god_<verb>.

# --------------------------------------------------
# Paths
# --------------------------------------------------

GOD_ROOT="${GOD_ROOT:-/var/www/gs/god}"
GOD_LOG="${GOD_LOG:-/var/www/gs/data/gen20.net/god.txt}"
GOD_PORT="${GOD_PORT:-3008}"

mkdir -p "$(dirname "$GOD_LOG")"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

god_log() {
    printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GOD_LOG"
}

god_error() {
    printf '❌ %s\n' "$*" >&2
    god_log "ERROR: $*"
}

god_check_port() {
    ss -tulnp 2>/dev/null | grep -q ":$GOD_PORT "
}

god_pids() {
    {
        # compiled binary (exact)
        pgrep -fx "$GOD_ROOT/god" 2>/dev/null
        # `go run` parent (relative or absolute path to main.go)
        pgrep -f "go run .*main\.go" 2>/dev/null
        # whoever actually owns the port (catches go-run temp binaries too)
        ss -tulnp 2>/dev/null | grep ":$GOD_PORT " | grep -oE 'pid=[0-9]+' | sed 's/pid=//'
    } | grep -E '^[0-9]+$' | sort -un
}

god_is_running() {
    local pid
    pid=$(god_pids | head -1)
    [[ -n $pid ]] && echo "$pid"
    [[ -n $pid ]]
}

# --------------------------------------------------
# Expressions
# --------------------------------------------------

god_about() { printf '%s\n' 'GOD | Go API and WebSocket gateway'; }
god_esti()  { printf '%s\n' 'GOD | Go API and WebSocket gateway'; }
god_help()  { printf '%s\n' 'Expressions: about esti help start stop restart status'; }

god_start() {
    local pid

    if pid=$(god_is_running); then
        god_error "already running (PID $pid)"
        return 1
    fi

    if ! cd "$GOD_ROOT"; then
        god_error "cannot cd to $GOD_ROOT"
        return 1
    fi

    # daemon τρέχει το compiled binary (όχι `go run`, που αφήνει temp binaries στο /tmp)
    if [[ ! -x ./god ]]; then
        god_log "🔨 building..."
        go build -o god . >> "$GOD_LOG" 2>&1 || {
            god_error "build failed"
            tail -n 40 "$GOD_LOG" >&2
            return 1
        }
    fi

    god_log "🚀 starting on port $GOD_PORT"
    nohup "$GOD_ROOT/god" >> "$GOD_LOG" 2>&1 &

    sleep 2

    if pid=$(god_is_running); then
        god_log "✅ started (PID $pid)"
        return 0
    fi

    god_error "failed to start"
    tail -n 40 "$GOD_LOG" >&2
    return 1
}

god_stop() {
    local pids timeout=5

    pids=$(god_pids)
    if [[ -z $pids ]]; then
        god_log "ℹ️ not running"
        return 0
    fi

    god_log "🛑 stopping PIDs: $(echo $pids)"
    kill -TERM $pids 2>/dev/null

    while ((timeout-- > 0)); do
        [[ -z $(god_pids) ]] && { god_log "✅ stopped"; return 0; }
        sleep 1
    done

    god_log "⚠️ SIGKILL"
    kill -9 $pids 2>/dev/null
    sleep 1

    if [[ -z $(god_pids) ]]; then
        god_log "✅ stopped (forced)"
        return 0
    fi

    god_error "failed to stop"
    return 1
}

god_restart() {
    god_stop
    god_start
}

god_status() {
    local pid

    if ! god_check_port; then
        god_error "port $GOD_PORT not listening"
        return 1
    fi

    if pid=$(god_is_running); then
        god_log "✅ running (PID $pid), port $GOD_PORT"
        return 0
    fi

    god_error "port $GOD_PORT listening but no process found"
    return 1
}

god_list() {
    local dir="${1:-$GOD_ROOT/cubos}"

    [[ -d $dir ]] || { god_error "not found: $dir"; return 1; }

    local items=()
    while IFS= read -r -d '' entry; do
        items+=("$(basename -- "$entry")")
    done < <(find "$dir" -mindepth 1 -maxdepth 1 -print0 2>/dev/null | sort -z)

    ((${#items[@]})) || { god_error "empty: $dir"; return 1; }

    printf '%s\n' "${items[*]}"
}