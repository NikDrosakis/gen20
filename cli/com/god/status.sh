#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/god.log"
CLI_DIR="/var/www/gs/cli"
UTILS="$CLI_DIR/utils.sh"

# Source utils.sh or exit if missing
if ! source "$CLI_DIR/com/god/common.sh" 2>/dev/null; then
    echo "❌ Error: Missing common.sh" >&2
    exit 1
fi
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: Missing utils.sh" >&2
    exit 1
fi

# Run the GoGin status check
if check_god_status; then
    log "✅ All checks passed! GoGin service is running smoothly."
    exit 0
else
    error "❌ GoGin service check failed"
    exit 1
fi