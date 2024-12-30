#!/bin/bash
#get .env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
# Helper function to log messages
log() {
    echo "[INFO] $1"
}
# Helper function to execute MySQL commands
mysql_exec() {
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "$1" "$DB_NAME"
}
mysql_adminexec() {
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "$1" "$DB_ADMINAME"
}
ROOT=$(pwd)
CUBO_DIR="${ROOT}/cubos"
KRONOS_SERVICES="${ROOT}/kronos/services"
ERMIS_SERVICES="${ROOT}/ermis/services"
GOD_SERVICES="${ROOT}/god/services"
#autocheck.sh ACTION - CUBO - METADATA -
#TODO dependencies
#TODO delete doubles, change names like openai_ermis_generate(system_name)
#TODO parse all routes and:
  # - get update action.endpoints
  # - test endpoint and update action.status
  # - return in action.log
  #


#1 ACTION INSERTS BASED ON FILESYSTEM

#1 ACTION READ filesystem check services
# in folders kronos/services/[SERVICE_NAME]  kronos is systems.name
             #ermis/services/[SERVICE_NAME]  ermis is systems.name
             #god/services /[SERVICE_NAME]   god is systems.name
#if file not in folder, add file routes.py (kronos) or routes.js in ermis or routes.go in god
# 1. Handle Services
handle_services() {
    log "Checking and updating services for Kronos, Ermis, and God..."

    # Loop through services directories
    for SYSTEM in "$KRONOS_SERVICES" "$ERMIS_SERVICES" "$GOD_SERVICES"; do
        # Extract SYSTEM_NAME from the folder structure
        SYSTEM_NAME=$(echo "$SYSTEM" | awk -F'/' '{print $(NF-1)}')

        # Check each service folder
          for SERVICE in $(find "$SYSTEM" -mindepth 1 -maxdepth 1 -type d -exec basename {} \;); do
            SERVICE_NAME=$(basename "$SERVICE")
            log "Processing service: $SERVICE_NAME in $SYSTEM_NAME"

            # Insert into actiongrp and action
          mysql_adminexec "
              -- Insert into actiongrp and get the ID
              INSERT IGNORE INTO actiongrp (name, type)
              VALUES ('$SERVICE_NAME', 'service');

              -- Use the ID for the next query
              INSERT INTO action (names, actiongrpid, systemsid, type, status)
              VALUES (
                  '$SERVICE_NAME',
                  COALESCE(
                      (SELECT id FROM actiongrp WHERE name='$SERVICE_NAME' LIMIT 1),
                      LAST_INSERT_ID()
                  ),
                  (SELECT id FROM systems WHERE name='$SYSTEM_NAME'),
                  'route',
                  'testing'
              );
          "
        done
    done
}
# Logging function
log() {
    echo "[INFO] $1"
}
# 1. Handle services
handle_services
log "Script completed successfully!"