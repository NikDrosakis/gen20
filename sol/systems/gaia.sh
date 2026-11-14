# systems/gaia.sh — function-only

gaia() {
    local GAIA_CLI="${GAIA_CLI:-$SOL_ROOT/gaia/sol/index.php}"

    [[ -f $GAIA_CLI ]] || {
        printf '❌ GAIA: not found: %s\n' "$GAIA_CLI" >&2
        return 127
    }

    command -v php >/dev/null 2>&1 || {
        printf '❌ GAIA: PHP CLI not available\n' >&2
        return 127
    }

    php "$GAIA_CLI" "$@"
}

