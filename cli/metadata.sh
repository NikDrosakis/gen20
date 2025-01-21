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
#3 METADATA
#3 METADATA check $DB_ADMINAME, $DB_NAME if table exist in metadata.name
  #if not exists delete from metadata.name where check.id=metadata.id
  #READ ALL TABLES FROM $DB_ADMINAME  $ADMINTABLE
  #if $ADMINTABLE not exists in $DB_ADMINAME.metadata.name INSERT

  #READ ALL TABLES FROM $DB_NAMEcom  $TABLE
    #if $TABLE not exists in $DB_NAMEcom.metadata.name INSERT

  #REVERSE READ ALL $DB_ADMINAME.metadata $META_ADMINTABLE
    #if table does not exist in $DB_ADMINAME DELETE record FROM $DB_ADMINAME.metadata

  #REVERSE READ ALL $DB_NAMEcom.metadata $META_TABLE
      #if table does not exist in $DB_NAMEcom DELETE record FROM $DB_NAMEcom.metadata

# 3. Handle Metadata
# Function to handle metadata synchronization
handle_metadata() {
    log "Starting metadata synchronization..."

    # Step 1: Insert missing tables into metadata for $DB_ADMINAME
    for ADMINTABLE in $(mysql_adminexec "SHOW TABLES" "$DB_ADMIN" | tail -n +2); do
        mysql_adminexec "
            INSERT IGNORE INTO metadata (name)
            SELECT '$ADMINTABLE'
            WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE name = '$ADMINTABLE');
        " "$DB_ADMIN"
    done

    # Step 2: Insert missing tables into metadata for $DB_NAMEcom
    for TABLE in $(mysql_exec "SHOW TABLES" "$DB_VIVALIBRO" | tail -n +2); do
        mysql_exec "
            INSERT IGNORE INTO metadata (name)
            SELECT '$TABLE'
            WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE name = '$TABLE');
        " "$DB_VIVALIBRO"
    done

    # Step 3: Remove stale metadata from $DB_ADMINAME
    for META_ADMINTABLE in $(mysql_adminexec "SELECT name FROM metadata" "$DB_ADMIN" | tail -n +2); do
        TABLE_EXISTS=$(mysql_adminexec "SHOW TABLES LIKE '$META_ADMINTABLE'" "$DB_ADMIN" | tail -n +2)
        if [ -z "$TABLE_EXISTS" ]; then
            mysql_adminexec "
                DELETE FROM metadata
                WHERE name = '$META_ADMINTABLE';
            " "$DB_ADMIN"
        fi
    done

    # Step 4: Remove stale metadata from $DB_NAMEcom
    for META_TABLE in $(mysql_exec "SELECT name FROM metadata" "$DB_VIVALIBRO" | tail -n +2); do
        TABLE_EXISTS=$(mysql_exec "SHOW TABLES LIKE '$META_TABLE'" "$DB_VIVALIBRO" | tail -n +2)
        if [ -z "$TABLE_EXISTS" ]; then
            mysql_exec "
                DELETE FROM metadata
                WHERE name = '$META_TABLE';
            " "$DB_VIVALIBRO"
        fi
    done

    log "Metadata synchronization completed!"
}
# 3. Handle Metadata
handle_metadata

log "Script completed successfully!"