#!/bin/bash

# Define paths
LOG_FILE="/var/www/gs/log/god.log"  # Adjust if needed
CLI_DIR="/var/www/gs/cli"
UTILS="$CLI_DIR/utils.sh"
GOD_ROOT="/var/www/gs/god"  # Path to the GoGin application

# Source utils.sh or exit if missing
if ! source "$CLI_DIR/com/god/common.sh" 2>/dev/null; then
    echo "❌ Error: Missing common.sh" >&2
    exit 1
fi
# Source utils.sh or exit if missing
if ! source "$UTILS" 2>/dev/null; then
    echo "❌ Error: $UTILS" >&2
    exit 1
fi
# Run the stop function
stop_god