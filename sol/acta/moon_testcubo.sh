#!/bin/bash
# moon_testcubo.sh — test cubo(s) και ενημέρωση status στο moonlist.json
# Χρήση: moon testcubo <domain> <cubo|ola>
#
# Status workflow: dev → testing → active → production (+ broken)
#   - επιτυχές test: dev/broken → testing (τα testing/active/production μένουν)
#   - αποτυχία: → broken

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
domain="${1:-}"
cubo="${2:-}"

[[ -n "$domain" && -n "$cubo" ]] || { echo "Usage: moon testcubo <domain> <cubo|ola>" >&2; exit 1; }

src_dir="$SOL_ROOT/moon/$domain/src/cubos"
moonlist="$SOL_ROOT/data/$domain/moonlist.json"

[[ -d "$src_dir" ]] || { echo "❌ not found: $src_dir" >&2; exit 1; }
[[ -f "$moonlist" ]] || { echo "❌ moonlist not found: $moonlist" >&2; exit 1; }

# --- test ενός cubo: ύπαρξη dir + κύριο .jsx με component ---
test_cubo() {
    local name="$1"
    local d="$src_dir/$name"
    [[ -d "$d" ]] || { echo "no-dir"; return 1; }
    local jsx
    jsx=$(find "$d" -name '*.jsx' -print -quit 2>/dev/null)
    [[ -n "$jsx" && -s "$jsx" ]] || { echo "no-jsx"; return 1; }
    grep -qE 'export|function|=>' "$jsx" 2>/dev/null && { echo "ok"; return 0; }
    echo "invalid"; return 1
}

# JSON content (ξεχωριστά από το file path)
content=$(cat "$moonlist")

set_status() {
    local name="$1" status="$2"
    content=$(jq --arg n "$name" --arg s "$status" \
        '.cubos = (.cubos | map(if .name == $n then . + {status: $s} else . end))' <<<"$content")
    printf '  %-18s → %s\n' "$name" "$status"
}

# --- targets ---
if [[ "$cubo" == "ola" || "$cubo" == "all" ]]; then
    targets=$(jq -r '.cubos[].name' <<<"$content")
else
    targets="$cubo"
fi

[[ -n "$targets" ]] || { echo "❌ no cubos to test" >&2; exit 1; }

# --- test κάθε cubo ---
for name in $targets; do
    if test_cubo "$name" 2>/dev/null; then
        cur=$(jq -r --arg n "$name" '.cubos[] | select(.name==$n) | .status // "dev"' <<<"$content")
        case "$cur" in
            dev|broken) set_status "$name" "testing" ;;
            *) set_status "$name" "$cur" ;;
        esac
    else
        set_status "$name" "broken"
    fi
done

printf '%s\n' "$content" | jq . > "$moonlist"
echo "✅ updated $moonlist"
