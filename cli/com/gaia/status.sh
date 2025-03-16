#!/bin/bash

# Check required services
check_service "nginx"
check_service "php8.2-fpm"
check_service "mariadb"

log "✅ All checks passed! System is OK."
exit 0
