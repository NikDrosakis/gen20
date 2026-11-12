# --------------------------------------------------
# COMPLETION (Rule 9: TAB → επιλογές από κάτω)
# --------------------------------------------------

_sol_complete() {
    local cur="" name="" words="" verbs="" noun_verb=""

    COMPREPLY=()

    [[ ${COMP_WORDS+x} && ${COMP_CWORD+x} ]] || return 0
    ((${#COMP_WORDS[@]} > 0)) || return 0
    ((COMP_CWORD >= 0 && COMP_CWORD < ${#COMP_WORDS[@]})) || return 0

    cur="${COMP_WORDS[COMP_CWORD]}"

    # Πρώτη λέξη: nouns + ειδικά
    if ((COMP_CWORD == 0)); then
        words="$(__sol_entities) help version opus"
        mapfile -t COMPREPLY < <(compgen -W "$words" -- "$cur")
        return 0
    fi

    name="${COMP_WORDS[0]}"

    # Ειδικά
    case "$name" in
        opus)
            mapfile -t COMPREPLY < <(compgen -W 'esti neo sose' -- "$cur")
            return 0
            ;;
        gaia)
            mapfile -t COMPREPLY < <(compgen -W 'esti' -- "$cur")
            return 0
            ;;
    esac

    # Δεύτερη λέξη: verbs από functions + <noun>_*.sh
    verbs="$(__sol_verbs "$name")"

    # Προσθήκη verbs από <noun>_*.sh στο actions/ και systems/
    while IFS= read -r dir; do
        [[ -d $dir ]] || continue
        while IFS= read -r -d '' f; do
            local base
            base=$(basename -- "$f" .sh)
            if [[ $base == "${name}_"* ]]; then
                printf '%s\n' "${base#${name}_}"
            fi
        done < <(command find "$dir" -maxdepth 2 -type f -name "${name}_*.sh" -print0 2>/dev/null)
    done < <(__sol_search_dirs) >> <(cat)

    # Ξαναμαζεύουμε (verbs + .sh verbs)
    local all_verbs
    all_verbs=$(
        __sol_verbs "$name"
        while IFS= read -r dir; do
            [[ -d $dir ]] || continue
            while IFS= read -r -d '' f; do
                local base
                base=$(basename -- "$f" .sh)
                if [[ $base == "${name}_"* ]]; then
                    printf '%s\n' "${base#${name}_}"
                fi
            done < <(command find "$dir" -maxdepth 2 -type f -name "${name}_*.sh" -print0 2>/dev/null)
        done < <(__sol_search_dirs)
    )

    mapfile -t COMPREPLY < <(compgen -W "$all_verbs" -- "$cur")
    return 0
}