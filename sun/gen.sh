#!/bin/bash
# /var/www/gs/sun/gen.sh

set -u

ROOT="/var/www/gs"
SUN_DIR="$ROOT/sun"

# Φόρτωση .env για $host
[ -f "$ROOT/.env" ] && source "$ROOT/.env"

HOST_TAG="${host:-gen20.net}"
GEN_LOG="$ROOT/data/$HOST_TAG/gen.txt"

mkdir -p "$(dirname "$GEN_LOG")" || {
    echo "ERROR: cannot create log dir: $(dirname "$GEN_LOG")" >&2
    exit 1
}

cd "$ROOT" || exit 1

[ -x "$SUN_DIR/exec.sh" ] || { echo "ERROR: $SUN_DIR/exec.sh not executable" >&2; exit 1; }
[ -x "$SUN_DIR/menu.sh" ] || { echo "ERROR: $SUN_DIR/menu.sh not executable" >&2; exit 1; }

# ==============================================
# Parse global flags
# ==============================================
args=()
LOG_MODE=0
SHOW_BANNER=1

for a in "$@"; do
    case "$a" in
        --log)       LOG_MODE=1 ;;
        --no-banner) SHOW_BANNER=0 ;;
        *)           args+=("$a") ;;
    esac
done

# ==============================================
# Banner
# ==============================================
if [ "$SHOW_BANNER" -eq 1 ] && [ -f "$SUN_DIR/banner.sh" ]; then
    source "$SUN_DIR/banner.sh"
    show_banner
fi

# ==============================================
# Run
# ==============================================
if [ "${#args[@]}" -eq 0 ]; then
    # Μενού
    "$SUN_DIR/menu.sh"
else
    if [ "$LOG_MODE" -eq 1 ]; then
        # Γράφει και στο log
        "$SUN_DIR/exec.sh" "${args[@]}" 2>&1 | tee -a "$GEN_LOG"
    else
        # Μόνο κονσόλα
        "$SUN_DIR/exec.sh" "${args[@]}"
    fi
fi