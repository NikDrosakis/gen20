
# --------------------------------------------------
# ENTITY DISCOVERY
# Κανόνας: underscore = διαχωριστής λέξεων.
#   "astra migrate" -> astra_migrate
# Ψάχνουμε πρώτα ολόκληρο filename, μετά function μέσα στο <noun>.sh.
# --------------------------------------------------

__sol_search_dirs() {
    printf '%s\n' \
        "$SOL_ROOT/acta" \
        "$SOL_ROOT/systems" \
        "$SOL_ROOT/rima" \
        "$SOL_ROOT/prothesis" \
        "$SOL_DIR/acta" \
        "$SOL_DIR/systems" \
        "$SOL_DIR/rima" \
        "$SOL_DIR/prothesis"
}
