
# Ψάχνει ένα filename <name>.sh σε acta/** , systems/** , opus/
__sol_entity_file() {
    local name="${1:-}"
    local dir file

    [[ -n $name ]] || return 1

    while IFS= read -r dir; do
        [[ -d $dir ]] || continue

        # Άμεσα μέσα στον φάκελο
        file="$dir/$name.sh"
        if [[ -f $file ]]; then
            printf '%s\n' "$file"
            return 0
        fi

        # Ένα επίπεδο βαθύτερα (π.χ. acta/astra/migrate.sh)
        while IFS= read -r -d '' file; do
            if [[ $(basename -- "$file") == "$name.sh" ]]; then
                printf '%s\n' "$file"
                return 0
            fi
        done < <(command find "$dir" -mindepth 2 -maxdepth 2 -type f -name "$name.sh" -print0 2>/dev/null)
    done < <(__sol_search_dirs)

    return 1
}
