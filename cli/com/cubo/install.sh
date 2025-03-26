#!/bin/bash

# Load utilities
source "$(dirname "$0")/../utils.sh"

log "Processing Cubo operations..."

check_dir_exists "$CUBO_DIR"

for CUBO_NAME in $(ls "$CUBO_DIR"); do
    log "Processing Cubo: $CUBO_NAME"

    # Ensure it's a directory
    if [ ! -d "$CUBO_DIR/$CUBO_NAME" ]; then
        log "Skipping: $CUBO_NAME is not a directory."
        continue
    fi

    # Insert into DB if not exists
    mariadb_exec "INSERT IGNORE INTO gen_admin.cubo (name) VALUES ('$CUBO_NAME');"

    # Get tables associated with Cubo
    CUBO_TABLES=$(mariadb_exec "SELECT tables FROM gen_admin.cubo WHERE name = '$CUBO_NAME';" | tr -d '\n' | tr -d '"')

    if [ -z "$CUBO_TABLES" ]; then
        log "No tables found for $CUBO_NAME."
        continue
    fi

    IFS=',' read -r -a TABLE_ARRAY <<< "$CUBO_TABLES"

    for TABLE in "${TABLE_ARRAY[@]}"; do
        TABLE="c_$(echo "$TABLE" | xargs)"
        EXISTS=$(mariadb_exec "SELECT 1 FROM information_schema.tables WHERE table_schema = '$DB_NAME' AND table_name = '$TABLE' LIMIT 1;")

        if [ -n "$EXISTS" ]; then
            log "Table $TABLE exists."
        else
            log "Table $TABLE missing!"
        fi
    done
done

# Reverse check: Disable missing Cubos
EXISTING_CUBOS=$(ls "$CUBO_DIR" | sed "s/^/'/" | sed "s/$/'/" | tr '\n' ',' | sed 's/,$//')

if [ -n "$EXISTING_CUBOS" ]; then
    mariadb_exec "UPDATE gen_admin.cubo SET status = 0 WHERE name NOT IN ($EXISTING_CUBOS);"
else
    log "No Cubo directories found. Disabling all."
    mariadb_exec "UPDATE gen_admin.cubo SET status = 0;"
fi

log "Cubo operations completed!"


