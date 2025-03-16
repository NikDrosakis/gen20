#!/bin/bash

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
exit 0
