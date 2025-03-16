#!/bin/bash

hash -r  # Reset shell command hash

# Define paths
ENV_FILE="/var/www/gs/.env"
TARGET_PATH="/usr/local/bin/gen"
LOG_FILE="/var/www/gs/log/gen20.log"
BG_DIR="$CLI_ROOT/bg"
PID_FILE="/tmp/gen-daemon.pid"
DAEMON="$BG_DIR/daemon-update.sh"
CLI_ROOT="/var/www/gs/cli"
CLI_UTILS="$CLI_ROOT/lib/utils.sh"

# Check if .env exists and source it
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"  # Load .env to get the variables like CLI_UTILS
else
    echo "⚠️ .env file not found. Exiting..."
    exit 1
fi

# Debugging output: Check if CLI_UTILS is set
echo "CLI_UTILS is set to: $CLI_UTILS"
echo "GEN_VERSION is currently: $GEN_VERSION"

# Check if CLI_UTILS is set and valid
if [ -z "$CLI_UTILS" ]; then
    echo "⚠️ CLI_UTILS is not set. Exiting..."
    exit 1
fi

# Source the utils.sh file from the CLI_UTILS path
if [ -f "$CLI_UTILS" ]; then
    source "$CLI_UTILS"  # Source the utility functions
else
    echo "⚠️ CLI_UTILS file not found at $CLI_UTILS. Exiting..."
    exit 1
fi

# Increment GEN_VERSION
if [ -n "$GEN_VERSION" ]; then
    ((GEN_VERSION++))  # Increment the version
else
    GEN_VERSION=1  # If not set, start at version 1
fi

# Write the new GEN_VERSION back to the .env file
echo "GEN_VERSION=$GEN_VERSION" > "$ENV_FILE"
echo "✅ GEN_VERSION updated to $GEN_VERSION"

# Ensure correct permissions for the CLI directory
chmod -R +x "$CLI_ROOT"
chown -R dros:dros "$CLI_ROOT"

# Ensure the system-wide script is executable
chmod +x "$TARGET_PATH"
chown dros:dros "$TARGET_PATH"

# Log the update
echo "✅ Updated Gen to version $GEN_VERSION" | tee -a "$LOG_FILE"

# Restart Gen daemon if running
if pgrep -x "gen" > /dev/null; then
    echo "🛠 Restarting Gen daemon..."
    gen restart
else
    echo "⚠️ Gen daemon not running. Skipping restart."
fi

echo "✔️ Update complete! New version: $GEN_VERSION"
