#!/bin/bash
# astra_pushcubo.sh — cubo <name> → <domain>
# Χρήση: gen astra pushcubo <name> [domain]
#
# Αντίγραφα από astra/cubos/<name>/<sub>/ → destination/<name>
#   moon   → moon/<domain>/src/cubos/<name>
#   kronos → kronos/cubos/<name>
#   mars   → mars/cubos/<name>
#   god    → god/cubos/<name>
#
# Αν ο προορισμός υπάρχει: ρωτάει "Sync?" και κάνει rsync --update
# Αν δεν υπάρχει: cp -r
# Καμία ενημέρωση βάσης

set -uo pipefail

ASTRA_DIR="${ASTRA_DIR:-/var/www/gs/astra}"
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
GEN_LOG_FILE="${GEN_LOG_FILE:-$SOL_ROOT/data/gen20.net/gen.txt}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GEN_LOG_FILE"; }
err() { printf '❌ %s\n' "$*" >&2; log "ERROR: $*"; }

name="${1:-}"
domain="${2:-gen20.art}"

if [[ -z $name ]]; then
    printf 'Usage: astra pushcubo <name> [domain]\n' >&2
    exit 1
fi

src_root="$ASTRA_DIR/cubos/$name"
if [[ ! -d $src_root ]]; then
    err "not found: $src_root"
    exit 1
fi

declare -A DEST=(
    [moon]="$SOL_ROOT/moon/$domain/src/cubos"
    [kronos]="$SOL_ROOT/kronos/cubos"
    [mars]="$SOL_ROOT/mars/cubos"
    [god]="$SOL_ROOT/god/cubos"
)

ORDER=(moon kronos mars god)

log "=== ASTRA PUSHCUBO: $name (domain: $domain) ==="
log "src: $src_root"

copied=0
skipped=0
failed=0

for sub in "${ORDER[@]}"; do
    src="$src_root/$sub"
    dst_root="${DEST[$sub]}"
    dst="$dst_root/$name"

    if [[ ! -d $src ]]; then
        continue
    fi
    if [[ -z $(find "$src" -mindepth 1 -print -quit 2>/dev/null) ]]; then
        log "  ⏭  $sub: empty, skip"
        skipped=$((skipped + 1))
        continue
    fi

    if [[ -d $dst ]]; then
        printf '⚠️  %s already exists. Sync? [y/N] ' "$dst"
        read -r answer
        if [[ "${answer,,}" != "y" ]]; then
            log "  ⏭  $sub: skipped by user"
            skipped=$((skipped + 1))
            continue
        fi

        if rsync -a --update --itemize-changes "$src/" "$dst/" 2>&1 | tee -a "$GEN_LOG_FILE"; then
            log "  ✅ $sub: synced → $dst"
            copied=$((copied + 1))
        else
            err "  ❌ $sub: rsync failed"
            failed=$((failed + 1))
        fi
    else
        if ! mkdir -p "$dst_root"; then
            err "  ❌ $sub: cannot mkdir $dst_root"
            failed=$((failed + 1))
            continue
        fi

        if cp -r "$src" "$dst"; then
            log "  ✅ $sub: copied → $dst"
            copied=$((copied + 1))
        else
            err "  ❌ $sub: copy failed"
            failed=$((failed + 1))
        fi
    fi
done

log "=== DONE: copied=$copied skipped=$skipped failed=$failed ==="
[[ $failed -eq 0 ]] || exit 1
exit 0