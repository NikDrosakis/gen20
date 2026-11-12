#!/bin/bash
# KRONOS — Python AI and model services
# Source-only. Όλες οι εκφράσεις είναι functions: kronos_<verb>.

# --------------------------------------------------
# Paths
# --------------------------------------------------

KRONOS_ROOT="${KRONOS_ROOT:-/var/www/gs/kronos}"
KRONOS_VENV="${KRONOS_VENV:-$KRONOS_ROOT/genenv}"
KRONOS_PID="${KRONOS_PID:-$KRONOS_ROOT/kronos.pid}"
KRONOS_LOG="${KRONOS_LOG:-/var/www/gs/data/gen20.net/kronos.txt}"
KRONOS_PORT="${KRONOS_PORT:-3006}"
KRONOS_APP="${KRONOS_APP:-main:app}"
KRONOS_GUNICORN="$KRONOS_VENV/bin/gunicorn"

mkdir -p "$(dirname "$KRONOS_LOG")"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

kronos_log() {
    printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$KRONOS_LOG"
}

kronos_error() {
    printf '❌ %s\n' "$*" >&2
    kronos_log "ERROR: $*"
}

kronos_is_running() {
    local pid="$1"
    local cmd cwd

    [[ "$pid" =~ ^[0-9]+$ ]] || return 1
    kill -0 "$pid" 2>/dev/null || return 1

    cmd=$(tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null)
    cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null)

    [[ "$cmd" == *gunicorn* ]] || return 1
    [[ "$cmd" == *"$KRONOS_APP"* ]] || return 1
    [[ "$cwd" == "$KRONOS_ROOT" ]] || return 1

    return 0
}

kronos_get_pid() {
    [[ -f "$KRONOS_PID" ]] || return 1
    local pid
    pid=$(cat "$KRONOS_PID")
    kronos_is_running "$pid" || return 1
    echo "$pid"
}

kronos_health() {
    curl -fsS --max-time 3 \
        "http://127.0.0.1:$KRONOS_PORT/apy/v1/openapi.json" \
        >/dev/null 2>&1
}

# --------------------------------------------------
# Expressions
# --------------------------------------------------

kronos_about() { printf '%s\n' 'KRONOS | Python AI and model services'; }
kronos_esti()  { printf '%s\n' 'KRONOS | Python AI and model services'; }
kronos_help()  { printf '%s\n' 'Expressions: about esti help start stop restart status service'; }

kronos_start() {
    local pid

    if [[ ! -x "$KRONOS_GUNICORN" ]]; then
        kronos_error "gunicorn not found: $KRONOS_GUNICORN"
        return 1
    fi

    if pid=$(kronos_get_pid); then
        kronos_log "already running (PID $pid)"
        return 0
    fi

    rm -f "$KRONOS_PID"

    if ! cd "$KRONOS_ROOT"; then
        kronos_error "cannot cd to $KRONOS_ROOT"
        return 1
    fi

    kronos_log "🚀 starting on port $KRONOS_PORT"

    nohup "$KRONOS_GUNICORN" \
        --workers 1 \
        --worker-class uvicorn.workers.UvicornWorker \
        --bind "0.0.0.0:$KRONOS_PORT" \
        --log-level debug \
        --timeout 300 \
        --graceful-timeout 20 \
        --access-logfile - \
        --error-logfile - \
        --pid "$KRONOS_PID" \
        "$KRONOS_APP" \
        >> "$KRONOS_LOG" 2>&1 \
        </dev/null &

    local i
    for i in {1..10}; do
        sleep 1
        if pid=$(kronos_get_pid); then
            kronos_log "process running (PID $pid)"
            break
        fi
    done

    if [[ -z "${pid:-}" ]] || ! kronos_is_running "$pid"; then
        kronos_error "failed to start"
        tail -n 40 "$KRONOS_LOG" >&2
        return 1
    fi

    for i in {1..15}; do
        if kronos_health; then
            kronos_log "✅ API ready on port $KRONOS_PORT"
            return 0
        fi
        sleep 1
    done

    kronos_error "process running but API not responding"
    tail -n 30 "$KRONOS_LOG" >&2
    return 1
}

kronos_stop() {
    local pid

    # 1. Σκότωσε όλα τα gunicorn του kronos
    if pkill -f "gunicorn.*$KRONOS_APP" 2>/dev/null; then
        kronos_log "🛑 stopping all gunicorn processes"
    fi

    # 2. Περίμενε
    local i
    for i in {1..20}; do
        if ! pgrep -f "gunicorn.*$KRONOS_APP" >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    # 3. Αν ακόμα τρέχει → SIGKILL
    if pgrep -f "gunicorn.*$KRONOS_APP" >/dev/null 2>&1; then
        kronos_log "⚠️ SIGKILL"
        pkill -KILL -f "gunicorn.*$KRONOS_APP" 2>/dev/null
    fi

    rm -f "$KRONOS_PID"
    kronos_log "✅ stopped"
    return 0
}

kronos_restart() {
    kronos_stop
    kronos_start
}

kronos_status() {
    local pid

    if ! pid=$(kronos_get_pid); then
        kronos_error "stopped"
        return 1
    fi

    kronos_log "running (PID $pid)"

    if kronos_health; then
        kronos_log "✅ API ready on port $KRONOS_PORT"
        return 0
    fi

    kronos_error "API not responding on port $KRONOS_PORT"
    return 1
}

kronos_service() {
    local name="${1:-}"
    local action="${2:-}"

    if [[ -z $name || -z $action ]]; then
        printf 'Usage: kronos service <name> <new|delete>\n' >&2
        return 1
    fi

    local service_path="$KRONOS_ROOT/services/$name"
    local env_file="/var/www/gs/.env"

    if [[ -f $env_file ]]; then
        set -a
        source "$env_file"
        set +a
    fi

    case "$action" in
        new)
            mkdir -p "$service_path" || {
                kronos_error "cannot create $service_path"
                return 1
            }

            cat > "$service_path/routes.py" <<EOF
from fastapi import APIRouter

router = APIRouter()

@router.get('/')
def read_root():
    return {'message': 'Welcome to $name'}
EOF

            : > "$service_path/start.py"
            : > "$service_path/__init__.py"

            # DB update (προαιρετικό — αν έχεις DB)
            if [[ -n ${DB_USER:-} && -n ${DB_PASS:-} && -n ${DB_HOST:-} && -n ${DB_NAME:-} ]]; then
                mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -D "$DB_NAME" \
                    -e "INSERT INTO ${INTEGRATION_TABLE:-integration} (systemsid, status, name) VALUES (7, 1, '$name');" \
                    || kronos_error "DB insert failed"
            fi

            # main.py integration
            if [[ -f "$KRONOS_ROOT/main.py" ]]; then
                sed -i "/#integrations/a from services.$name.routes import router as ${name}_route" "$KRONOS_ROOT/main.py"
                sed -i "/#includes/a app.include_router(${name}_route, prefix=\"/apy/v1/$name\")" "$KRONOS_ROOT/main.py"
            fi

            kronos_log "✅ service '$name' created"
            ;;

        delete)
            rm -rf "$service_path" || {
                kronos_error "cannot delete $service_path"
                return 1
            }

            if [[ -n ${DB_USER:-} && -n ${DB_PASS:-} && -n ${DB_HOST:-} && -n ${DB_NAME:-} ]]; then
                mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -D "$DB_NAME" \
                    -e "DELETE FROM ${INTEGRATION_TABLE:-integration} WHERE name='$name';" \
                    || kronos_error "DB delete failed"
            fi

            if [[ -f "$KRONOS_ROOT/main.py" ]]; then
                sed -i "/from services.$name.routes import router as ${name}_route/d" "$KRONOS_ROOT/main.py"
                sed -i "/app.include_router(${name}_route, prefix=\"\/apy\/v1\/$name\")/d" "$KRONOS_ROOT/main.py"
            fi

            kronos_log "✅ service '$name' deleted"
            ;;

        *)
            printf 'Invalid action: %s (use new|delete)\n' "$action" >&2
            return 1
            ;;
    esac
}

kronos_list() {
    local dir="${1:-$KRONOS_ROOT/cubos}"

    [[ -d $dir ]] || { kronos_error "not found: $dir"; return 1; }

    local items=()
    while IFS= read -r -d '' entry; do
        items+=("$(basename -- "$entry")")
    done < <(find "$dir" -mindepth 1 -maxdepth 1 -print0 2>/dev/null | sort -z)

    ((${#items[@]})) || { kronos_error "empty: $dir"; return 1; }

    printf '%s\n' "${items[*]}"
}


# Στο systems/kronos.sh (μετά το kronos_service)

kronos_ping() {
    local msg="${1:-ping}"
    local to="${2:-god:1}"

    if ! command -v websocat >/dev/null 2>&1; then
        printf '❌ websocat not installed\n' >&2
        return 1
    fi

    local uri="wss://gen20.net/god/v1/messaging/ws?userid=kronos%3A1"
    local payload
    payload=$(jq -cn \
        --arg msg "$msg" \
        --arg to "$to" \
        --arg system "kronos" \
        '{system: $system, msg: $msg, to: $to}')

    printf '🔌 %s\n' "$uri"
    printf '📤 %s\n' "$payload"
    printf '%s\n' "$payload" | websocat -t -1 "$uri"
}

kronos_ask() {
    local question="${1:-}"

    if [[ -z $question ]]; then
        printf 'Usage: kronos ask "<question>"\n' >&2
        return 1
    fi

    local uri="wss://gen20.net/god/v1/messaging/ws?userid=sol%3A1"
    local payload
    payload=$(jq -cn \
        --arg msg "$question" \
        --arg to "kronos:1" \
        '{system: "sol", msg: $msg, to: $to, type: "ask"}')

    printf '🔌 %s\n' "$uri"
    printf '📤 %s\n' "$payload"
    printf '📬 waiting for kronos...\n'
    printf '%s\n' "$payload" | websocat -t "$uri"
}