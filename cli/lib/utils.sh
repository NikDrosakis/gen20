#!/bin/bash

# Define root directory
ROOT="/var/www/gs"


# Standardized log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [LOG] $1"
}

# Standardized error function
error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >&2
    exit 1
}

# Load environment variables from .env
ENV_FILE="$ROOT/.env"
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    log "⚠️ No .env file found at $ENV_FILE"
fi

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
    systemctl is-active --quiet "$service_name"
    if [ $? -eq 0 ]; then
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

