#!/bin/bash

# Standardized log function
log() {
    echo "[LOG] $1"
}

error() {
    echo "[ERROR] $1" >&2
}

# Function to stop a service
stop_service() {
    local service_name="$1"
    log "Stopping service: $service_name"
    sudo systemctl stop "$service_name"
    if systemctl is-active --quiet "$service_name"; then
        error "❌ Failed to stop $service_name"
    else
        log "✅ $service_name stopped successfully"
    fi
}

# Stop Ermis (Node.js)
log "Stopping Ermis (Node.js)..."
ERMIS_PID=$(lsof -ti:3010)  # Get the process ID of Node.js running on port 3010

if [ -n "$ERMIS_PID" ]; then
    log "Found Ermis process (PID: $ERMIS_PID), stopping..."
    kill "$ERMIS_PID"
    sleep 2  # Wait a bit for the process to stop
    if ps -p "$ERMIS_PID" > /dev/null; then
        error "❌ Failed to stop Ermis"
        exit 1
    else
        log "✅ Ermis stopped successfully"
    fi
else
    log "⚠️ No active Ermis process found on port 3010"
fi

# Stop related services
stop_service "nginx"
stop_service "php8.2-fpm"
stop_service "mariadb"

# Final check
log "✅ All services stopped successfully!"
exit 0
