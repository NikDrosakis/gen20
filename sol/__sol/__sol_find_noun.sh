
# Κανόνας 1: σκέτο "<noun>" -> <noun>.sh
__sol_find_noun() {
    local noun="${1:-}"
    __sol_entity_file "$noun"
}
