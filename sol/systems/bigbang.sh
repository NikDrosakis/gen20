#!/bin/bash
# BIGBANG — GEN20 infrastructure bootstrap
# Source-only. Όλες οι εκφράσεις είναι functions: bigbang_<verb>.

BIGBANG_SCRIPT="${BIGBANG_SCRIPT:-$SOL_ROOT/sol/actions/bigbang_start.sh}"

bigbang_about() { printf '%s\n' 'BIGBANG | GEN20 infrastructure bootstrap'; }
bigbang_esti()  { bigbang_help; }
bigbang_help()  { printf '%s\n' 'Expressions: about esti help install verify'; }

bigbang_install() {
    if [[ ! -f $BIGBANG_SCRIPT ]]; then
        printf '❌ BIGBANG: not found: %s\n' "$BIGBANG_SCRIPT" >&2
        return 1
    fi

    if [[ $EUID -ne 0 ]]; then
        printf '❌ BIGBANG: must run as root\n' >&2
        return 1
    fi

    bash "$BIGBANG_SCRIPT" "$@"
}

bigbang_verify() {
    # Έλεγχος ότι τα βασικά είναι εγκατεστημένα
    local missing=0

    for cmd in go node yarn php python3 mariadb redis-server nginx; do
        if command -v "$cmd" >/dev/null 2>&1; then
            printf '✅ %s\n' "$cmd"
        else
            printf '❌ %s\n' "$cmd"
            missing=$((missing + 1))
        fi
    done

    [[ $missing -eq 0 ]] && printf '✅ all installed\n'
    return $missing
}