#!/bin/bash
# astra_clean.sh — Καθαρισμός backup αρχείων από τα cubos
# Χρήση:
#   astra clean 1             (σβήνει όλα τα *.1)
#   astra clean gen20net      (σβήνει όλα τα *.gen20net)
#   astra clean "gen20net*"   (σβήνει όλα τα *.gen20net, *.gen20net.1, κλπ)
#   astra clean all           (σβήνει ΟΛΑ τα backup, αλλά κρατάει τα κανονικά αρχεία)

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
ASTRA_DIR="${ASTRA_DIR:-$SOL_ROOT/astra/cubos}"
target="${1:-}"

# Έλεγχος αν έδωσες όρισμα
if [[ -z "$target" ]]; then
    echo "❌ Χρήση: astra clean <extension|pattern|all>"
    echo "   π.χ. astra clean 1"
    echo "        astra clean gen20net"
    echo "        astra clean \"gen20net*\""
    echo "        astra clean all"
    exit 1
fi

if [[ ! -d "$ASTRA_DIR" ]]; then
    echo "❌ Δεν βρέθηκε ο φάκελος: $ASTRA_DIR" >&2
    exit 1
fi

count_deleted=0
count_scanned=0

echo "🧹 Ξεκινάει ο καθαρισμός στο: $ASTRA_DIR"
echo "🎯 Κανόνας: $target"
echo "--------------------------------------------------"

if [[ "$target" == "all" ]]; then
    while IFS= read -r -d '' file; do
        ((count_scanned++))
        if [[ "$file" =~ \.[0-9]+$ ]] || [[ "$file" =~ \.gen[a-z0-9]+$ ]]; then
            rm -f "$file"
            ((count_deleted++))
            echo "🗑️  Διαγράφηκε: ${file#$ASTRA_DIR/}"
        fi
    done < <(find "$ASTRA_DIR" -type f -print0 2>/dev/null)
else
    # Καθαρίζουμε τυχόν τελεία στην αρχή
    clean_target="${target#.}"

    # Αν ο χρήστης έδωσε wildcard (π.χ. gen20net*), το κρατάμε.
    # Αλλιώς, προσθέτουμε wildcard στο τέλος για να πιάνει και τα .1, .2 κλπ
    # π.χ. "gen20net" -> "gen20net*"
    if [[ "$clean_target" != *"*"* ]]; then
        clean_target="${clean_target}*"
    fi

    # Το bash pattern για έλεγχο στο τέλος του αρχείου
    pattern="*.${clean_target}"

    while IFS= read -r -d '' file; do
        ((count_scanned++))

        # Ελέγχουμε αν το αρχείο ταιριάζει με το pattern
        if [[ "$file" == $pattern ]]; then
            rm -f "$file"
            ((count_deleted++))
            echo "🗑️  Διαγράφηκε: ${file#$ASTRA_DIR/}"
        fi
    done < <(find "$ASTRA_DIR" -type f -print0 2>/dev/null)
fi

echo "--------------------------------------------------"
echo "✅ Ολοκληρώθηκε!"
echo "📊 Σαρώθηκαν: $count_scanned αρχεία"
echo "🗑️  Διαγράφηκαν: $count_deleted αρχεία"