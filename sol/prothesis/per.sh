#!/bin/bash
# prothesis/per.sh — αποθηκεύει την έξοδο μιας εντολής σε αρχείο
# «per» — λατινικά: «μέσω», «δια μέσου»
#
# Χρήση: per <output-file> <command> [args...]
#        per <output-file> -- <command> [args...]
#
# Παραδείγματα:
#   gen> per data/gen20.net/GContext.json gaia getComponentFiles
#   gen> per data/gen20.net/users.json gaia fa "select * from gen20net.user"
#   gen> per data/test.txt ls -la
#   gen> per data/test.txt -- find . -type f

per() {
    local output="${1:-}"
    shift 2>/dev/null || true

    # Αν το πρώτο όρισμα είναι --, αγνόησέ το
    [[ "${1:-}" == "--" ]] && shift

    if [[ -z $output ]]; then
        printf 'Usage: per <output-file> -- <command> [args...]\n' >&2
        return 1
    fi

    if (($# == 0)); then
        printf '❌ per: no command given\n' >&2
        return 1
    fi

    # Δημιούργησε τον φάκελο αν δεν υπάρχει
    local dir
    dir="$(dirname "$output")"
    if [[ ! -d $dir ]]; then
        mkdir -p "$dir" || { printf '❌ per: cannot mkdir %s\n' "$dir" >&2; return 1; }
    fi

    # Τρέξε την εντολή — γράψε κατευθείαν στο file
    "$@" > "$output" 2>&1
    local rc=$?

    if [[ $rc -ne 0 ]]; then
        printf '❌ per: command failed (exit %d)\n' "$rc" >&2
        return $rc
    fi

    local size
    size=$(wc -c < "$output" 2>/dev/null || echo 0)
    printf '✅ %s (%s bytes)\n' "$output" "$size"

    return 0
}