#!/bin/bash

ROOT="/var/www/gs"                     # Root directory of the application
# Standardized log function
log() {
    echo "[LOG] $1"
}

error() {
    echo "[ERROR] $1" >&2
}

# Function to start a service in the background
start_service() {
    local service_name="$1"
    log "Starting service: $service_name"
    "$service_name" &
}

# Start Ermis (Node.js)
log "Starting Ermis (Node.js)..."

# Navigate to the directory where Ermis is located
cd "$ROOT/ermis" || { error "❌ Failed to navigate to Ermis directory"; exit 1; }

# If you're using npm (make sure package.json has the start script set)
yarn   # Install dependencies (if needed)
yarn run start &  # Start the Ermis service in the background

# Alternatively, if you use node directly, you can use:
# node index.js &

# Wait for a few seconds to ensure the server has started
sleep 3

# Verify if Ermis (Node.js) is running on port 3010
if curl -s -o /dev/null -w "%{http_code}" "https://localhost:3010" --insecure | grep -q "200"; then
    log "✅ Ermis started successfully on port 3010"
else
    error "❌ Ermis failed to start on port 3010"
    exit 1
fi

# Start related services
#start_service "nginx"
#start_service "php8.2-fpm"
#start_service "mariadb"

# Final check
log "✅ All services started successfully!"

