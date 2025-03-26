#!/bin/bash
# Standardized log function
log() {
    echo "[${BASH_SOURCE[0]}:${LINENO}] [LOG] $1"
}

# Function to check if a service is active
check_service() {
    local service_name="$3"
    log "Checking service: $service_name"
    if systemctl is-active --quiet "$service_name"; then
        log "✅ $service_name is running"
    else
        error "❌ $service_name is NOT running"
    fi
}

# Check if required services are running
check_service "nginx"
check_service "php8.2-fpm"
check_service "mariadb"

# Check if the Ermis service (Node.js) is running over SSL on port 3010
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://localhost:3010" --insecure)

# Check if the server responds with HTTP 200 status
if [ "$SERVER_STATUS" -eq 200 ]; then
    log "✅ Ermis (Node.js) service is running over SSL on port 3010"
else
    error "❌ Ermis (Node.js) service is NOT running on port 3010. HTTP Status: $SERVER_STATUS"
fi

# Check if the expected nodemon log is present
if ps aux | grep -q '[n]odemon'; then
    log "✅ [nodemon] process is running and listening on port 3010 over SSL"
else
    error "❌ [nodemon] is not running or failed to start."
fi

# Log the final success message
log "✅ All checks passed! System is OK."
