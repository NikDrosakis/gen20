#!/bin/bash
# Cubo Watcher - Triggered by gen-daemon or an external service

ROOT="/var/www/gs"
LOG_FILE="$ROOT/log/cubo-watch.log"


process_cubo_change() {
    local resource="$1"

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Processing: $resource" >> "$LOG_FILE"

    if gen gaia updateCacheCP "$resource"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cache updated: $resource" >> "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED: $resource" >> "$LOG_FILE"
    fi
}

# External calls should pass the full resource name (e.g., "main.public")
if [[ -n "$1" ]]; then
    process_cubo_change "$1"
else
    echo "Usage: $0 <resource_name>" >> "$LOG_FILE"
    exit 1
fi