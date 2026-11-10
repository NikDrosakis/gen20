#!/usr/bin/env bash
# SOL — SOL language and command surface.
# Source-only. TUI is owned by ../interface.sh.

sol_about() {
    printf '%s\n' 'SOL | language, command surface, navigation and orchestration'
}

sol_status() {
    local count
    # Διόρθωση: Το tr -d ' ' ήθελε σωστό κλείσιμο και εισαγωγικά
    count=$(__sol_entities 2>/dev/null | wc -l | tr -d ' ')
    printf 'SOL %s | Bash %s | systems %s\n' \
        "${SOL_VERSION:-dev}" "$BASH_VERSION" \
        "${count:-0}"
    printf 'root: %s\n' "${SOL_ROOT:-unknown}"
}

sol_subject_menu() {
    local name about file
    printf '%-12s %s\n' SYSTEM SUBJECT
    while IFS= read -r name; do
        [[ -n $name ]] || continue
        about=""
        file=$(__sol_entity_file "$name" 2>/dev/null) || continue
        __sol_load "$file" || continue
        if declare -F "${name}_about" >/dev/null; then
            about=$("${name}_about" 2>/dev/null)
        fi
        printf '%-12s %s\n' "$name" "${about:-GEN20 system expression}"
    done < <(__sol_entities | sort -u)
}

subject_menu() {
    sol_subject_menu
}

sol_command_index() {
    local name file verb
    printf '%-18s %-24s %s\n' SYSTEM EXPRESSION DESCRIPTION
    printf '%s\n' '----------------------------------------------------------------'
    while IFS= read -r name; do
        [[ -n $name ]] || continue
        file=$(__sol_entity_file "$name" 2>/dev/null) || continue
        __sol_load "$file" || continue
        while IFS= read -r verb; do
            [[ -n $verb ]] || continue
            printf '%-18s %-24s %s\n' "$name" "$verb" "$name $verb"
        done < <(__sol_verbs "$name" | sort -u)
    done < <(__sol_entities | sort -u)
}

sol_help() {
    # Αλλαγή σε printf για να αποφύγουμε θέματα με heredocs και formatting
    printf '%s\n' \
        'SOL — GEN20 LANGUAGE ENVIRONMENT' \
        '' \
        'COMMANDS' \
        '  exit, quit       Leave SOL' \
        '  help             Show this help' \
        '  subject_menu     Show system glossary' \
        '  version          Show SOL version' \
        '' \
        'GRAMMAR' \
        '  <system> esti [args...]' \
        '  <system> <verb> [args...]' \
        '' \
        'NATIVE BASH' \
        '  Commands, pipes, redirects, variables, loops and functions.' \
        '' \
        'COMMAND INDEX' \
        '  Run: command_index'
}

command_index() {
    sol_command_index
}

sol_dispatch_line() {
    local line=$1
    local first

    [[ -n ${line//[[:space:]]/} ]] || return 0

    read -r first _ <<< "$line"

    case "$first" in
        exit|quit)
            return 99
            ;;
    esac

    # Let Bash handle parsing, quoting, pipes and redirects.
    # command_not_found_handle dispatches SOL systems.
    eval -- "$line"
}

sol_esti() {
    local entities
    entities=$(__sol_entities | paste -sd ' ' -)
    printf 'SOL %s\n' "${SOL_VERSION:-dev}"
    printf 'root: %s\n' "${SOL_ROOT:-unknown}"
    printf 'expressions: %s\n' "${entities:-none}"
    printf 'bash: %s\n' "$BASH_VERSION"
}