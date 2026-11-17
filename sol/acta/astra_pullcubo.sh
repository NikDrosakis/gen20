#!/bin/bash
# astra_pullcubo.sh — cubo <name> ← <domain>
# Χρήση: gen astra pullcubo <name|ola> [domain]
#
# Αντίστροφο του pushcubo.
#   moon   ← moon/<domain>/src/cubos/<name>
#   kronos ← kronos/cubos/<name>
#   mars   ← mars/cubos/<name>
#   god    ← god/cubos/<name>
#
# Αν <name> = ola  → λούπα σε ΟΛΑ τα cubos του domain
#                    και στο τέλος καλεί: astra indexcubo <domain>
#
# Αν υπάρχει αρχείο στον προορισμό:
#   moon: <file>.<domain χωρίς τελεία>  π.χ. Hello.jsx.gen20art
#         αν υπάρχει ήδη → .1, .2, ...
#   άλλα: <file>.1, .2, ...
# Καμία ενημέρωση βάσης (μόνο indexcubo στο wildcard mode)

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

pull_one() {
    local name="$1"
    local domain="$2"

    local dst_root="$ASTRA_DIR/cubos/$name"

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
    local ORDER=(moon kronos mars god)

    log "=== ASTRA PULLCUBO: $name (domain: $domain) ==="
    log "dst: $dst_root"

    if ! mkdir -p "$dst_root"; then
        err "cannot mkdir $dst_root"
        return 1
    fi

    local copied=0 backup=0 skipped=0 failed=0

    for sub in "${ORDER[@]}"; do
        local src="${SRC[$sub]}/$name"
        local dst="$dst_root/$sub"
        local sub_domain="${DOMAIN_MAP[$sub]}"

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
            local rel="${file#"$src"/}"
            local target="$dst/$rel"
            local target_dir
            target_dir="$(dirname "$target")"

            if ! mkdir -p "$target_dir"; then
                err "  ❌ cannot mkdir $target_dir"
                failed=$((failed + 1))
                continue
            fi

 # ── ΕΛΕΓΧΟΣ ΑΝ ΤΟ ΑΡΧΕΙΟ ΕΙΝΑΙ ΙΔΙΟ ──
            if [[ -e $target ]]; then
                # Αν είναι πανομοιότυπα, το προσπερνάμε
                if cmp -s "$file" "$target"; then
                    log "  ⏭️  $sub/$rel (identical, omit file)"
                    skipped=$((skipped + 1))
                    continue
                fi

            if [[ -e $target ]]; then
                local bkp
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

    log "--- $name: copied=$copied backup=$backup skipped=$skipped failed=$failed ---"
    [[ $failed -eq 0 ]] || return 1
    return 0
}

# ---------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------
name="${1:-}"
domain="${2:-gen20.art}"

# ── reserved: ola = όλα τα cubos του domain ──
if [[ $name == "ola" ]]; then
    name="__ALL__"
fi

if [[ -z $name ]]; then
    printf 'Usage: astra pullcubo <name|ola> [domain]\n' >&2
    exit 1
fi

overall_failed=0

if [[ $name == "__ALL__" ]]; then
    log "=== ASTRA PULLCUBO ola (domain: $domain) ==="
    cubos_src="$SOL_ROOT/moon/$domain/src/cubos"

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
        if ! pull_one "$c" "$domain"; then
            overall_failed=$((overall_failed + 1))
        fi
    done

    log "=== PULL ola DONE: ${#cubos[@]} cubos, failed=$overall_failed ==="

else
    if ! pull_one "$name" "$domain"; then
        overall_failed=1
    fi
fi

[[ $overall_failed -eq 0 ]] || exit 1

    # ── Ενημέρωση moonlist.json μετά το pull ──
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    MOON_INDEX="$SCRIPT_DIR/moon_indexcubo.sh"

    if [[ -x "$MOON_INDEX" ]]; then
        log "=== MOON INDEXCUBO: $domain ==="
        "$MOON_INDEX" "$domain"
    else
        err "moon_indexcubo.sh not found or not executable at $MOON_INDEX"
    fi

exit 0