#!/bin/bash
# /var/www/gs/sun/init.sh

export ROOT="/var/www/gs"
export SUN_DIR="$ROOT/sun"

# ΕΝΙΑΙΟ log για όλα τα scripts
export GEN_LOG_FILE="$ROOT/data/gen20.net/gen.txt"
export GEN_LOG_DIR="$(dirname "$GEN_LOG_FILE")"

[ -d "$GEN_LOG_DIR" ] || mkdir -p "$GEN_LOG_DIR"

log_action() {
    local msg="$1"
    local src="${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}"
    local line="${BASH_LINENO[0]:-0}"
    local file
    file=$(basename "$src")
    local ts
    ts=$(date "+%Y-%m-%d %H:%M:%S")
    echo "[$ts] [$file:$line] $msg" | tee -a "$GEN_LOG_FILE"
}