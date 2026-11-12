#!/bin/bash
# astra_pull.sh — cubo <name> ← <domain>
# Χρήση: gen astra pull <name> [domain]
#
# Αντίστροφο του push.
#   moon   ← moon/<domain>/src/cubos/<name>
#   kronos ← kronos/cubos/<name>
#   mars   ← mars/cubos/<name>
#   god    ← god/cubos/<name>
#
# Αν υπάρχει αρχείο στον προορισμό:
#   moon: <file>.<domain χωρίς τελεία>  π.χ. Hello.jsx.gen20art
#         αν υπάρχει ήδη → .1, .2, ...
#   άλλα: <file>.1, .2, ...
# Καμία ενημέρωση βάσης

set -uo pipefail

ASTRA_DIR="${ASTRA_DIR:-/var/www/gs/astra}"
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
GEN_LOG_FILE="${GEN_LOG_FILE:-$SOL_ROOT/data/gen20.net/gen.txt}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GEN_LOG_FILE"; }
err() { printf '❌ %s\n' "$*" >&2; log "ERROR: $*"; }

backup_name() {
    local file="$1"
    local domain="$2"
    local n=1

    if [[ -n $domain ]]; then
        local ext="${domain//./}"
        local candidate="${file}.${ext}"
        if [[ ! -e $candidate ]]; then
            printf '%s\n' "$candidate"
            return 0
        fi
        while [[ -e "${candidate}.${n}" ]]; do
            n=$((n + 1))
        done
        printf '%s\n' "${candidate}.${n}"
    else
        while [[ -e "${file}.${n}" ]]; do
            n=$((n + 1))
        done
        printf '%s\n' "${file}.${n}"
    fi
}

name="${1:-}"
domain="${2:-gen20.art}"

if [[ -z $name ]]; then
    printf 'Usage: astra pull <name> [domain]\n' >&2
    exit 1
fi

dst_root="$ASTRA_DIR/$name"

declare -A SRC=(
    [moon]="$SOL_ROOT/moon/$domain/src/cubos"
    [kronos]="$SOL_ROOT/kronos/cubos"
    [mars]="$SOL_ROOT/mars/cubos"
    [god]="$SOL_ROOT/god/cubos"
)

declare -A DOMAIN_MAP=(
    [moon]="$domain"
    [kronos]=""
    [mars]=""
    [god]=""
)

ORDER=(moon kronos mars god)

log "=== ASTRA PULL: $name (domain: $domain) ==="
log "dst: $dst_root"

if ! mkdir -p "$dst_root"; then
    err "cannot mkdir $dst_root"
    exit 1
fi

copied=0
backup=0
skipped=0
failed=0

for sub in "${ORDER[@]}"; do
    src="${SRC[$sub]}/$name"
    dst="$dst_root/$sub"
    sub_domain="${DOMAIN_MAP[$sub]}"

    if [[ ! -d $src ]]; then
        log "  ⏭  $sub: source not found ($src)"
        skipped=$((skipped + 1))
        continue
    fi
    if [[ -z $(find "$src" -mindepth 1 -print -quit 2>/dev/null) ]]; then
        log "  ⏭  $sub: empty, skip"
        skipped=$((skipped + 1))
        continue
    fi

    if ! mkdir -p "$dst"; then
        err "  ❌ $sub: cannot mkdir $dst"
        failed=$((failed + 1))
        continue
    fi

    while IFS= read -r -d '' file; do
        rel="${file#"$src"/}"
        target="$dst/$rel"
        target_dir="$(dirname "$target")"

        if ! mkdir -p "$target_dir"; then
            err "  ❌ cannot mkdir $target_dir"
            failed=$((failed + 1))
            continue
        fi

        if [[ -e $target ]]; then
            bkp=$(backup_name "$target" "$sub_domain")
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
            log "  ✅ $sub/$rel"
            copied=$((copied + 1))
        else
            err "  ❌ copy failed: $file"
            failed=$((failed + 1))
        fi
    done < <(find "$src" -type f -print0 2>/dev/null)
done

log "=== DONE: copied=$copied backup=$backup skipped=$skipped failed=$failed ==="
[[ $failed -eq 0 ]] || exit 1
exit 0