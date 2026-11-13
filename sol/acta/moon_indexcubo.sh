#!/bin/bash
# moon_indexcubo.sh — λίστα moon/<domain>/src/cubos
# Χρήση: gen moon indexcubo <domain>

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
DATA_DIR="${DATA_DIR:-$SOL_ROOT/data}"

domain="${1:-}"
[[ -z $domain ]] && { echo "Usage: moon indexcubo <domain>" >&2; exit 1; }

src_dir="$SOL_ROOT/moon/$domain/src/cubos"
[[ -d $src_dir ]] || { echo "❌ not found: $src_dir" >&2; exit 1; }

mkdir -p "$DATA_DIR/$domain" || exit 1

out="$DATA_DIR/$domain/moonlist.json"

{
    printf '{"domain":"%s","generated":%s,"cubos":[' "$domain" "$(date +%s)"
    first=1
    for cubo_dir in "$src_dir"/*/; do
        [[ -d $cubo_dir ]] || continue
        cubo=$(basename "$cubo_dir")
        [[ -z $cubo || $cubo == "*" ]] && continue

        color=""
        title="$cubo"
        manifest="$cubo_dir/manifest.json"
        if [[ -f $manifest ]]; then
            color=$(jq -r '.color // empty' "$manifest" 2>/dev/null)
            title=$(jq -r '.title // empty' "$manifest" 2>/dev/null)
            [[ -z $title ]] && title="$cubo"
        fi

        files=$(find "$cubo_dir" -type f \
            -not -path "*/node_modules/*" \
            -not -path "*/dist/*" 2>/dev/null | wc -l)

        [[ $first -eq 0 ]] && printf ','
        first=0
        jq -cn \
            --arg name "$cubo" \
            --arg title "$title" \
            --arg color "$color" \
            --argjson files "$files" \
            '{name: $name, title: $title, color: $color, files: $files}'
    done
    printf ']}\n'
} > "$out"

echo "✅ $out ($(wc -c < "$out") bytes)"
# Στο τέλος του astra_indexcubo.sh / moon_indexcubo.sh

# Permissions στο JSON
chown dros:dros "$out" 2>/dev/null || true
chmod 644 "$out"

echo "✅ $out ($(wc -c < "$out") bytes)"