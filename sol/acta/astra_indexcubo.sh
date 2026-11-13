#!/bin/bash
# astra_indexcubo.sh — λίστα astra/cubos (κοινό, όχι ανά domain)

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
ASTRA_DIR="${ASTRA_DIR:-$SOL_ROOT/astra/cubos}"
DATA_DIR="${DATA_DIR:-$SOL_ROOT/data}"

[[ -d $ASTRA_DIR ]] || { echo "❌ not found: $ASTRA_DIR" >&2; exit 1; }

mkdir -p "$DATA_DIR" || exit 1
out="$DATA_DIR/astralist.json"

cubos_json="[]"
for cubo_dir in "$ASTRA_DIR"/*/; do
    [[ -d $cubo_dir ]] || continue
    cubo=$(basename "$cubo_dir")
    [[ -z $cubo || $cubo == "*" ]] && continue

    # Αγνόησε domains (περιέχουν . + TLD)
    if [[ $cubo =~ ^[a-z0-9-]+\.[a-z]{2,}$ ]]; then
        echo "  ⏭  $cubo: domain, skip"
        continue
    fi

    # Αγνόησε hidden folders
    [[ $cubo == .* ]] && continue

    # Αγνόησε node_modules, dist
    [[ $cubo == node_modules || $cubo == dist ]] && continue

    # Μέτρησε αρχεία (εξαιρεί node_modules/dist)
    files=$(find "$cubo_dir" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" 2>/dev/null | wc -l)

    # Αν 0 αρχεία → skip
    [[ $files -eq 0 ]] && continue

    color=""; title="$cubo"
    manifest="$cubo_dir/manifest.json"
    if [[ -f $manifest ]]; then
        color=$(jq -r '.color // empty' "$manifest" 2>/dev/null)
        title=$(jq -r '.title // empty' "$manifest" 2>/dev/null)
        [[ -z $title ]] && title="$cubo"
    fi

    cubos_json=$(jq -cn \
        --argjson arr "$cubos_json" \
        --arg name "$cubo" \
        --arg title "$title" \
        --arg color "$color" \
        --argjson files "$files" \
        '$arr + [{name:$name, title:$title, color:$color, files:$files}]')
done

jq -cn \
    --argjson generated "$(date +%s)" \
    --argjson cubos "$cubos_json" \
    '{generated:$generated, cubos:$cubos}' > "$out"

chown dros:dros "$out" 2>/dev/null || true
chmod 644 "$out"

echo "✅ $out ($(wc -c < "$out") bytes, $(jq '.cubos | length' "$out") cubos)"