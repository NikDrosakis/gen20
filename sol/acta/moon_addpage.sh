#!/bin/bash
# sol/acta/moon_addpage.sh — προσθέτει/ενημερώνει σελίδα στο data/<domain>/moon_manifest.json
#
# Usage:
#   moon addpage <domain> <page-name> <entity>
#
# <entity>:
#   cubo        → m: [{ "cubo": "<page-name>" }]
#   ContentOne  → m: [{ "contentOne": { "name": "<page-name>" } }]
#   ContentLoop → m: [{ "contentLoop": { "name": "<page-name>" } }]
#
# page key = <page-name>, title = ucfirst(<page-name>) αυτόματα.
#
# Examples:
#   moon addpage gen20.dev login cubo
#   moon addpage gen20.dev contact ContentOne
#   moon addpage gen20.dev blog ContentLoop

ucfirst() {
    local s="$1"
    [[ -z $s ]] && { printf '%s' "$s"; return; }
    printf '%s%s' "${s:0:1}" "${s:1}"
    # bash 4+: "${s^}"
}

moon_addpage() {
    local domain="${1:-}"
    local name="${2:-}"
    local entity="${3:-}"

    [[ -n $domain && -n $name && -n $entity ]] || {
        printf 'Usage: moon addpage <domain> <page-name> <entity>\n  entity: cubo | ContentOne | ContentLoop\n' >&2
        return 1
    }

    local REPO_ROOT="${SOL_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)}"
    local manifest="$REPO_ROOT/data/$domain/moon_manifest.json"
    [[ -f $manifest ]] || { printf '❌ manifest not found: %s\n' "$manifest" >&2; return 1; }

    command -v jq >/dev/null 2>&1 || { printf '❌ jq not installed\n' >&2; return 1; }

    # title = ucfirst(name)
    local title
    title="${name^}" 2>/dev/null || title="$(ucfirst "$name")"

    local item=""
    case "$entity" in
        cubo)        item=$(jq -cn --arg n "$name" '{cubo: $n}') ;;
        ContentOne)  item=$(jq -cn --arg n "$name" '{contentOne: {name: $n}}') ;;
        ContentLoop) item=$(jq -cn --arg n "$name" '{contentLoop: {name: $n}}') ;;
        *)
            printf '❌ invalid entity: %s (use cubo | ContentOne | ContentLoop)\n' "$entity" >&2
            return 1
            ;;
    esac

    local page_obj
    page_obj=$(jq -cn --arg title "$title" --argjson item "$item" \
        '{title: $title, h: [], sl: [], m: [$item], sr: [], f: []}')

    jq --arg k "$name" --argjson p "$page_obj" '.pages[$k] = $p' "$manifest" > "$manifest.tmp" \
        && mv "$manifest.tmp" "$manifest"

    printf '✅ added page "%s" (title "%s") to %s\n' "$name" "$title" "$manifest"
    jq -c ".pages[\"$name\"]" "$manifest"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    moon_addpage "$@"
fi
