#!/bin/bash
CLI_ROOT="/var/www/gs/cli"
COMMON="$CLI_ROOT/utils.sh"
BG_DIR="$CLI_ROOT/bg"
LOG_FILE="/var/www/gs/log/gen20.log"
DAEMON="$BG_DIR/daemon-update.sh"
COM_DIR="$CLI_ROOT/com"

# Standardized log function
log() {
    echo "[${BASH_SOURCE[1]}:${LINENO}] [LOG] $1"
}

# Standardized error function
error() {
    echo "[${BASH_SOURCE[1]}:${LINENO}] [ERROR] $1" >&2
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
    for SYSTEM_DIR in "$COM_DIR"/*; do
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
    SCRIPT_PATH="$COM_DIR/$SYSTEM/$COMMAND.sh"

    if [ ! -f "$SCRIPT_PATH" ]; then
        log "❌ Error: Command script '$SCRIPT_PATH' not found!"

        # Suggest available commands
        if [ -d "$COM_DIR/$SYSTEM" ]; then
            log "🛠 Available commands for $SYSTEM:"
            ls "$COM_DIR/$SYSTEM" | grep '.sh$' | sed 's/.sh//g'
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

# Function to parse command-line arguments
# Function to parse command-line arguments
# Function to parse command-line arguments
parse_args() {
    local params=("$@")  # All command-line arguments passed to the function
    local parsed_params=()  # To store parsed parameters
    local key_value_regex="^([^=]+)=(.*)$"  # Regex to check for key-value pairs

    # Loop through each argument passed
    for param in "${params[@]}"; do
        # Handle quoted strings (single or double quotes)
        if [[ "$param" =~ ^\".*\"$ ]] || [[ "$param" =~ ^'.*'$ ]]; then
            # Remove surrounding quotes (either single or double)
            param="${param:1:-1}"
            parsed_params+=("$param")  # Add as a single argument
        # Check if the argument contains a comma (for CSV-style parsing)
        elif [[ "$param" == *","* ]]; then
            # Split by comma and handle it as a list
            IFS=',' read -r -a split_params <<< "$param"
            for item in "${split_params[@]}"; do
                parsed_params+=("$item")  # Add each item to parsed params
            done
        # Check if the argument is a key-value pair (e.g., key=value)
        elif [[ "$param" =~ $key_value_regex ]]; then
            # Extract key and value from key=value format
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"
            parsed_params+=("$key=$value")  # Store in parsed params
        else
            # Handle standalone parameters (just add them as they are)
            parsed_params+=("$param")
        fi
    done

    # Return the parsed arguments as a single string
    echo "${parsed_params[@]}"
}

# Συνάρτηση για το autocompletion
_gen_autocomplete() {
    local cur
    cur="${COMP_WORDS[COMP_CWORD]}"  # Η τρέχουσα λέξη που πληκτρολογείται
    COMPREPLY=()  # Αδειάζει τις υπάρχουσες προτάσεις

    # Εάν είναι το πρώτο μέρος της εντολής (π.χ. 'gen')
    if [ ${COMP_CWORD} -eq 1 ]; then
        COMPREPLY=( $(compgen -W "${GEN_COMMANDS[*]}" -- "$cur") )  # Προτείνουμε τις ομάδες (folders)
    # Εάν είναι το δεύτερο μέρος της εντολής (π.χ. το όνομα αρχείου ή command)
    elif [ ${COMP_CWORD} -eq 2 ]; then
        # Ελέγχουμε αν υπάρχει κάποια ομάδα που ταιριάζει (π.χ. 'chat', 'domain', κλπ.)
        local selected_group="${COMP_WORDS[1]}"
        if [[ " ${GEN_COMMANDS[*]} " =~ " ${selected_group} " ]]; then
            # Εδώ μπορείς να προσθέσεις έλεγχο για αρχεία μέσα στον φάκελο της ομάδας
            # Π.χ. να προσφέρεις αρχεία με την κατάληξη '.sh' στον φάκελο της ομάδας
            COMPREPLY=( $(compgen -W "$(ls "$CLI_ROOT/com/$selected_group"/*.sh 2>/dev/null)" -- "$cur") )
        fi
    fi
    return 0
}




# Start Daemon
start_daemon() {
    # Clean up stale PID first with more detailed checks
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if [ -n "$PID" ] && [ "$PID" -eq "$PID" ] 2>/dev/null; then  # Verify it's a number
            if kill -0 "$PID" 2>/dev/null; then
                log "⚠️ Daemon already running (PID: $PID)"
                return 1
            else
                log "⚠️ Cleaning up stale PID file (dead PID: $PID)"
                rm -f "$PID_FILE"
            fi
        else
            log "⚠️ Invalid PID found in $PID_FILE"
            rm -f "$PID_FILE"
        fi
    fi

    log "🚀 Starting Gen daemon..."
    if nohup "$CLI_ROOT/bg/daemon-update.sh" &>> "$LOG_FILE" & then
        PID=$!
        echo "$PID" > "$PID_FILE"
        sleep 1  # Give process time to start
        if kill -0 "$PID" 2>/dev/null; then
            log "✅ Daemon started successfully (PID: $PID)"
            return 0
        else
            log "❌ Daemon failed to start (PID: $PID exited immediately)"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        log "❌ Failed to execute daemon process"
        return 1
    fi
}

stop_daemon() {
    local TIMEOUT=5  # Seconds to wait for graceful shutdown
    local FORCE_TIMEOUT=3  # Additional seconds before force kill

    if [ ! -f "$PID_FILE" ]; then
        log "⚠️ No PID file found at $PID_FILE"
        return 1
    fi

    PID=$(cat "$PID_FILE")
    if [ -z "$PID" ] || ! [ "$PID" -eq "$PID" ] 2>/dev/null; then
        log "❌ Invalid PID in $PID_FILE"
        rm -f "$PID_FILE"
        return 1
    fi

    if kill -0 "$PID" 2>/dev/null; then
        log "🛑 Stopping daemon (PID: $PID)..."
        kill "$PID"  # Send SIGTERM

        # Wait for graceful shutdown
        local waited=0
        while kill -0 "$PID" 2>/dev/null && [ "$waited" -lt "$TIMEOUT" ]; do
            sleep 1
            ((waited++))
        done

        if kill -0 "$PID" 2>/dev/null; then
            log "⚠️ Daemon not responding to SIGTERM, forcing kill..."
            kill -9 "$PID"
            sleep "$FORCE_TIMEOUT"
            if kill -0 "$PID" 2>/dev/null; then
                log "❌ Failed to kill daemon (PID: $PID)"
                return 1
            fi
        fi

        rm -f "$PID_FILE"
        log "✅ Daemon stopped successfully"
        return 0
    else
        log "⚠️ No running daemon found (stale PID: $PID)"
        rm -f "$PID_FILE"
        return 1
    fi
}
# Restart Daemon
restart_daemon() {
    stop_daemon
    sleep 1
    start_daemon
}

# Check Daemon Status
status_daemon() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "✅ Daemon is running (PID: $PID)"
        else
            log "⚠️ Stale PID file found (dead PID: $PID)"
            rm -f "$PID_FILE"
        fi
    else
        log "⚠️ Daemon is not running"
    fi
}
