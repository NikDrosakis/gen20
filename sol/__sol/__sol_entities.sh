
# Λίστα όλων των entities (για completion / help)
__sol_entities() {
    {
        local dir file
        while IFS= read -r dir; do
            [[ -d $dir ]] || continue
            while IFS= read -r -d '' file; do
                basename -- "$file" .sh
            done < <(command find "$dir" -type f -name '*.sh' -print0 2>/dev/null)
        done < <(__sol_search_dirs)
        [[ -f "$SOL_ROOT/gaia/sol/index.php" ]] && printf 'gaia\n'
    } | sort -u
}

