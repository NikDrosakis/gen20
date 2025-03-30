#!/bin/bash
# SINGLE-PROCESS Cubo Watcher - To be managed by gen-daemon

ROOT="/var/www/gs"
CUBO_DIR="$ROOT/gaia/cubos"
LOG_FILE="$ROOT/log/cubo-watch.log"

# Processing function
process_cubo_change() {
    local changed_file="$1"
    local cubo_name=$(basename "$(dirname "$changed_file")")  # Immediate parent dir
    local file_name=$(basename "$changed_file" .php)
    local resource="$cubo_name.$file_name"

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing: $resource" >> "$LOG_FILE"

    if gen gaia updateCacheCP "$resource"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cache updated: $resource" >> "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED: $resource" >> "$LOG_FILE"
    fi
}

# Initial setup
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Service started (PID: $$)" >> "$LOG_FILE"

# Single inotifywait instance
inotifywait -m -r -e modify,create,delete "$CUBO_DIR" --format '%w%f' | \
while read -r changed_file; do
    process_cubo_change "$changed_file"
done