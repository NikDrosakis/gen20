#!/bin/bash
    GOD_MAIN="$ROOT/god/main.go"
    GOD_PORT=3008

    # Έλεγχος αν το σύστημα Go τρέχει
    if netstat -tuln | grep ":$GOD_PORT" > /dev/null; then
        echo "✅ Το σύστημα God τρέχει."
        #Εκτέλεση του script
        if [ -n "$FILENAME" ]; then
            go run "$FILENAME"
        else
            echo "❌ Σφάλμα: Το FILENAME δεν έχει οριστεί."
            exit 1
        fi

    else
        echo "❌ Το σύστημα God δεν τρέχει. Ξεκινάω..."
        if [ -f "$GOD_MAIN" ]; then
            # Ξεκίνημα του συστήματος
            nohup go run "$GOD_MAIN" > "$LOG_DIR/god.log" 2>&1 &
            # Περιμένουμε λίγο να ξεκινήσει η υπηρεσία
            sleep 5
            # Έλεγχος αν η υπηρεσία ξεκίνησε
            if netstat -tuln | grep ":$GOD_PORT" > /dev/null; then
                echo "✅ Το σύστημα God ξεκίνησε."
                #Εκτέλεση του script
                if [ -n "$FILENAME" ]; then
                    go run "$FILENAME"
                else
                    echo "❌ Σφάλμα: Το FILENAME δεν έχει οριστεί."
                    exit 1
                fi
            else
                echo "❌ Αποτυχία εκκίνησης του συστήματος God."
                exit 1
            fi

        else
            echo "❌ Σφάλμα: Το script God ($GOD_MAIN) δεν βρέθηκε."
            exit 1
        fi
    fi