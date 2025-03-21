#!/bin/bash

        GIT_SCRIPT="$CLI_ROOT/com/git/$FILENAME.sh"
        if [ -f "$GIT_SCRIPT" ]; then
            bash "$GIT_SCRIPT"
            exit $?
        else
            echo "❌ Σφάλμα: Το script Git ($GIT_SCRIPT) δεν βρέθηκε."
            exit 1
        fi
        ;;