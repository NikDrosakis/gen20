#!/bin/bash
# astra_indexcubo.sh — λίστα astra/cubos (κοινό, όχι ανά domain)
#
# Γράφει:
#   $DATA_DIR/astralist.json               ← κοινό (όλα τα cubos)
#   $SOL_ROOT/data/<domain>/astralist.json ← domain-specific
#
# Χρήση: astra_indexcubo.sh [domain]
#
# Schema:
#   { "generated": <unix>, "cubos": [
#       { name, title, color, files, icon, description, version } ] }
#
# Versioning:
#   - νέο cubo              → 1.0
#   - υπάρχον, ίδιο hash    → κρατά version
#   - υπάρχον, άλλο hash    → +0.1
# ΣΗΜΑΝΤΙΚΟ:
# Αυτό το script ΔΕΝ συγχρονίζει το version με το moonlist.json.
# Η μεταφορά του version από το astralist στο moonlist (και αντίστροφα)
# γίνεται ΑΠΟΚΛΕΙΣΤΙΚΑ από τα astra_pullcubo.sh και astra_pushcubo.sh.

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
ASTRA_DIR="${ASTRA_DIR:-$SOL_ROOT/astra/cubos}"
DATA_DIR="${DATA_DIR:-$SOL_ROOT/data}"
domain="${1:-gen20.net}"

# ── έλεγχοι ──
[[ -d $ASTRA_DIR ]] || { echo "❌ not found: $ASTRA_DIR" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq required" >&2; exit 1; }

mkdir -p "$DATA_DIR" || exit 1
domain_dir="$DATA_DIR/$domain"
mkdir -p "$domain_dir" || exit 1

out_common="$DATA_DIR/astralist.json"
out_domain="$domain_dir/astralist.json"
prev="$DATA_DIR/astralist.prev.json"

# κρατάμε το προηγούμενο για σύγκριση (χρησιμοποιούμε το κοινό ως reference)
if [[ -f $out_common ]]; then
    cp "$out_common" "$prev"
elif [[ -f $out_domain ]]; then
    cp "$out_domain" "$prev"
else
    echo '{"generated":0,"cubos":[]}' > "$prev"
fi

# ── βοηθητικές ──
bump_version() {
    awk -v v="$1" 'BEGIN{
        split(v,a,".");
        major=a[1]+0; minor=(a[2]+0)+1;
        printf "%d.%d", major, minor
    }'
}

is_domain() {
    [[ $1 =~ ^[a-z0-9-]+\.[a-z]{2,}$ ]]
}

should_skip() {
    local c="$1"
    [[ -z $c ]] && return 0
    [[ $c == "*" ]] && return 0
    [[ $c == .* ]] && return 0
    [[ $c == node_modules || $c == dist || $c == build ]] && return 0
    is_domain "$c" && return 0
    return 1
}

# ── main loop ──
cubos_json="[]"

for cubo_dir in "$ASTRA_DIR"/*/; do
    [[ -d $cubo_dir ]] || continue
    cubo="$(basename "$cubo_dir")"

    if should_skip "$cubo"; then
        echo "  ⏭  $cubo: skip"
        continue
    fi

    files=$(find "$cubo_dir" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" 2>/dev/null | wc -l | tr -d ' ')

    [[ $files -eq 0 ]] && continue

    # ── metadata: cubo.json (νέο) ή manifest.json (παλιό) ──
    meta="$cubo_dir/cubo.json"
    [[ -f $meta ]] || meta="$cubo_dir/manifest.json"

    title="$cubo"; color=""; icon=""; desc=""
    if [[ -f $meta ]]; then
        title=$(jq -r --arg d "$cubo" '.title // $d' "$meta" 2>/dev/null || echo "$cubo")
        color=$(jq -r '.color // ""' "$meta" 2>/dev/null || echo "")
        icon=$(jq -r '.icon // ""' "$meta" 2>/dev/null || echo "")
        desc=$(jq -r '.description // .excerpt // ""' "$meta" 2>/dev/null || echo "")
    fi

    # ── hash για ανίχνευση αλλαγής ──
    hash_new="$(
        { [[ -f $meta ]] && cat "$meta"; \
          find "$cubo_dir" -type f \
            -not -name 'cubo.json' \
            -not -name 'manifest.json' \
            -not -path "*/node_modules/*" \
            -not -path "*/dist/*" \
            -not -path "*/build/*" \
            -printf '%P\n' 2>/dev/null | sort; \
        } | sha256sum | cut -d' ' -f1
    )"

    # ── version logic ──
    prev_entry="$(jq -c --arg n "$cubo" '.cubos[] | select(.name==$n)' "$prev" 2>/dev/null || echo '')"

    if [[ -z $prev_entry ]]; then
        new_ver="1.0"
    else
        prev_ver="$(jq -r '.version // "1.0"' <<<"$prev_entry")"
        hash_old="$(jq -r '.hash // ""' <<<"$prev_entry")"

        if [[ "$hash_new" == "$hash_old" ]]; then
            new_ver="$prev_ver"
        else
            new_ver="$(bump_version "$prev_ver")"
        fi
    fi

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
        '$arr + [{
            name: $name, title: $title, color: $color,
            files: $files, icon: $icon,
            description: $description, version: $version,
            hash: $hash
        }]')

    echo "  ✓ $cubo v$new_ver (files=$files)"
done

# ── τελικά writes (χωρίς hash) ──
generated="$(date +%s)"

jq -cn \
    --argjson generated "$generated" \
    --argjson cubos "$cubos_json" \
    '{generated:$generated, cubos: ($cubos | sort_by(.name) | map(del(.hash)))}' \
    > "$out_common"

jq -cn \
    --argjson generated "$generated" \
    --arg domain "$domain" \
    --argjson cubos "$cubos_json" \
    '{generated:$generated, domain:$domain, cubos: ($cubos | sort_by(.name) | map(del(.hash)))}' \
    > "$out_domain"

# ── δικαιώματα ──
for f in "$out_common" "$out_domain"; do
    if id dros >/dev/null 2>&1; then
        chown dros:dros "$f" 2>/dev/null || true
    fi
    chmod 644 "$f"
done

# cleanup
rm -f "$prev"

echo "✅ $out_common ($(jq '.cubos | length' "$out_common") cubos)"
echo "✅ $out_domain ($(jq '.cubos | length' "$out_domain") cubos, domain=$domain)"