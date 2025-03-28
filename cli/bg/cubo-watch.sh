#!/bin/bash

ROOT="/var/www/gs"                  # Root directory
CUBO_ROOT="$ROOT/gaia/cubos"         # Cubo root directory
LOG_FILE="$ROOT/log/cli.log"         # Log file

# Watch for changes in the cubo directory
inotifywait -m -r -e modify,create,delete "$CUBO_ROOT" --format '%w%f' |
while read FILE; do
    # Extract the Cubo name from the file path. Assuming the cubo name is the parent directory of the file.
# Extract the CUBO_NAME (parent folder name)
CUBO_NAME=$(basename "$(dirname "$(dirname "$FILE")")")

# Extract the file name (without path)
FILE_NAME=$(basename "$FILE" .php)

# Combine CUBO_NAME and FILE_NAME with a dot separator
RESULT="$CUBO_NAME.$FILE_NAME"

# Output the result
echo "CUBO_NAME: $RESULT"

#update cubo cache method
gen gaia updateCacheCP "$RESULT"

#set the process as background

#sent notification to reload page

done
