#!/usr/bin/env bash

# SOL INTERFACE
# Interactive command environment

SOL_UI_HISTORY=()
SOL_UI_HISTORY_INDEX=0
SOL_UI_RUNNING=1

# --------------------------------------------------
# COLORS
# --------------------------------------------------

SOL_C_RESET='\033[0m'
SOL_C_RED='\033[1;31m'
SOL_C_DIM='\033[2m'
SOL_C_WHITE='\033[1;37m'
SOL_C_GREEN='\033[1;32m'
SOL_C_YELLOW='\033[1;33m'
SOL_C_CYAN='\033[1;36m'

# --------------------------------------------------
# DISPLAY
# --------------------------------------------------

sol_ui_header() {
    printf '\033[2J\033[H'
    printf "${SOL_C_RED}"
    printf '  ███████╗ ██████╗ ██╗     \n'
    printf '  ██╔════╝██╔═══██╗██║     \n'
    printf '  ███████╗██║   ██║██║     \n'
    printf '  ╚════██║██║   ██║██║     \n'
    printf '  ███████║╚██████╔╝███████╗\n'
    printf '  ╚══════╝ ╚═════╝ ╚══════╝\n'
    printf "${SOL_C_RESET}\n"
    printf "${SOL_C_DIM}  GEN20 COMMAND ENVIRONMENT${SOL_C_RESET}\n"
    printf '\n'
}

sol_ui_systems() {
    local entity

    printf "${SOL_C_CYAN}SYSTEMS${SOL_C_RESET}\n"

    while IFS= read -r entity; do
        [[ -z "$entity" ]] && continue
        printf '  %-18s\n' "$entity"
    done < <(__sol_entities)
}

sol_ui_help() {
    printf '\n'
    printf "${SOL_C_WHITE}COMMANDS${SOL_C_RESET}\n"
    printf '  help                 Show help\n'
    printf '  systems              List systems\n'
    printf '  clear                Clear screen\n'
    printf '  exit                 Leave SOL\n'
    printf '\n'
    printf '  system               Show system expressions\n'
    printf '  system expression    Execute expression\n'
    printf '\n'
}

# --------------------------------------------------
# EXPRESSION DISCOVERY
# --------------------------------------------------

sol_ui_expressions() {
    local system="$1"
    local verb

    printf '\n'
    # Διόρθωση: έκλεινε με μονό αντί για διπλό εισαγωγικό
    printf "${SOL_C_CYAN}%s EXPRESSIONS${SOL_C_RESET}\n" "$system"

    while IFS= read -r verb; do
        [[ -z "$verb" ]] && continue
        printf '  %s\n' "$verb"
    done < <(__sol_verbs "$system")

    printf '\n'
}

sol_ui_expression_exists() {
    local system="$1"
    local verb="$2"

    declare -F "${system}_${verb}" >/dev/null 2>&1
}

# --------------------------------------------------
# CREATE EXPRESSION
# --------------------------------------------------

sol_ui_create_expression() {
    local system="$1"
    local verb="$2"
    local file
    local function_name
    local temp_file
    local answer
    local editor

    [[ -z "$system" || -z "$verb" ]] && return 1

    if [[ ! "$system" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
        printf "${SOL_C_RED}Invalid system name.${SOL_C_RESET}\n"
        return 1
    fi

    if [[ ! "$verb" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
        printf "${SOL_C_RED}Invalid expression name.${SOL_C_RESET}\n"
        return 1
    fi

    file="$(__sol_entity_file "$system")"

    if [[ -z "$file" || ! -f "$file" ]]; then
        # Διόρθωση: έκλεινε με μονό αντί για διπλό εισαγωγικό
        printf "${SOL_C_RED}System file not found: %s${SOL_C_RESET}\n" "$system"
        return 1
    fi

    function_name="${system}_${verb}"

    if declare -F "$function_name" >/dev/null 2>&1; then
        printf "${SOL_C_YELLOW}Expression already exists.${SOL_C_RESET}\n"
        return 1
    fi

    printf '\n'
    printf "${SOL_C_YELLOW}Expression '%s %s' does not exist.${SOL_C_RESET}\n" "$system" "$verb"
    printf 'Create it now? [y/N] '

    read -r answer

    [[ "$answer" =~ ^[Yy]$ ]] || return 0

    temp_file="$(mktemp)" || return 1

    # Διόρθωση: Καθαρό heredoc χωρίς διπλά backslashes που χαλάνε το output
    cat > "$temp_file" <<EOF
${function_name}() {
    # TODO: Implement ${system} ${verb}

    printf '%s\n' '${system} ${verb}: not implemented'
}
EOF

    editor="${EDITOR:-nano}"

    "$editor" "$temp_file"

    if ! grep -Eq "^${function_name}[[:space:]]*\\(\\)" "$temp_file"; then
        printf "${SOL_C_RED}Function definition missing. Nothing saved.${SOL_C_RESET}\n"
        rm -f "$temp_file"
        return 1
    fi

    {
        printf '\n'
        cat "$temp_file"
        printf '\n'
    } >> "$file"

    rm -f "$temp_file"

    source "$file"

    if declare -F "$function_name" >/dev/null 2>&1; then
        printf "${SOL_C_GREEN}Created: %s %s${SOL_C_RESET}\n" "$system" "$verb"
    else
        printf "${SOL_C_RED}Expression could not be loaded.${SOL_C_RESET}\n"
        return 1
    fi
}

# --------------------------------------------------
# COMMAND EXECUTION
# --------------------------------------------------

sol_ui_execute() {
    local line="$1"
    local system
    local verb
    local rest
    local file

    [[ -z "$line" ]] && return 0

    case "$line" in
        exit|quit)
            SOL_UI_RUNNING=0
            return 0
            ;;
        help)
            sol_ui_help
            return 0
            ;;
        systems)
            sol_ui_systems
            return 0
            ;;
        clear)
            sol_ui_header
            return 0
            ;;
    esac

    read -r system verb rest <<< "$line"

    if [[ -z "$system" ]]; then
        return 0
    fi

    if declare -F "__sol_entity_file" >/dev/null 2>&1; then
        file="$(__sol_entity_file "$system")"

        if [[ -n "$file" && -f "$file" ]]; then

            if [[ -z "$verb" ]]; then
                sol_ui_expressions "$system"
                return 0
            fi

            if sol_ui_expression_exists "$system" "$verb"; then
                __sol_dispatch "$line"
                return $?
            fi

            sol_ui_create_expression "$system" "$verb"
            return $?
        fi
    fi

    if declare -F sol_dispatch_line >/dev/null 2>&1; then
        sol_dispatch_line "$line"
    else
        eval -- "$line"
    fi
}

# --------------------------------------------------
# HISTORY
# --------------------------------------------------

sol_ui_history_add() {
    local line="$1"

    [[ -z "$line" ]] && return

    SOL_UI_HISTORY+=("$line")
    SOL_UI_HISTORY_INDEX=${#SOL_UI_HISTORY[@]}
}

# --------------------------------------------------
# PROMPT
# --------------------------------------------------

sol_ui_prompt() {
    local line

    while (( SOL_UI_RUNNING )); do
        printf '\n'
        printf "${SOL_C_RED}gen>${SOL_C_RESET} "

        if ! IFS= read -e -r line; then
            break
        fi

        [[ -z "$line" ]] && continue

        sol_ui_history_add "$line"
        sol_ui_execute "$line"
    done
}

# --------------------------------------------------
# START
# --------------------------------------------------

sol_interface() {
    sol_ui_header
    sol_ui_systems
    sol_ui_help
    sol_ui_prompt
}