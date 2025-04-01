#!/bin/bash
# gaia-watch.sh SINGLE-PROCESS VERSION - To be called directly by gen-daemon or another external trigger

ROOT="/var/www/gs"
SOURCE_DIR="$ROOT/gaia/core"
DEST_DIR="$ROOT/gaia/core2"
LOG_FILE="$ROOT/log/gaia-watch.log"



# Single-file processing function
process_file() {
    local file="$1"
    local filename=$(basename "$file")

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing: $filename" >> "$LOG_FILE"

    if cp "$file" "$DEST_DIR/$filename"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Copied: $filename" >> "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED: $filename" >> "$LOG_FILE"
    fi
}

# Initial setup
mkdir -p "$DEST_DIR"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Service started (PID: $$)" >> "$LOG_FILE"

# External trigger: Process file when called with filename argument
if [[ -n "$1" ]]; then
    process_file "$1"
else
    echo "Usage: $0 <filename>" >> "$LOG_FILE"
    exit 1
fi

