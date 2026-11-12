#!/bin/bash
# astra_pullapp.sh — moon/<domain>/src/apps/ → app files
# Χρήση: gen astra pullapp <domain> <app>
#
# Αντίγραφα από moon/<domain>/src/apps/ → astra/apps/<app>/
# - Αρχείο-αρχείο (όχι folder)
# - Αν υπάρχει ήδη → ρωτάει "Replace?" → backup .1, .2, ... + νέο
# - Καμία ενημέρωση βάσης

set -uo pipefail

ASTRA_DIR="${ASTRA_DIR:-/var/www/gs/astra}"
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
GEN_LOG_FILE="${GEN_LOG_FILE:-$SOL_ROOT/data/gen20.net/gen.txt}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GEN_LOG_FILE"; }
err() { printf '❌ %s\n' "$*" >&2; log "ERROR: $*"; }

domain="${1:-}"
app="${2:-}"

if [[ -z $domain || -z $app ]]; then
    printf 'Usage: astra pullapp <domain> <app>\n' >&2
    exit 1
fi

src_root="$SOL_ROOT/moon/$domain/src/apps"
dst_root="$ASTRA_DIR/apps/$app"

[[ -d $src_root ]] || { err "not found: $src_root"; exit 1; }

mkdir -p "$dst_root" || { err "cannot mkdir $dst_root"; exit 1; }

log "=== ASTRA PULLAPP: $domain → $app ==="
log "src: $src_root"
log "dst: $dst_root"

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

exec 3<&0

while IFS= read -r -d '' file; do
    rel="${file#"$src_root"/}"
    target="$dst_root/$rel"
    target_dir="$(dirname "$target")"

    if ! mkdir -p "$target_dir"; then
        err "  ❌ cannot mkdir $target_dir"
        failed=$((failed + 1))
        continue
    fi

    if [[ -e $target ]]; then
        printf '⚠️  %s already exists. Replace? [y/N] ' "$target"
        read -r answer <&3
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

    if cp "$file" "$target"; then
        log "  ✅ $rel"
        copied=$((copied + 1))
    else
        err "  ❌ copy failed: $file"
        failed=$((failed + 1))
    fi
done < <(find "$src_root" -type f -print0 2>/dev/null)

exec 3<&-

log "=== DONE: copied=$copied backup=$backup skipped=$skipped failed=$failed ==="
[[ $failed -eq 0 ]] || exit 1
exit 0