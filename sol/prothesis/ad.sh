#!/bin/bash
# ad — jump στο πρώτο folder με το όνομα ή path
# Source-only. Φορτώνεται από το gen.sh.

ad() {
    local target="${1:-}"
    [[ -n $target ]] || { echo "Usage: ad <name|path>"; return 1; }

    # Αν είναι path (έχει /) → δοκίμασε ως path κάτω από SOL_ROOT
    if [[ "$target" == */* ]]; then
        local path="$SOL_ROOT/$target"
        if [[ -d $path ]]; then
            cd "$path" && pwd
            return 0
        fi
        # Δοκίμασε ως path κάτω από το τρέχον
        if [[ -d "$PWD/$target" ]]; then
            cd "$PWD/$target" && pwd
            return 0
        fi
        echo "❌ ad: not found: $target" >&2
        return 1
    fi

    # Αλλιώς ψάξε folder με το όνομα
    local found
    found=$(find "$SOL_ROOT" -type d -name "$target" -print -quit 2>/dev/null)

    if [[ -z $found ]]; then
        echo "❌ ad: not found: $target" >&2
        return 1
    fi

    cd "$found" && pwd
}