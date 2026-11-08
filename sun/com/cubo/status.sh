#!/bin/bash
# /var/www/gs/sun/com/cubo/status.sh
# Χρήση:
#   status.sh <cuboname>     → δες πού υπάρχει το cubo και τι subsystems έχει
#   status.sh                → λίστα όλων των cubos στο gpm/

set -uo pipefail

source "$(dirname "$0")/../../init.sh"

# ============================================================
# CONFIG
# ============================================================
GPM_ROOT="/var/www/gs/gpm"

# Υποσυστήματα που ψάχνουμε μέσα σε κάθε cubo
SUBSYSTEMS=("kronos" "gaia" "moon" "god" "sun" "mars")

# ============================================================
# Helpers
# ============================================================
usage() {
    echo "Usage:"
    echo "  gen cubo status <cuboname>   → δες πού υπάρχει το cubo"
    echo "  gen cubo status              → λίστα όλων των cubos στο gpm/"
    echo ""
    echo "GPM root: $GPM_ROOT"
}

# ============================================================
# Main
# ============================================================
CUBO="${1:-}"

log_action "=== CUBO STATUS ${CUBO:+(cubo: $CUBO)} ==="

# --- Έλεγχος GPM root ---
if [ ! -d "$GPM_ROOT" ]; then
    echo "❌ GPM root not found: $GPM_ROOT"
    exit 1
fi

# ============================================================
# Λίστα όλων των cubos (χωρίς target)
# ============================================================
if [ -z "$CUBO" ]; then
    echo ""
    echo "=== Cubos στο GPM ==="
    echo "   root: $GPM_ROOT"
    echo ""

    total=0

    for dir in "$GPM_ROOT"/*/; do
        [ -d "$dir" ] || continue
        name=$(basename "$dir")
        total=$((total + 1))

        # Ποια subsystems έχει;
        subs=()
        for sub in "${SUBSYSTEMS[@]}"; do
            [ -d "$dir/$sub" ] && subs+=("$sub")
        done

        if [ ${#subs[@]} -eq 0 ]; then
            printf "  %-20s (no subsystems)\n" "$name"
        else
            printf "  %-20s [%s]\n" "$name" "$(IFS=', '; echo "${subs[*]}")"
        fi
    done

    echo ""
    echo "  Σύνολο: $total cubos"
    echo ""
    echo "  Για λεπτομέρειες: gen cubo status <cuboname>"
    exit 0
fi

# ============================================================
# Λεπτομέρειες ενός cubo
# ============================================================

CUBO_DIR="$GPM_ROOT/$CUBO"

# --- 1. Υπάρχει το cubo; ---
echo ""
if [ ! -d "$CUBO_DIR" ]; then
    echo "❌ cubo not found: $CUBO"
    echo "   expected: $CUBO_DIR"
    echo ""
    echo "   Διαθέσιμα cubos:"
    for dir in "$GPM_ROOT"/*/; do
        [ -d "$dir" ] || continue
        echo "     - $(basename "$dir")"
    done
    exit 1
fi

echo "✅ cubo found: $CUBO"
echo "   path: $CUBO_DIR"

# --- 2. Τι περιεχόμενο έχει; ---
echo ""
echo "=== Contents ==="

# Files στο root του cubo
for f in "$CUBO_DIR"/*; do
    [ -e "$f" ] || continue
    [ -d "$f" ] && continue
    printf "  📄 %s\n" "$(basename "$f")"
done

# Directories (όχι subsystems)
for d in "$CUBO_DIR"/*/; do
    [ -d "$d" ] || continue
    name=$(basename "$d")
    # Αν είναι subsystem, το δείχνουμε ξεχωριστά
    if printf '%s\n' "${SUBSYSTEMS[@]}" | grep -qx "$name"; then
        continue
    fi
    printf "  📁 %s/\n" "$name"
done

# --- 3. Subsystems ---
echo ""
echo "=== Subsystems ==="

found_subs=()
for sub in "${SUBSYSTEMS[@]}"; do
    sub_dir="$CUBO_DIR/$sub"
    if [ -d "$sub_dir" ]; then
        found_subs+=("$sub")

        # Μέτρα files
        file_count=$(find "$sub_dir" -maxdepth 1 -type f | wc -l)
        dir_count=$(find "$sub_dir" -maxdepth 1 -type d | tail -n +2 | wc -l)

        printf "  ✅ %-10s  (%d files, %d dirs)\n" "$sub" "$file_count" "$dir_count"

        # Δες αν έχει manifest/aggregator/installed
        for check in "manifest.json" "installed.json" "aggregator.py" "aggregator.go" "aggregator.sh" "aggregator.jsx" "Aggregator.jsx"; do
            if [ -f "$sub_dir/$check" ]; then
                printf "       └─ %s\n" "$check"
            fi
        done

        # Για moon: δες αν έχει src/
        if [ "$sub" = "moon" ] && [ -d "$sub_dir/src" ]; then
            printf "       └─ src/ (React app)\n"
        fi
    else
        printf "  ⬜ %-10s  (not present)\n" "$sub"
    fi
done

# --- 4. Σύνοψη ---
echo ""
echo "=== Summary ==="
if [ ${#found_subs[@]} -eq 0 ]; then
    echo "  ⚠️  Κανένα subsystem δεν βρέθηκε"
    echo "     Αναμενόμενα: ${SUBSYSTEMS[*]}"
else
    echo "  Subsystems: ${found_subs[*]}"
    echo "  Σύνολο:     ${#found_subs[@]}/${#SUBSYSTEMS[@]}"
fi

log_action "OK: cubo status $CUBO"
