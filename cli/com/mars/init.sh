#!/bin/bash
    MARS_MAIN="$ROOT/mars/main.cpp"
    MARS_PORT=3004
    MARS_LOG="$LOG_DIR/mars.log"
    MARS_EXECUTABLE="mars_executable"

    # Έλεγχος αν το Mars τρέχει
    if netstat -tuln | grep ":$MARS_PORT" > /dev/null; then
        echo "✅ Το Mars τρέχει."
        if [ "$FILENAME" == "log" ]; then
            if [ -z "$MARS_LOGGING_ENABLED" ]; then
                export MARS_LOGGING_ENABLED="true"
                echo "✅ Mars logging enabled."
            else
                unset MARS_LOGGING_ENABLED
                echo "❌ Mars logging disabled."
            fi
        elif [ -n "$FILENAME" ]; then
            SCRIPT="$BASE_DIR/$COMMAND/$FILENAME.sh"
            if [ -f "$SCRIPT" ]; then
                bash "$SCRIPT"
                exit $?
            else
                echo "❌ Σφάλμα: Λείπει το script για το $COMMAND/$FILENAME"
                exit 1
            fi
        else
            echo "📂 Λίστα διαθέσιμων scripts στο $BASE_DIR/$COMMAND:"
            ls -1 "$BASE_DIR/$COMMAND/" | grep -E '\.sh$' | sed 's/\.sh$//' || echo "⚠ Δεν βρέθηκαν scripts στο $BASE_DIR/$COMMAND"
            exit 0
        fi
    else
        echo "❌ Το Mars δεν τρέχει. Ξεκινάω..."
        if [ -f "$MARS_MAIN" ]; then
            # Μεταγλώττιση του main.cpp
            g++ "$MARS_MAIN" -o "$MARS_EXECUTABLE" -lboost_system -lboost_thread -lpthread -lyaml-cpp -lnlohmann_json -lhiredis
            if [ $? -eq 0 ]; then
                # Ξεκίνημα του Mars
                nohup ./"$MARS_EXECUTABLE" > "$MARS_LOG" 2>&1 &
                # Περιμένουμε λίγο να ξεκινήσει η υπηρεσία
                sleep 5
                # Έλεγχος αν η υπηρεσία ξεκίνησε
                if netstat -tuln | grep ":$MARS_PORT" > /dev/null; then
                    echo "✅ Το Mars ξεκίνησε."
                    if [ "$FILENAME" == "log" ]; then
                        if [ -z "$MARS_LOGGING_ENABLED" ]; then
                            export MARS_LOGGING_ENABLED="true"
                            echo "✅ Mars logging enabled."
                        else
                            unset MARS_LOGGING_ENABLED
                            echo "❌ Mars logging disabled."
                        fi
                    elif [ -n "$FILENAME" ]; then
                        SCRIPT="$BASE_DIR/$COMMAND/$FILENAME.sh"
                        if [ -f "$SCRIPT" ]; then
                            bash "$SCRIPT"
                            exit $?
                        else
                            echo "❌ Σφάλμα: Λείπει το script για το $COMMAND/$FILENAME"
                            exit 1
                        fi
                    else
                        echo "📂 Λίστα διαθέσιμων scripts στο $BASE_DIR/$COMMAND:"
                        ls -1 "$BASE_DIR/$COMMAND/" | grep -E '\.sh$' | sed 's/\.sh$//' || echo "⚠ Δεν βρέθηκαν scripts στο $BASE_DIR/$COMMAND"
                        exit 0
                    fi
                else
                    echo "❌ Αποτυχία εκκίνησης του Mars."
                    exit 1
                fi
            else
                echo "❌ Σφάλμα: Αποτυχία μεταγλώττισης του main.cpp."
                exit 1
            fi
        else
            echo "❌ Σφάλμα: Το script Mars (main.cpp) δεν βρέθηκε."
            exit 1
        fi
    fi