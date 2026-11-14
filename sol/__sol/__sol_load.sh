
# Φορτώνει expression file (μόνο functions) μία φορά.
__sol_load() {
    local file="${1:-}"

    [[ -n $file && -f $file ]] || return 1
    [[ -n ${SOL_LOADED[$file]+loaded} ]] && return 0

    # shellcheck source=/dev/null
    source "$file" || return 1

    SOL_LOADED[$file]=1
}
