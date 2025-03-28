#!/bin/bash
hash -r
# Define the base directory for all commands
COM_DIR="/var/www/gs/cli"

# Set correct permissions
chmod -R +x "$COM_DIR"/*
chown -R dros:dros "$COM_DIR"/*

# Load environment variables
ENV_FILE="/var/www/gs/.env"

# Create .env if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "GEN_VERSION=1" > "$ENV_FILE"
fi

# Read current version from .env
source "$ENV_FILE"

# Increment version
GEN_VERSION=$((GEN_VERSION + 1))
echo "GEN_VERSION=$GEN_VERSION" > "$ENV_FILE"

# Define paths
SOURCE_PATH="/var/www/gs/cli/gen"
TARGET_PATH="/usr/local/bin"
LOG_FILE="/var/log/gen_install.log"

# Ensure script is executable
chmod +x "$SOURCE_PATH"

# Force update
echo "Updating gen to version $GEN_VERSION..."
cp -r "$SOURCE_PATH" "$TARGET_PATH"
chmod +x "$TARGET_PATH/gen"
chown -R dros:dros "$TARGET_PATH/gen"

echo "Update complete! New version: $GEN_VERSION"
