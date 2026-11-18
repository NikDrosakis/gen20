#!/bin/bash
# moon_indexcubo.sh — λίστα moon/<domain>/src/cubos
# Χρήση: gen moon indexcubo <domain>
#
# Schema:
#   { "domain": "...", "generated": <unix>, "cubos": [
#       { name, title, color, files, icon, description, version, status, params } ] }

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
DATA_DIR="${DATA_DIR:-$SOL_ROOT/data}"

domain="${1:-}"
[[ -z $domain ]] && { echo "Usage: moon indexcubo <domain>" >&2; exit 1; }

src_dir="$SOL_ROOT/moon/$domain/src/cubos"
[[ -d $src_dir ]] || { echo "❌ not found: $src_dir" >&2; exit 1; }

mkdir -p "$DATA_DIR/$domain" || exit 1

out="$DATA_DIR/$domain/moonlist.json"
prev="$DATA_DIR/$domain/moonlist.prev.json"
astralist="$DATA_DIR/astralist.json"

# Κρατάμε το προηγούμενο για σύγκριση
if [[ -f $out ]]; then
    cp "$out" "$prev"
else
    echo '{"cubos":[]}' > "$prev"
fi

# Αν δεν υπάρχει το astralist, δεν μπορούμε να πάρουμε metadata
if [[ ! -f $astralist ]]; then
    echo "⚠️  Warning: $astralist not found. Metadata (icon, description) will be empty." >&2
    astralist_content='{"cubos":[]}'
else
    astralist_content=$(cat "$astralist")
fi

cubos_json="[]"

for cubo_dir in "$src_dir"/*/; do
    [[ -d $cubo_dir ]] || continue
    cubo="$(basename "$cubo_dir")"
    [[ -z $cubo || $cubo == "*" ]] && continue

    # Μέτρηση αρχείων (εξαιρεί node_modules/dist)
    files=$(find "$cubo_dir" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" 2>/dev/null | wc -l | tr -d ' ')

    [[ $files -eq 0 ]] && continue

    # ── Metadata ΑΠΟΚΛΕΙΣΤΙΚΑ από το astralist.json ──
    meta_entry=$(jq -c --arg n "$cubo" --argjson fallback '{"cubos":[]}' \
        '(.cubos[] | select(.name == $n)) // {}' <<< "$astralist_content")

    title=$(jq -r --arg d "$cubo" '.title // $d' <<< "$meta_entry")
    color=$(jq -r '.color // ""' <<< "$meta_entry")
    icon=$(jq -r '.icon // ""' <<< "$meta_entry")
    desc=$(jq -r '.description // ""' <<< "$meta_entry")

    # ── Params από το astralist.json ──
    params=$(jq -c '.params // {}' <<< "$meta_entry")

    # ── Hash για ανίχνευση αλλαγών ──
    hash_new="$(
        find "$cubo_dir" -type f \
            -not -path "*/node_modules/*" \
            -not -path "*/dist/*" \
            -printf '%P\n' 2>/dev/null | sort | sha256sum | cut -d' ' -f1
    )"

    # ── Version & Status ──
    prev_entry="$(jq -c --arg n "$cubo" '.cubos[] | select(.name==$n)' "$prev" 2>/dev/null || echo '')"

    if [[ -z $prev_entry ]]; then
        # Νέο cubo
        new_ver="1.0"
        new_status="testing"
    else
        # Υπάρχον cubo — κρατάμε version χωρίς αλλαγή
        prev_ver="$(jq -r '.version // "1.0"' <<<"$prev_entry")"
        new_ver="$prev_ver"

        # Status: διατήρηση αν υπάρχει, αλλιώς "testing"
        prev_status="$(jq -r '.status // ""' <<<"$prev_entry")"
        if [[ -n "$prev_status" && ( "$prev_status" == "testing" || "$prev_status" == "active" || "$prev_status" == "broken" ) ]]; then
            new_status="$prev_status"
        else
            new_status="testing"
        fi
    fi

    # ── Προσθήκη στο array ──
    cubos_json=$(jq -cn \
        --argjson arr "$cubos_json" \
        --arg name "$cubo" \
        --arg title "$title" \
        --arg color "$color" \
        --argjson files "$files" \
        --arg icon "$icon" \
        --arg description "$desc" \
        --arg version "$new_ver" \
        --arg hash "$hash_new" \
        --arg status "$new_status" \
        --argjson params "$params" \
        '$arr + [{
            name: $name, title: $title, color: $color,
            files: $files, icon: $icon,
            description: $description, version: $version, hash: $hash,
            status: $status, params: $params
        }]')
done

# ── Τελικό write ──
jq -cn \
    --arg domain "$domain" \
    --argjson generated "$(date +%s)" \
    --argjson cubos "$cubos_json" \
    '{domain:$domain, generated:$generated, cubos: ($cubos | sort_by(.name) | map(del(.hash)))}' > "$out"

# Δικαιώματα
if id dros >/dev/null 2>&1; then
    chown dros:dros "$out" 2>/dev/null || true
fi
chmod 644 "$out"

# Cleanup
rm -f "$prev"

echo "✅ $out ($(wc -c < "$out") bytes, $(jq '.cubos | length' "$out") cubos)"