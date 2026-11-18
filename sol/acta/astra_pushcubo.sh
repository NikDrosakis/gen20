#!/bin/bash
# astra_pushcubo.sh — cubo <name> → <domain>
# Χρήση: gen astra pushcubo <name|ola> [domain]
#
# Αντίγραφα από astra/cubos/<name>/<sub>/ → destination/<name>
#   moon   → moon/<domain>/src/cubos/<name>
#   kronos → kronos/cubos/<name>
#   mars   → mars/cubos/<name>
#   god    → god/cubos/<name>
#
# Αν <name> = ola  → λούπα σε ΟΛΑ τα cubos του astra/cubos
#
# Αν ο προορισμός υπάρχει: ρωτάει "Sync?" και κάνει rsync --update
# Αν δεν υπάρχει: cp -r
# Καμία ενημέρωση βάσης (μόνο αν το ζητήσεις)

set -uo pipefail

ASTRA_DIR="${ASTRA_DIR:-/var/www/gs/astra}"
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
GEN_LOG_FILE="${GEN_LOG_FILE:-$SOL_ROOT/data/gen20.net/gen.txt}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GEN_LOG_FILE"; }
err() { printf '❌ %s\n' "$*" >&2; log "ERROR: $*"; }

# ── Συνάρτηση για ένα cubo ──
push_one() {
    local name="$1"
    local domain="$2"

    local src_root="$ASTRA_DIR/cubos/$name"
    if [[ ! -d $src_root ]]; then
        err "not found: $src_root"
        return 1
    fi

    declare -A DEST=(
        [moon]="$SOL_ROOT/moon/$domain/src/cubos"
        [kronos]="$SOL_ROOT/kronos/cubos"
        [mars]="$SOL_ROOT/mars/cubos"
        [god]="$SOL_ROOT/god/cubos"
    )

    local ORDER=(moon kronos mars god)
    local copied=0 skipped=0 failed=0

    log "=== ASTRA PUSHCUBO: $name (domain: $domain) ==="
    log "src: $src_root"

    for sub in "${ORDER[@]}"; do
        local src="$src_root/$sub"
        local dst_root="${DEST[$sub]}"
        local dst="$dst_root/$name"

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

    log "--- $name: copied=$copied skipped=$skipped failed=$failed ---"
    [[ $failed -eq 0 ]] || return 1
    return 0
}

# ── MAIN ──
name="${1:-}"
domain="${2:-gen20.art}"

# ── reserved: ola = όλα τα cubos ──
if [[ $name == "ola" ]]; then
    name="__ALL__"
fi

if [[ -z $name ]]; then
    printf 'Usage: astra pushcubo <name|ola> [domain]\n' >&2
    exit 1
fi

overall_failed=0

if [[ $name == "__ALL__" ]]; then
    log "=== ASTRA PUSHCUBO ola (domain: $domain) ==="

    cubos_src="$ASTRA_DIR/cubos"
    if [[ ! -d $cubos_src ]]; then
        err "cubos dir not found: $cubos_src"
        exit 1
    fi

    mapfile -t cubos < <(
        find "$cubos_src" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
    )

    if [[ ${#cubos[@]} -eq 0 ]]; then
        err "no cubos found in $cubos_src"
        exit 1
    fi

    log "found ${#cubos[@]} cubo(s): ${cubos[*]}"

    for c in "${cubos[@]}"; do
        if ! push_one "$c" "$domain"; then
            overall_failed=$((overall_failed + 1))
        fi
    done

    log "=== PUSH ola DONE: ${#cubos[@]} cubos, failed=$overall_failed ==="
else
    if ! push_one "$name" "$domain"; then
        overall_failed=1
    fi
fi

[[ $overall_failed -eq 0 ]] || exit 1
exit 0