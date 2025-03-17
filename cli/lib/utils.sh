#!/bin/bash
CLI_ROOT="/var/www/gs/cli"
CLI_UTILS="$CLI_ROOT/lib/utils.sh"
BG_DIR="$CLI_ROOT/bg"
PID_FILE="/tmp/gen-daemon.pid"
LOG_FILE="/var/www/gs/log/gen20.log"
DAEMON="$BG_DIR/daemon-update.sh"
BASE_DIR="$CLI_ROOT/com"

# Standardized log function
log() {
    echo "[${BASH_SOURCE[0]}:${LINENO}] [LOG] $1"
}

# Standardized error function
error() {
    echo "[${BASH_SOURCE[0]}:${LINENO}] [ERROR] $1" >&2
    exit 1
}

# MariaDB Execution Helper
mariadb_exec() {
    QUERY="$1"
    mariadb -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "$QUERY" "$DB_NAME"

    if [ $? -ne 0 ]; then
        error "❌ MariaDB query failed: $QUERY"
    else
        log "✅ MariaDB query executed: $QUERY"
    fi
}

# Ensure a directory exists
check_dir_exists() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        error "❌ Directory '$dir' does not exist."
    fi
}

# Function to check if a service is active
check_service() {
    local service_name="$1"
    log "Checking service: $service_name"
    if systemctl is-active --quiet "$service_name"; then
        log "✅ $service_name is running"
    else
        error "❌ $service_name is NOT running"
    fi
}

# Function to check if a specific port is listening
check_port_listening() {
    local port="$1"

    # Check if the port is in the LISTEN state using netstat
    if netstat -tuln | grep -q ":$port.*LISTEN"; then
        log "✅ Port $port is listening."
        return 0
    else
        error "❌ Port $port is NOT listening."
        return 1
    fi
}

# Run status checks for all systems
run_all_status() {
    for SYSTEM_DIR in "$BASE_DIR"/*; do
        SYSTEM=$(basename "$SYSTEM_DIR")
        STATUS_SCRIPT="$SYSTEM_DIR/status.sh"

        if [ -f "$STATUS_SCRIPT" ]; then
            log "🔍 Checking status of $SYSTEM..."
            bash "$STATUS_SCRIPT" 2>&1 | tee -a "$LOG_FILE"

            EXIT_CODE=${PIPESTATUS[0]}
            if [ $EXIT_CODE -ne 0 ]; then
                log "❌ Error: Status check for $SYSTEM failed with exit code $EXIT_CODE"
            fi
        else
            log "⚠️ No status script found for $SYSTEM"
        fi
    done
}

# Run a specific system command
run_command() {
    SYSTEM=$1    # Example: gaia, ermis, kronos
    COMMAND=$2   # Example: start, deploy, generate
    shift 2
    SCRIPT_PATH="$BASE_DIR/$SYSTEM/$COMMAND.sh"

    if [ ! -f "$SCRIPT_PATH" ]; then
        log "❌ Error: Command script '$SCRIPT_PATH' not found!"

        # Suggest available commands
        if [ -d "$BASE_DIR/$SYSTEM" ]; then
            log "🛠 Available commands for $SYSTEM:"
            ls "$BASE_DIR/$SYSTEM" | grep '.sh$' | sed 's/.sh//g'
        else
            log "⚠️ No such system: $SYSTEM"
        fi
        exit 2
    fi

    log "🚀 Running: $SYSTEM/$COMMAND $@"
    bash "$SCRIPT_PATH" "$@" 2>&1 | tee -a "$LOG_FILE"

    # Capture exit code and handle failures
    EXIT_CODE=${PIPESTATUS[0]}
    if [ $EXIT_CODE -ne 0 ]; then
        log "❌ Error: Command '$SYSTEM/$COMMAND' failed with exit code $EXIT_CODE"
        exit $EXIT_CODE
    fi
}

# Start Daemon
start_daemon() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        log "⚠️ Gen daemon is already running (PID: $(cat "$PID_FILE"))"
    else
        nohup "$CLI_ROOT/bg/daemon-update.sh" &>> "$LOG_FILE" &
        echo $! > "$PID_FILE"
        log "✅ Gen daemon started (PID: $(cat "$PID_FILE"))"
    fi
}

# Stop Daemon
stop_daemon() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill "$PID" 2>/dev/null; then
            log "🛑 Gen daemon stopped (PID: $PID)"
        else
            log "⚠️ Failed to stop daemon (PID: $PID)"
        fi
        rm -f "$PID_FILE"
    else
        log "⚠️ No running daemon found."
    fi
}

# Restart Daemon
restart_daemon() {
    stop_daemon
    sleep 1
    start_daemon
}
