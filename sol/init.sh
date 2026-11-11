#!/bin/bash
# /var/www/gs/sol/init.sh

log_action() {
    local msg="${1:-}"
    local src="${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}"
    local line="${BASH_LINENO[0]:-0}"
    local file
    file=$(basename "$src")
    local ts
    ts=$(date '+%Y-%m-%d %H:%M:%S')

    printf '[%s] [%s:%s] %s\n' \
        "$ts" "$file" "$line" "$msg" >> "$LOG_FILE"
}