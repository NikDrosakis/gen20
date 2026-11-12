#!/usr/bin/env bash
# __sol_dispatch.sh
#
# Ο καρδιακός κόμβος της γλώσσας.
# Δεν ξέρει τίποτα ειδικό. Μόνο:
#
#   1. <noun> <rima>   →  <noun>_<rima>.sh          (script mode)
#   2. <noun> <rima>   →  <noun>.sh::<noun>_<rima>  (function mode)
#   3. <noun> [args]   →  <noun>.sh + args          (script mode)
#   4. native Bash     (command)
#   5. not found
#
# Όλα τα υπόλοιπα (gaia, opus, help, version) είναι πλέον
# κανονικά acta/ ή systems/ — δεν ανήκουν εδώ.

__sol_dispatch() {
    (($#)) || return 0

    local name="$1"
    local rima=""
    local rest=()
    local file mode fn candidate found=0

    shift

    # --------------------------------------------------
    # 1. <noun> <rima> → script ή function
    # --------------------------------------------------
    if (($#)); then
        rima="$1"

        if IFS=$'\t' read -r file mode fn < <(__sol_find_expression "$name" "$rima"); then
            shift
            rest=("$@")
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
    # 2. <noun> [args] → <noun>.sh + args
    #    ΑΛΛΑ: αν υπάρχουν rimata <noun>_* → δείξε τα
    # --------------------------------------------------
    if file=$(__sol_find_noun "$name"); then
        __sol_load "$file" || return 1

        # Έλεγχος: function <name>() υπάρχει;
        if declare -F "$name" >/dev/null 2>&1; then
            ( cd "$SOL_ROOT" && "$name" "$@" )
            return $?
        fi

        # Έλεγχος: rimata <name>_*
        local rimata=()
        while IFS= read -r candidate; do
            [[ -n $candidate ]] && rimata+=("$candidate")
        done < <(__sol_verbs "$name")

        if ((${#rimata[@]} > 0)); then
            printf 'SOL: %s is not a rima.\n' "$name" >&2
            printf 'Available rimata for %s:\n' "$name" >&2
            printf '  %s\n' "${rimata[@]}" >&2
            printf '\nUsage: %s <rima> [args...]\n' "$name" >&2
            return 2
        fi

        # Script mode
        ( cd "$SOL_ROOT" && bash "$file" "$@" )
        return $?
    fi
    # --------------------------------------------------
    # 3. Native Bash
    # --------------------------------------------------
    if command -v "$name" >/dev/null 2>&1; then
        ( cd "$SOL_ROOT" && command "$name" "$@" )
        return $?
    fi

    # --------------------------------------------------
    # 4. Not found
    # --------------------------------------------------
    printf 'bash: %s: command not found (try: help)\n' "$name" >&2
    return 127
}