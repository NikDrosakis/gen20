#!/bin/bash
source "$(dirname "$0")/../lib/utils.sh"

# Ensure a subcommand is provided
if [ -z "$1" ]; then
    error "Usage: gen bin list | gen bin <file>"
fi

BIN_DIR="$(dirname "$0")/../bin"

case "$1" in
    list)
        log "Listing available bin scripts..."
        for file in "$BIN_DIR"/*; do
            [[ -f "$file" && -x "$file" ]] || continue
            file_name="${file##*/}"
            file_name="${file_name%.sh}"
            description="..."

            while IFS= read -r line; do
                [[ "$line" =~ ^description= ]] && description="${line#*=}" && break
            done < "$file"

            echo "$file_name - ${description//\"/}"
        done
        ;;
    *)
        FILE="$1"
        if [[ -f "$BIN_DIR/$FILE.sh" && -x "$BIN_DIR/$FILE.sh" ]]; then
            log "Executing $FILE..."
            bash "$BIN_DIR/$FILE.sh"
        else
            error "Bin file '$FILE' not found or not executable."
        fi
        ;;
esac
