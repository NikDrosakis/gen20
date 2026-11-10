#!/bin/bash
ROOT="/var/www/gs"
SUN_DIR="$ROOT/sun"
COMMON="$SUN_DIR/utils.sh"
BG_DIR="$SUN_DIR/bg"
LOG_FILE="$ROOT/log/gen.log"
COM_DIR="$SUN_DIR/com"

# Standardized log function
log() {
    echo "[${BASH_SOURCE[1]}:${LINENO}] [LOG] $1"
}

# Standardized error function
error() {
    echo "[${BASH_SOURCE[1]}:${LINENO}] [ERROR] $1" >&2
    exit 1
}
# ==================================================
# Daemon Control Functions
# ==================================================

start() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Daemon already running (PID: $(cat "$PID_FILE"))"
        return 0
    fi

    echo "Starting gen20 daemon..."
    nohup "$DAEMON" >> "$LOG_DIR/gend.log" 2>&1 &
    echo $! > "$PID_FILE"

    sleep 0.5  # Give it time to start
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "✅ Daemon started (PID: $(cat "$PID_FILE"))"
    else
        echo "❌ Failed to start daemon"
        [ -f "$PID_FILE" ] && rm -f "$PID_FILE"
        return 1
    fi
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill -9 "$PID"
            rm -f "$PID_FILE"
            echo "Daemon stopped"
        else
            echo "Stale PID file found - cleaning up"
            rm -f "$PID_FILE"
        fi
    else
        echo "Daemon not running"
    fi
}

is_running() {
    [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null
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
get_current_version() {
    local query="SELECT val FROM gen_admin.globs WHERE name='GEN_VERSION';"
    local version=$(mariadb -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -D "$DB_NAME" -N -B -e "$query")
    echo "$version"
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
            COMPREPLY=( $(compgen -W "$(ls "$SUN_DIR/com/$selected_group"/*.sh 2>/dev/null)" -- "$cur") )
        fi
    fi
    return 0
}
