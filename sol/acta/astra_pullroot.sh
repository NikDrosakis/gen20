#!/bin/bash
# astra_pullroot.sh — moon/<domain>/src → root files
# Χρήση: gen astra pullroot <domain> --files <file1> <file2> ...
#
# Αντίγραφα από moon/<domain>/src/ → astra/root/
# - Μόνο συγκεκριμένα αρχεία (όχι folders)
# - Αν υπάρχει ήδη → ρωτάει "Sync?" → backup .1, .2, ... + νέο
# - Καμία ενημέρωση βάσης

set -uo pipefail

ASTRA_DIR="${ASTRA_DIR:-/var/www/gs/astra}"
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
GEN_LOG_FILE="${GEN_LOG_FILE:-$SOL_ROOT/data/gen20.net/gen.txt}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GEN_LOG_FILE"; }
err() { printf '❌ %s\n' "$*" >&2; log "ERROR: $*"; }

# Parse args
domain=""
files=()

while (($#)); do
    case "$1" in
        --files)
            shift
            while (($#)) && [[ $1 != --* ]]; do
                files+=("$1")
                shift
            done
            ;;
        *)
            if [[ -z $domain ]]; then
                domain="$1"
            fi
            shift
            ;;
    esac
done

if [[ -z $domain ]]; then
    printf 'Usage: astra pullroot <domain> --files <file1> <file2> ...\n' >&2
    exit 1
fi

if ((${#files[@]} == 0)); then
    printf '❌ --files required (τουλάχιστον 1 αρχείο)\n' >&2
    exit 1
fi

src_root="$SOL_ROOT/moon/$domain/src"
dst_root="$ASTRA_DIR/root"

[[ -d $src_root ]] || { err "not found: $src_root"; exit 1; }
[[ -d $dst_root ]] || { err "not found: $dst_root"; exit 1; }

log "=== ASTRA PULLROOT: $domain ==="
log "src: $src_root"
log "dst: $dst_root"
log "files: ${files[*]}"

# Backup helper
backup_name() {
    local file="$1"
    local n=1
    while [[ -e "${file}.${n}" ]]; do
        n=$((n + 1))
    done
    printf '%s\n' "${file}.${n}"
}

copied=0
backup=0
skipped=0
failed=0

for rel in "${files[@]}"; do
    src="$src_root/$rel"

    # Έλεγχος: υπάρχει, δεν είναι folder
    if [[ ! -e $src ]]; then
        log "  ⏭  $rel: not found"
        skipped=$((skipped + 1))
        continue
    fi
    if [[ -d $src ]]; then
        log "  ⏭  $rel: is folder, skip"
        skipped=$((skipped + 1))
        continue
    fi

    target="$dst_root/$rel"
    target_dir="$(dirname "$target")"

    if ! mkdir -p "$target_dir"; then
        err "  ❌ cannot mkdir $target_dir"
        failed=$((failed + 1))
        continue
    fi

    # Αν υπάρχει → ρώτα
    if [[ -e $target ]]; then
        printf '⚠️  %s already exists. Sync? [y/N] ' "$target"
        read -r answer
        if [[ "${answer,,}" != "y" ]]; then
            log "  ⏭  $rel: skipped by user"
            skipped=$((skipped + 1))
            continue
        fi

        bkp=$(backup_name "$target")
        if mv "$target" "$bkp"; then
            log "  📦 backup: $(basename "$bkp")"
            backup=$((backup + 1))
        else
            err "  ❌ backup failed: $target"
            failed=$((failed + 1))
            continue
        fi
    fi

    if cp "$src" "$target"; then
        log "  ✅ $rel"
        copied=$((copied + 1))
    else
        err "  ❌ copy failed: $src"
        failed=$((failed + 1))
    fi
done

log "=== DONE: copied=$copied backup=$backup skipped=$skipped failed=$failed ==="
[[ $failed -eq 0 ]] || exit 1
exit 0