
# Κανόνας 3+4: "<noun> <verb>" -> <noun>_<verb>.sh  ή  <noun>.sh::<noun>_<verb>
# Επιστρέφει "file<TAB>mode<TAB>function"
#   mode = script   -> εκτέλεση ως subprocess
#   mode = function -> source + κάλεσμα function
__sol_find_expression() {
    local noun="${1:-}"
    local verb="${2:-}"
    local full file

    [[ -n $noun && -n $verb ]] || return 1

    full="${noun}_${verb}"

    # 1) Ολόκληρο filename: astra_migrate.sh
    if file=$(__sol_entity_file "$full"); then
        printf '%s\tscript\t\n' "$file"
        return 0
    fi

    # 2) Function μέσα στο <noun>.sh
    if file=$(__sol_entity_file "$noun"); then
        printf '%s\tfunction\t%s\n' "$file" "$full"
        return 0
    fi

    return 1
}
