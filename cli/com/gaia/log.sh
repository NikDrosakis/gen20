#!/bin/bash

# Set log file paths (these can be environment variables or passed as arguments)
LOG_DIR="/var/www/gs/log"
ERROR_LOG="$LOG_DIR/error.log"
GEN_LOG="$LOG_DIR/gen.log"
LOG_FILE="$GEN_LOG"  # Default log file

# Standardized log function with log levels (INFO, ERROR, DEBUG)
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local script_name=$(basename "$0")
    local log_entry="[$timestamp] [$level] [$script_name] $message"

    # Log message output based on level
    case "$level" in
        INFO)
            echo "$log_entry" >> "$LOG_FILE"
            ;;
        ERROR)
            echo "$log_entry" >> "$ERROR_LOG"
            ;;
        DEBUG)
            if [ "$DEBUG_MODE" == "true" ]; then
                echo "$log_entry" >> "$LOG_FILE"
            fi
            ;;
        *)
            echo "❌ Invalid log level: $level"
            return 1
            ;;
    esac

    # You can add more logic here for external log aggregators (e.g., to forward logs to a centralized system)
}

# Standardized error function with enhanced error tracking
error() {
    local message="$1"
    local exit_code="${2:-1}"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local script_name=$(basename "$0")

    echo "[$timestamp] [ERROR] [$script_name] $message" >> "$ERROR_LOG"
    log "ERROR" "$message"

    exit "$exit_code"
}

# Clear logs (can be customized for the specific logs you want to clear)
clear_logs() {
    echo "Clearing logs..."
    > "$GEN_LOG"
    > "$ERROR_LOG"
    log "INFO" "Logs cleared."
}

# Helper to log specific system commands (AI-friendly and automation-friendly)
log_command_execution() {
    local command="$1"
    local output="$2"
    local status="$3"

    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local script_name=$(basename "$0")
    local log_entry="[$timestamp] [COMMAND] [$script_name] Command: $command, Status: $status, Output: $output"

    # Filter out unnecessary details for automation purposes
    log "INFO" "$log_entry"
}

# Function to handle specific system logs (to integrate with external systems like AI or automation)
handle_system_logs() {
    local system="$1"
    local log_file="$2"

    if [ ! -f "$log_file" ]; then
        log "ERROR" "Log file not found: $log_file"
        return 1
    fi

    local log_data=$(cat "$log_file" | grep -v '^#' | grep -v '^$')  # Clean empty lines and comments
    local log_entry="[$system] Log file: $log_file, Entries: $log_data"

    # AI-friendly encoding: convert logs to JSON-like format for easier parsing
    log "INFO" "{ \"system\": \"$system\", \"log\": \"$log_data\" }"
}

# Centralized function for handling multiple logs (for systems like MariaDB, Redis, Web server, etc.)
handle_multiple_logs() {
    local systems=("maria" "redis" "php" "nginx" "gen20")

    for system in "${systems[@]}"; do
        local log_file="$LOG_DIR/$system.log"
        handle_system_logs "$system" "$log_file"
    done
}

# Advanced system status check: aggregate logs into a status file for monitoring systems
check_system_status() {
    local status_file="$LOG_DIR/system_status.log"
    local status_entry="[$(date "+%Y-%m-%d %H:%M:%S")] System status check"

    log "INFO" "$status_entry"
    handle_multiple_logs

    # Save aggregated status to a file
    echo "$status_entry" >> "$status_file"
}


# Function to rotate logs (helps prevent logs from getting too large)
rotate_logs() {
    local max_log_size=50000000  # Example max size in bytes (50MB)
    local log_size=$(stat -c %s "$LOG_FILE")

    if [ "$log_size" -gt "$max_log_size" ]; then
        mv "$LOG_FILE" "$LOG_FILE.old"
        touch "$LOG_FILE"
        log "INFO" "Log rotated. Old log saved as $LOG_FILE.old"
    fi
}

# Example of logging actions
log "INFO" "Logging started."
log "DEBUG" "Debug mode enabled."

# Call the status check function to log multiple system statuses
check_system_status

# Example of rotating logs if they exceed size limit
rotate_logs
