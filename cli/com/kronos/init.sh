#!/bin/bash
    KRONOS_MAIN="main:app"
    KRONOS_PORT=3006
    KRONOS_LOG="$LOG_DIR/kronos.log"

    # Έλεγχος αν το Kronos τρέχει
    if netstat -tuln | grep ":$KRONOS_PORT" > /dev/null; then
        echo "✅ Το Kronos τρέχει."
        if [ "$FILENAME" == "log" ]; then
            if [ -z "$KRONOS_LOGGING_ENABLED" ]; then
                export KRONOS_LOGGING_ENABLED="true"
                echo "✅ Kronos logging enabled."
            else
                unset KRONOS_LOGGING_ENABLED
                echo "❌ Kronos logging disabled."
            fi
        elif [ -n "$FILENAME" ]; then
            SCRIPT="$COM_DIR/$COMMAND/$FILENAME.sh"
            if [ -f "$SCRIPT" ]; then
                bash "$SCRIPT"
                exit $?
            else
                echo "❌ Σφάλμα: Λείπει το script για το $COMMAND/$FILENAME"
                exit 1
            fi
        else
            echo "📂 Λίστα διαθέσιμων scripts στο $COM_DIR/$COMMAND:"
            ls -1 "$COM_DIR/$COMMAND/" | grep -E '\.sh$' | sed 's/\.sh$//' || echo "⚠ Δεν βρέθηκαν scripts στο $COM_DIR/$COMMAND"
            exit 0
        fi
    else
        echo "❌ Το Kronos δεν τρέχει. Ξεκινάω..."
        if [ -f "main.py" ]; then #assuming the main.py is in the current directory
            # Ξεκίνημα του Kronos
            nohup uvicorn "$KRONOS_MAIN" --host 0.0.0.0 --port "$KRONOS_PORT" --reload > "$KRONOS_LOG" 2>&1 &
            # Περιμένουμε λίγο να ξεκινήσει η υπηρεσία
            sleep 5
            # Έλεγχος αν η υπηρεσία ξεκίνησε
            if netstat -tuln | grep ":$KRONOS_PORT" > /dev/null; then
                echo "✅ Το Kronos ξεκίνησε."
                if [ "$FILENAME" == "log" ]; then
                    if [ -z "$KRONOS_LOGGING_ENABLED" ]; then
                        export KRONOS_LOGGING_ENABLED="true"
                        echo "✅ Kronos logging enabled."
                    else
                        unset KRONOS_LOGGING_ENABLED
                        echo "❌ Kronos logging disabled."
                    fi
                elif [ -n "$FILENAME" ]; then
                    SCRIPT="$COM_DIR/$COMMAND/$FILENAME.sh"
                    if [ -f "$SCRIPT" ]; then
                        bash "$SCRIPT"
                        exit $?
                    else
                        echo "❌ Σφάλμα: Λείπει το script για το $COMMAND/$FILENAME"
                        exit 1
                    fi
                else
                    echo "📂 Λίστα διαθέσιμων scripts στο $COM_DIR/$COMMAND:"
                    ls -1 "$COM_DIR/$COMMAND/" | grep -E '\.sh$' | sed 's/\.sh$//' || echo "⚠ Δεν βρέθηκαν scripts στο $COM_DIR/$COMMAND"
                    exit 0
                fi
            else
                echo "❌ Αποτυχία εκκίνησης του Kronos."
                exit 1
            fi
        else
            echo "❌ Σφάλμα: Το script Kronos (main.py) δεν βρέθηκε."
            exit 1
        fi
    fi