#!/usr/bin/env bash
# __sol_dispatch.sh
#
# Ο καρδιακός κόμβος της γλώσσας.
# Δεν ξέρει τίποτα ειδικό. Μόνο:
#
#   1. <noun> <verb>  →  <noun>_<verb>.sh   (script mode)
#   2. <noun> <verb>  →  <noun>.sh::<noun>_<verb>   (function mode)
#   3. <noun>         →  <noun>.sh, default verb = esti
#   4. native Bash    (command)
#   5. not found
#
# Ειδικές περιπτώσεις (gaia, opus, help, version) ΜΕΤΑΦΕΡΟΝΤΑΙ σταδιακά
# σε actions/ και systems/. Μέχρι τότε, μένουν εδώ ως fallback.

__sol_dispatch() {
    (($#)) || return 0

    local name="$1"
    local verb=""
    local rest=()
    local file mode fn candidate found=0

    shift

    # --------------------------------------------------
    # Fallback: ειδικές περιπτώσεις (προς μεταφορά)
    # --------------------------------------------------
    case "$name" in
        help)
            __sol_help
            return 0
            ;;
        version)
            printf 'SOL %s\n' "$SOL_VERSION"
            return 0
            ;;
        gaia)
            __sol_fallback_gaia "$@"
            return $?
            ;;
        opus)
            __sol_fallback_opus "$@"
            return $?
            ;;
    esac

    # --------------------------------------------------
    # Δεύτερη λέξη = verb (αν υπάρχει)
    # --------------------------------------------------
    if (($#)); then
        verb="$1"
        shift
    fi
    rest=("$@")

    # --------------------------------------------------
    # 1+2. <noun> <verb> → script ή function
    # --------------------------------------------------
    if [[ -n $verb ]]; then
        if IFS=$'\t' read -r file mode fn < <(__sol_find_expression "$name" "$verb"); then
            case "$mode" in
                script)
                    ( cd "$SOL_ROOT" && bash "$file" "${rest[@]}" )
                    return $?
                    ;;
                function)
                    __sol_load "$file" || return 1
                    if declare -F "$fn" >/dev/null 2>&1; then
                        ( cd "$SOL_ROOT" && "$fn" "${rest[@]}" )
                        return $?
                    fi
                    ;;
            esac
        fi
    fi

    # --------------------------------------------------
    # 3. <noun> μόνο → <noun>.sh, default verb = esti
    # --------------------------------------------------
    if file=$(__sol_find_noun "$name"); then
        __sol_load "$file" || return 1

        [[ -z $verb ]] && verb="esti"
        fn="${name}_${verb}"

        if declare -F "$fn" >/dev/null 2>&1; then
            ( cd "$SOL_ROOT" && "$fn" "${rest[@]}" )
            return $?
        fi

        # Δείξε διαθέσιμες
        printf 'SOL: %s has no expression "%s". Available:' \
            "$name" "$verb" >&2

        while IFS= read -r candidate; do
            printf ' %s' "$candidate" >&2
            found=1
        done < <(__sol_verbs "$name")

        ((found)) || printf ' (none)' >&2
        printf '\n' >&2
        return 2
    fi

    # --------------------------------------------------
    # 4. Native Bash
    # --------------------------------------------------
    if command -v "$name" >/dev/null 2>&1; then
        ( cd "$SOL_ROOT" && command "$name" "${rest[@]}" )
        return $?
    fi

    # --------------------------------------------------
    # 5. Not found
    # --------------------------------------------------
    printf 'bash: %s: command not found (try: help)\n' "$name" >&2
    return 127
}

# --------------------------------------------------
# Fallbacks (προς μεταφορά σε actions/ ή systems/)
# --------------------------------------------------

__sol_fallback_gaia() {
    local gaia_cli="$SOL_ROOT/gaia/sol/index.php"

    if [[ ! -f $gaia_cli ]]; then
        printf 'SOL: Gaia not found: %s\n' "$gaia_cli" >&2
        return 127
    fi

    if ! command -v php >/dev/null 2>&1; then
        printf 'SOL: PHP cli is not available\n' >&2
        return 127
    fi

    php "$gaia_cli" gaia "$@"
}

__sol_fallback_opus() {
    case "${1:-esti}" in
        esti)
            printf 'OPUS expression space - ASTRA packaging integration follows.\n'
            ;;
        neo|sose)
            printf 'OPUS %s - reserved expression; provider not connected yet.\n' "$1"
            return 2
            ;;
        *)
            printf 'OPUS expressions: esti neo sose\n'
            ;;
    esac
    return 0
}