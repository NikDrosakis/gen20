#!/bin/bash
# astra_pullcubo.sh — εγκατάσταση cubo από astra/cubos σε moon/<domain>/src/cubos
# Χρήση: astra pullcubo <cubo> <domain>   (ή astra pullcubo <cubo> --domain <domain>)

set -uo pipefail

SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
ASTRA_CUBOS="${ASTRA_CUBOS:-$SOL_ROOT/astra/cubos}"

cubo=""
domain=""
positional=()
while (($#)); do
    case "$1" in
        --domain) domain="$2"; shift 2 ;;
        -*) shift ;;
        *) positional+=("$1"); shift ;;
    esac
done
cubo="${positional[0]:-}"
[[ -z "$domain" ]] && domain="${positional[1]:-}"

[[ -n "$cubo" ]] || { echo "Usage: astra pullcubo <cubo> --domain <domain>" >&2; exit 1; }
[[ -n "$domain" ]] || { echo "❌ --domain required" >&2; exit 1; }

src="$ASTRA_CUBOS/$cubo/moon"
dst="$SOL_ROOT/moon/$domain/src/cubos/$cubo"

[[ -d "$src" ]] || { echo "❌ cubo not found: $cubo (no moon/)" >&2; exit 1; }

mkdir -p "$dst"
cp -r "$src"/. "$dst"/

echo "✅ installed $cubo → $dst"

# ενημέρωση moonlist.json (metadata + params από astralist)
GEN="$SOL_ROOT/sol/gen.sh"
if [[ -x "$GEN" ]] && command -v jq >/dev/null 2>&1; then
    "$GEN" moon indexcubo "$domain" >/dev/null 2>&1 || true
fi

exit 0
