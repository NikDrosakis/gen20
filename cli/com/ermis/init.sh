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
  SERVICE_URL="https://0.0.0.0:3010"
  ERMIS_SCRIPT="$ROOT/ermis/index.js"
  # Έλεγχος αν η υπηρεσία τρέχει
  if curl --silent --show-error --insecure "$SERVICE_URL" > /dev/null; then
  echo "✅ Η υπηρεσία Ermis τρέχει."
  else
  echo "❌ Η υπηρεσία Ermis δεν τρέχει. Ξεκινάω..."
  if [ -f "$ERMIS_SCRIPT" ]; then
  # Ξεκίνημα της υπηρεσίας
  if ps aux | grep -v grep | grep "$ERMIS_SCRIPT" > /dev/null; then
        echo "Η υπηρεσία Ermis τρέχει ήδη."
    else
        # Ξεκίνημα της υπηρεσίας
        nohup nodemon "$ERMIS_SCRIPT" > "$LOG_DIR/ermis.log" 2>&1 &
        echo "Η υπηρεσία Ermis ξεκίνησε."
    fi
  # Περιμένουμε λίγο να ξεκινήσει η υπηρεσία
  sleep 5
  # Έλεγχος αν η υπηρεσία ξεκίνησε
  if curl --silent --show-error --insecure "$SERVICE_URL" > /dev/null; then
  echo "✅ Η υπηρεσία Ermis ξεκίνησε."

  else
  echo "❌ Αποτυχία εκκίνησης της υπηρεσίας Ermis."
  exit 1
  fi

  else
  echo "❌ Σφάλμα: Το script Ermis ($ERMIS_SCRIPT) δεν βρέθηκε."
  exit 1
  fi
  fi
  # Πρόσβαση στο REPL
  echo "▶ Πρόσβαση στο REPL του Ermis..."
  node