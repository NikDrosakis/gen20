
#!/usr/bin/env bash
# GEN20 - GEND WebSocket Status Publisher

set -Eeuo pipefail

# --------------------------------------------------
# Environment
# --------------------------------------------------

ENV_FILE="/var/www/gs/sol/.env"

if [[ -f "$ENV_FILE" ]]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

# --------------------------------------------------
# Configuration
# --------------------------------------------------

WSS_URI="${WSS_URI:-wss://gen20.net/god/v1/ws/?userid=1}"
USER_ID="${USER_ID:-1}"
PUBLISH_INTERVAL="${PUBLISH_INTERVAL:-10}"

ROOT="${ROOT:-/var/www/gs}"
SOL_ROOT="${SOL_ROOT:-$ROOT/sol}"

LOG_FILE="${LOG_FILE:-$ROOT/data/gen20.net/gend-ws.txt}"

# PID files supplied by .env
GEND_PID_FILE="${GEND_PID_FILE:-$SOL_ROOT/gen.pid}"

# KRONOS_PID_FILE and MARS_PID_FILE must come from .env.

# Systemd-managed services
declare -A UNITS=(
    [gaia]="php8.2-fpm.service"
    [god]="god.service"
    [nginx]="nginx.service"
)

SYSTEMS=(
    gend
    god
    moon
    gaia
    kronos
    mars
    database
    redis
    nginx
)

mkdir -p "$(dirname "$LOG_FILE")"

log() {
    printf '[%s] %s\n' "$(date '+%F %T')" "$*" >> "$LOG_FILE"
}

# --------------------------------------------------
# Dependencies
# --------------------------------------------------

for cmd in websocat jq systemctl redis-cli curl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "Missing dependency: $cmd" >&2
        exit 1
    fi
done

if ! command -v mariadb >/dev/null 2>&1 &&
   ! command -v mysql >/dev/null 2>&1; then
    echo "Missing dependency: mariadb or mysql" >&2
    exit 1
fi

if [[ -z "${REDIS_PASS:-}" ]]; then
    echo "REDIS_PASS is missing from .env" >&2
    exit 1
fi

# --------------------------------------------------
# PID checks
# --------------------------------------------------

check_pid() {
    local pid_file="$1"
    local pid

    if [[ -z "$pid_file" || ! -f "$pid_file" ]]; then
        echo "unknown"
        return
    fi

    pid=$(<"$pid_file")

    if [[ "$pid" =~ ^[0-9]+$ ]] &&
       [[ -d "/proc/$pid" ]] &&
       kill -0 "$pid" 2>/dev/null; then
        echo "online"
    else
        echo "offline"
    fi
}

# --------------------------------------------------
# Redis
# --------------------------------------------------

check_redis() {
    local result

    result=$(
        REDISCLI_AUTH="$REDIS_PASS" redis-cli \
            -h 127.0.0.1 \
            --no-auth-warning \
            --raw PING 2>/dev/null
    ) || {
        echo "offline"
        return
    }

    [[ "$result" == "PONG" ]] && echo "online" || echo "offline"
}

# --------------------------------------------------
# MariaDB
# --------------------------------------------------

check_database() {
    local db_client

    if command -v mariadb >/dev/null 2>&1; then
        db_client="mariadb"
    else
        db_client="mysql"
    fi

    if MYSQL_PWD="${DB_PASS:-}" "$db_client" \
        -h "${DB_HOST:-localhost}" \
        -u "${DB_USER:-root}" \
        --connect-timeout=3 \
        -Nse "SELECT 1" >/dev/null 2>&1; then
        echo "online"
    else
        echo "offline"
    fi
}

# --------------------------------------------------
# HTTP checks
# --------------------------------------------------

check_moon() {
    if curl -fsS --max-time 3 \
        https://gen20.net/ >/dev/null 2>&1; then
        echo "online"
    else
        echo "offline"
    fi
}

# --------------------------------------------------
# System status
# --------------------------------------------------

check_system() {
    local name="$1"
    local unit="${UNITS[$name]:-}"

    case "$name" in

        gend)
            check_pid "$GEND_PID_FILE"
            ;;

        kronos)
            check_pid "${KRONOS_PID_FILE:-}"
            ;;

        mars)
            check_pid "${MARS_PID_FILE:-}"
            ;;

        redis)
            check_redis
            ;;

        database)
            check_database
            ;;

        moon)
            check_moon
            ;;

        god|gaia|nginx)
            if systemctl is-active --quiet "$unit" 2>/dev/null; then
                echo "online"
            else
                echo "offline"
            fi
            ;;

        *)
            echo "unknown"
            ;;

    esac
}

# --------------------------------------------------
# Build system snapshot
# --------------------------------------------------

build_snapshot() {
    local json='{}'
    local system
    local status

    for system in "${SYSTEMS[@]}"; do

        status=$(check_system "$system")

        json=$(jq -c \
            --arg name "$system" \
            --arg status "$status" \
            '. + {($name): $status}' <<< "$json")

    done

    printf '%s\n' "$json"
}

# --------------------------------------------------
# WebSocket connection
# --------------------------------------------------

WS_PROC_PID=""
WS_READER_PID=""
WS_IN_FD=""
WS_OUT_FD=""

close_ws() {

    if [[ -n "$WS_READER_PID" ]]; then
        kill "$WS_READER_PID" 2>/dev/null || true
        WS_READER_PID=""
    fi

    if [[ -n "$WS_PROC_PID" ]]; then
        kill "$WS_PROC_PID" 2>/dev/null || true
        wait "$WS_PROC_PID" 2>/dev/null || true
        WS_PROC_PID=""
    fi

    if [[ -n "$WS_IN_FD" ]]; then
        exec {WS_IN_FD}>&- 2>/dev/null || true
        WS_IN_FD=""
    fi

    if [[ -n "$WS_OUT_FD" ]]; then
        exec {WS_OUT_FD}<&- 2>/dev/null || true
        WS_OUT_FD=""
    fi
}

cleanup() {
    log "Stopping WebSocket publisher"
    close_ws
}

trap cleanup EXIT
trap 'exit 0' INT TERM

connect_ws() {

    log "Connecting to GOD Messaging Hub"

    coproc GOD_WS {
        exec websocat -t "$WSS_URI" 2>>"$LOG_FILE"
    }

    WS_PROC_PID="$GOD_WS_PID"
    WS_IN_FD="${GOD_WS[1]}"
    WS_OUT_FD="${GOD_WS[0]}"

    # Consume incoming messages without flooding the logs.
    local reader_fd="$WS_OUT_FD"

    (
        while IFS= read -r -u "$reader_fd" response; do
            :
        done
    ) &

    WS_READER_PID=$!

    sleep 1

    if ! kill -0 "$WS_PROC_PID" 2>/dev/null; then
        close_ws
        log "GOD WebSocket connection failed"
        return 1
    fi

    log "GOD WebSocket connected"
    return 0
}

# --------------------------------------------------
# Send message
# --------------------------------------------------

send_message() {
    local content="$1"
    local timestamp
    local message

    timestamp=$(date +%s)

    message=$(jq -cn \
        --arg system "gend" \
        --arg userid "$USER_ID" \
        --arg to "god" \
        --argjson content "$content" \
        --argjson timestamp "$timestamp" \
        '{
            system: $system,
            type: "message",
            userid: $userid,
            to: $to,
            cast: "all",
            c: $content,
            timestamp: $timestamp
        }')

    if ! printf '%s\n' "$message" >&"$WS_IN_FD"; then
        log "WebSocket send failed"
        return 1
    fi

    return 0
}

# --------------------------------------------------
# Publisher
# --------------------------------------------------

previous=""

log "GEND WebSocket publisher started"

while true; do

    # Connect or reconnect
    if [[ -z "$WS_PROC_PID" ]] ||
       ! kill -0 "$WS_PROC_PID" 2>/dev/null; then

        close_ws

        if ! connect_ws; then
            sleep 3
            continue
        fi

        # Force a fresh snapshot after reconnect.
        previous=""
    fi

    # Collect real system states
    snapshot=$(build_snapshot)

    # Publish only when something changes.
    if [[ "$snapshot" != "$previous" ]]; then

        content=$(jq -cn \
            --arg event "system.status" \
            --argjson systems "$snapshot" \
            '{
                event: $event,
                systems: $systems
            }')

        if send_message "$content"; then
            previous="$snapshot"
            log "System status snapshot published"
        else
            close_ws
            previous=""
        fi

    fi

    sleep "$PUBLISH_INTERVAL"

done
