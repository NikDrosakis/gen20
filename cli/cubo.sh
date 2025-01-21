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
#2 CUBO read cubo/[CUBONAME] and do the same
  # insert into cubo (name) VALUES ('$CUBONAME') if name not exist

#REVERSE READ $DB_ADMINAME.cubo table and check cubo/[CUBONAME]
#if folder does not exist UPDATE cubo.status=0 where name='$CUBONAME'

# 2. Handle Cubo
#2A cubo check cubo.tables of dbs and create sql mysqldump of those tables in cubo/[CUBO_NAME]
# Function to handle Cubo operations
handle_cubo() {
    log "Processing Cubo operations..."

    # Step 1: Ensure the Cubo directory exists
    if [ ! -d "$CUBO_DIR" ]; then
        log "Error: Cubo directory '$CUBO_DIR' does not exist."
        exit 1
    fi

    # Step 2: Process each Cubo folder
    for CUBO_NAME in $(ls "$CUBO_DIR"); do
        log "Processing Cubo: $CUBO_NAME"

        # Check if the folder is valid (ignore non-directories)
        if [ ! -d "$CUBO_DIR/$CUBO_NAME" ]; then
            log "Skipping: $CUBO_NAME is not a directory."
            continue
        fi


        # Insert Cubo into the database if it doesn't exist
        mysql_adminexec "
            INSERT IGNORE INTO cubo (name)
            VALUES ('$CUBO_NAME');
        "

        # Fetch comma-separated tables for the current Cubo
        CUBO_TABLES=$(mysql_adminexec "
            SELECT tables FROM cubo WHERE name = '$CUBO_NAME' AND tables IS NOT NULL;
        " | tr -d '\n' | tr -d '"' | xargs)

        # Check if CUBO_TABLES is not null or empty
        if [ -z "$CUBO_TABLES" ]; then
            log "No valid tables found for $CUBO_NAME (tables column is NULL or empty)."
            exit 0
        fi

        log "Raw CUBO_TABLES: [$CUBO_TABLES]"

        # Split the comma-separated list into an array
        IFS=',' read -r -a TABLE_ARRAY <<< "$CUBO_TABLES"

         for TABLE in "${TABLE_ARRAY[@]}"; do
             log "Raw TABLE before trimming: [$TABLE]"

             # Trim any whitespace around the table name
             TABLE=$(echo "$TABLE" | xargs)

             # Skip if the TABLE variable is empty or null
             if [ -z "$TABLE" ] || [ "$TABLE" = "NULL" ]; then
                 log "Skipping invalid or empty table entry: [$TABLE]"
                 continue
             fi

             # Prefix table name with "c_"
             TABLE="c_$TABLE"
             log "Checking table: $TABLE in database $DB_NAME..."

             # Check if the table exists in the database
             EXISTS=$(mysql_exec "
                 SELECT 1 FROM information_schema.tables
                 WHERE table_schema = '$DB_NAME' AND table_name = '$TABLE'
                 LIMIT 1;
             ")

             if [ -n "$EXISTS" ]; then
                 log "Table $TABLE exists in $DB_NAME"
             else
                 log "Table $TABLE does not exist in $DB_NAME"
             fi
         done
    done
# Logging function
log() {
    echo "[INFO] $1"
}

    # Step 3: Reverse check: Update status of missing Cubo folders
    EXISTING_CUBOS=$(ls "$CUBO_DIR" | sed "s/^/'/" | sed "s/$/'/" | tr '\n' ',' | sed 's/,$//')
    if [ -n "$EXISTING_CUBOS" ]; then
        mysql_adminexec "
            UPDATE cubo
            SET status = 0
            WHERE name NOT IN ($EXISTING_CUBOS);
        "
    else
        log "No Cubo directories found for reverse check."
        mysql_adminexec "
            UPDATE cubo
            SET status = 0;
        "
    fi

    log "Cubo operations completed!"
}

# 2. Handle Cubo
handle_cubo
log "Script completed successfully!"
