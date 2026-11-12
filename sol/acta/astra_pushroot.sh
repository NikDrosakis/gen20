#!/bin/bash
# astra_pushroot.sh — root files → moon/<domain>/src

set -uo pipefail

ASTRA_DIR="${ASTRA_DIR:-/var/www/gs/astra}"
SOL_ROOT="${SOL_ROOT:-/var/www/gs}"
GEN_LOG_FILE="${GEN_LOG_FILE:-$SOL_ROOT/data/gen20.net/gen.txt}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*" | tee -a "$GEN_LOG_FILE"; }
err() { printf '❌ %s\n' "$*" >&2; log "ERROR: $*"; }

domain="${1:-}"
if [[ -z $domain ]]; then
    printf 'Usage: astra pushroot <domain>\n' >&2
    exit 1
fi

src_root="$ASTRA_DIR/root"
dst_root="$SOL_ROOT/moon/$domain/src"

[[ -d $src_root ]] || { err "not found: $src_root"; exit 1; }
[[ -d $dst_root ]] || { err "not found: $dst_root"; exit 1; }

log "=== ASTRA PUSHROOT: $domain ==="
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

# Άνοιξε FD 3 για το terminal (για να διαβάζεις απαντήσεις)
exec 3<&0

while IFS= read -r -d '' file; do
    rel="${file#"$src_root"/}"
    base="$(basename "$file")"

    # Εξαίρεση backups
    if [[ $base =~ \.[0-9]+$ ]] || [[ $base =~ \.gen20[a-z]+$ ]]; then
        log "  ⏭  $rel: backup, skip"
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

    if [[ -e $target ]]; then
        printf '⚠️  %s already exists. Sync? [y/N] ' "$target"
        read -r answer <&3   # ← διάβασε από FD 3 (terminal)
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