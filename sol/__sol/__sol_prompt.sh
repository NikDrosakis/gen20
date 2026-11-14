    # --------------------------------------------------
    # Dynamic prompt — δείχνει το relative path
    # --------------------------------------------------
_sol_prompt() {
    local rel
    rel=$(realpath --relative-to="$SOL_ROOT" "$PWD" 2>/dev/null)

    if [[ -z $rel || $rel == "." ]]; then
        PS1='\[\e[1;31m\]gen>\[\e[0m\] '
    else
        PS1="\[\e[1;31m\]${rel} gen>\[\e[0m\] "
    fi
}