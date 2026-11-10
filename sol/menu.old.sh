#!/bin/bash
# /var/www/gs/sun/menu.sh

set -u
set -o pipefail

source "$(dirname "$0")/init.sh"

# ==============================================
# Λίστα first-level commands (χειροκίνητα)
# ==============================================
FIRST_LEVELS=(
    "cubo" "gaia" "db" "redis" "elastic" "arango" "status"
    "god" "kronos" "mars" "npm" "composer"
    "build" "permissions" "tree" "top" "performance" "ports" "help"
)

# ==============================================
# Helper: λίστα subcommands για ένα first-level
# ==============================================
list_subcommands() {
    local level="$1"
    local dir=""

    case "$level" in
         cubo)       dir="$SUN_DIR/com/cubo" ;;      # ← ΝΕΟ
        gaia)       dir="$SUN_DIR/com/gaia" ;;
        db)         dir="$SUN_DIR/com/db" ;;
        redis)      echo "  (χωρίς subcommands — τρέχει απευθείας)"; return ;;
        elastic)    echo "  (χωρίς subcommands — τρέχει απευθείας)"; return ;;
        arango)     echo "  (χωρίς subcommands — τρέχει απευθείας)"; return ;;
        god)        dir="$SUN_DIR/com/god" ;;
        kronos)     dir="$SUN_DIR/com/kronos" ;;
        mars)       dir="$SUN_DIR/com/mars" ;;
        npm)        dir="$SUN_DIR/com/npm" ;;
        composer)   echo "  (χωρίς subcommands — τρέχει απευθείας)"; return ;;
        build)      dir="$SUN_DIR/com" ;;
        permissions|tree|top|performance|ports|help)
                    echo "  (χωρίς subcommands — τρέχει απευθείας)"; return ;;
        *)          echo "  (άγνωστο first-level)"; return ;;
    esac

    if [ -d "$dir" ]; then
        local found=0
        for f in "$dir"/*.sh; do
            [ -e "$f" ] || continue
            local name
            name=$(basename "$f" .sh)
            echo "  - $name"
            found=$((found + 1))
        done
        [ "$found" -eq 0 ] && echo "  (κανένα subcommand)"
    else
        echo "  (ο φάκελος $dir δεν υπάρχει)"
    fi
}

# ==============================================
# Helper: εκτέλεση command
# ==============================================
run_command() {
    local cmd="$1"
    local target="${2:-}"
    shift 2 2>/dev/null || true
    local args=("$@")

    log_action "MENU EXEC: $cmd $target ${args[*]:-}"
    "$SUN_DIR/exec.sh" "$cmd" "$target" "${args[@]}"
}

# ==============================================
# Κύριο μενού
# ==============================================
show_main_menu() {
    clear
    # Banner
    source "$SUN_DIR/banner.sh"
    show_banner
    echo "=============================================="
    echo "        GEN PLATFORM LANGUAGE (GPL)           "
    echo "=============================================="
    echo ""
    echo "  First-level commands:"
    echo "  ---------------------"
    local i=1
    for level in "${FIRST_LEVELS[@]}"; do
        printf "  %2d) %s\n" "$i" "$level"
        i=$((i + 1))
    done
    echo ""
    echo "  -------------------------------------------------"
    echo "  Πληκτρολόγησε:"
    echo "    - αριθμό (1-${#FIRST_LEVELS[@]}) → εκτελεί"
    echo "    - first-level (π.χ. gaia) → δείχνει subcommands"
    echo "    - first-level second-level (π.χ. gaia buildTable) → εκτελεί"
    echo "    - # ή q → έξοδος"
    echo "  -------------------------------------------------"
}

# ==============================================
# Loop
# ==============================================
while true; do
    show_main_menu
    printf "gen> "
    read -r input || { echo ""; exit 0; }

    # Έξοδος
    case "$input" in
        "#"|"q"|"quit"|"exit"|"")
            log_action "MENU: exit"
            exit 0
            ;;
    esac

    # Αν είναι αριθμός → αντιστοίχιση σε first-level
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        idx=$((input - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#FIRST_LEVELS[@]}" ]; then
            level="${FIRST_LEVELS[$idx]}"
            echo ""
            echo "▶ $level"
            echo ""
            list_subcommands "$level"
            echo ""
            printf "  Πληκτρολόγησε subcommand (ή Enter για επιστροφή): "
            read -r sub || sub=""
            if [ -n "$sub" ]; then
                run_command "$level" "$sub"
                echo ""
                printf "  Πάτα Enter για συνέχεια..."
                read -r _
            fi
        else
            echo "❌ Μη έγκυρος αριθμός."
            sleep 1
        fi
        continue
    fi

    # Αν έχει κενό → first-level + second-level + args
    if [[ "$input" == *" "* ]]; then
        read -r -a parts <<< "$input"
        level="${parts[0]}"
        sub="${parts[1]:-}"
        args=("${parts[@]:2}")
        run_command "$level" "$sub" "${args[@]}"
        echo ""
        printf "  Πάτα Enter για συνέχεια..."
        read -r _
        continue
    fi

    # Αν είναι μόνο first-level → δείξε subcommands
    level="$input"
    # Έλεγχος αν είναι γνωστό
    known=0
    for l in "${FIRST_LEVELS[@]}"; do
        [ "$l" = "$level" ] && known=1 && break
    done
    if [ "$known" -eq 0 ]; then
        echo "❌ Άγνωστο command: $level"
        sleep 1
        continue
    fi

    echo ""
    echo "▶ $level"
    echo ""
    list_subcommands "$level"
    echo ""
    printf "  Πληκτρολόγησε subcommand (ή Enter για επιστροφή): "
    read -r sub || sub=""
    if [ -n "$sub" ]; then
        run_command "$level" "$sub"
        echo ""
        printf "  Πάτα Enter για συνέχεια..."
        read -r _
    fi
done