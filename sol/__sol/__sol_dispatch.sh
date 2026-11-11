# --------------------------------------------------
# DISPATCH
#
# Σειρά:
#   1. <noun> <verb>  →  <noun>_<verb>.sh   (script mode)
#   2. <noun> <verb>  →  <noun>.sh::<noun>_<verb>   (function mode)
#   3. <noun>         →  <noun>.sh, default verb = esti
#   4. ειδικές: gaia, opus, help, version
#   5. native Bash (command)
#   6. command not found
# --------------------------------------------------

__sol_dispatch() {
    (($#)) || return 0

    local name="$1"
    local verb=""
    local rest=()
    local file mode fn candidate found=0

    shift

    # Ειδικές περιπτώσεις (πριν το discovery)
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
            local gaia_cli="$SOL_DIR/systems/gaia/index.php"

            if [[ ! -f $gaia_cli ]]; then
                printf 'SOL: Gaia CLI not found: %s\n' "$gaia_cli" >&2
                return 127
            fi

            if ! command -v php >/dev/null 2>&1; then
                printf 'SOL: PHP CLI is not available\n' >&2
                return 127
            fi

            php "$gaia_cli" gaia "$@"
            return $?
            ;;

        opus)
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
            ;;
    esac

    # Αν υπάρχει δεύτερο όρισμα, είναι verb
    if (($#)); then
        verb="$1"
        shift
    fi
    rest=("$@")

    # 1+2. <noun> <verb> → script ή function
    if [[ -n $verb ]]; then
        if IFS=$'\t' read -r file mode fn < <(__sol_find_expression "$name" "$verb"); then
            case "$mode" in
                script)
                    # Εκτέλεση ως subprocess
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

    # 3. <noun> μόνο → <noun>.sh, default verb = esti
    if file=$(__sol_find_noun "$name"); then
        __sol_load "$file" || return 1

        if [[ -z $verb ]]; then
            verb="esti"
        fi

        fn="${name}_${verb}"

        if declare -F "$fn" >/dev/null 2>&1; then
            ( cd "$SOL_ROOT" && "$fn" "${rest[@]}" )
            return $?
        fi

        # Αν δεν υπάρχει η function, δείξε διαθέσιμες
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

    # 4. Δεν βρέθηκε τίποτα → native Bash
    if command -v "$name" >/dev/null 2>&1; then
        ( cd "$SOL_ROOT" && command "$name" "${rest[@]}" )
        return $?
    fi

    printf 'bash: %s: command not found (try: help)\n' "$name" >&2
    return 127
}