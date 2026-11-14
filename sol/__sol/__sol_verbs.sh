# Λίστα verbs ενός noun (functions <noun>_* μέσα στο <noun>.sh)
__sol_verbs() {
    local name="${1:-}"
    local file fn

    [[ -n $name ]] || return 0

    file=$(__sol_find_noun "$name") || return 0
    __sol_load "$file" || return 1

    while IFS= read -r fn; do
        printf '%s\n' "${fn#${name}_}"
    done < <(compgen -A function "${name}_" | sort -u)
}