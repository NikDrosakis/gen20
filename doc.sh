#!/bin/bash
#get .env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
# Helper function to log messages
log() {
    echo "[INFO] $1"
}
ROOT=$(pwd)
CUBO_DIR="${ROOT}/cubos"
KRONOS_SERVICES="${ROOT}/kronos/services"
ERMIS_SERVICES="${ROOT}/ermis/services"
GOD_SERVICES="${ROOT}/god/services"
# Helper function to execute MySQL commands
mysql_exec() {
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "$1" "$DB_NAME"
}
mysql_adminexec() {
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "$1" "$DB_ADMINAME"
}

#ADD ALL doc FIELDS with documentation
#1 get all doc fields from information schema
#
# use ai for composition
