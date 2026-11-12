#!/bin/bash
# ASTRA — package build and distribution
# Source-only. Όλες οι εκφράσεις είναι functions: astra_<verb>.

# --------------------------------------------------
# Paths
# --------------------------------------------------

ASTRA_DIR="${ASTRA_DIR:-$SOL_ROOT/astra}"
ASTRA_ROOT="${ASTRA_ROOT:-$ASTRA_DIR}"
ASTRA_PACKAGES="${ASTRA_PACKAGES:-$ASTRA_ROOT}"
ASTRA_BUILD="${ASTRA_BUILD:-$ASTRA_DIR/build}"
ASTRA_DIST="${ASTRA_DIST:-$ASTRA_DIR/dist}"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

astra_log() {
    printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "${GEN_LOG_FILE:-/var/www/gs/data/gen20.net/gen.txt}"
}

astra_error() {
    printf '❌ %s\n' "$*" >&2
    astra_log "ERROR: $*"
}

# --------------------------------------------------
# Expressions
# --------------------------------------------------

astra_about() { printf '%s\n' 'ASTRA | package build and distribution'; }
astra_esti()  { astra_help; }
astra_help()  { printf '%s\n' 'Expressions: about esti help root list tree migrate package'; }

astra_root() {
    printf '%s\n' "$ASTRA_DIR"
}

astra_list() {
    local dir="${1:-$ASTRA_PACKAGES}"

    [[ -d $dir ]] || { astra_error "not found: $dir"; return 1; }

    local items=()
    while IFS= read -r -d '' entry; do
        items+=("$(basename -- "$entry")")
    done < <(find "$dir" -mindepth 1 -maxdepth 1 -print0 2>/dev/null | sort -z)

    ((${#items[@]})) || { astra_error "empty: $dir"; return 1; }

    printf '%s\n' "${items[*]}"
}

astra_tree() {
    local dir="${1:-$ASTRA_ROOT}"

    [[ -d $dir ]] || { astra_error "not found: $dir"; return 1; }

    if command -v tree >/dev/null 2>&1; then
        tree -L 2 -I 'node_modules|.git|dist|build' --dirsfirst "$dir"
    else
        find "$dir" -maxdepth 2 -mindepth 1 -type d -printf '%P\n' 2>/dev/null | sort
    fi
}