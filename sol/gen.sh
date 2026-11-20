#!/usr/bin/env bash
#sol/gen.sh
# SOL - GEN20 language environment.
# Native interactive Bash is the execution shell.
# SOL adds domain expressions.


if [[ ${SOL_ENGINE:-0} != 1 ]]; then
    export SOL_ENGINE=1

    if (($#)); then
        exec bash "$0" "$@"
    fi

    exec bash --noprofile --rcfile "$0" -i
fi

unset SOL_ENGINE

# Λύνει symlinks του ίδιου του gen.sh (όχι μόνο του directory)
SOL_SOURCE="${BASH_SOURCE[0]}"
while [[ -L $SOL_SOURCE ]]; do
    SOL_TARGET=$(readlink -- "$SOL_SOURCE")
    if [[ $SOL_TARGET == /* ]]; then
        SOL_SOURCE="$SOL_TARGET"
    else
        SOL_SOURCE="$(dirname -- "$SOL_SOURCE")/$SOL_TARGET"
    fi
done
SOL_DIR=$(cd -- "$(dirname -- "$SOL_SOURCE")" && pwd -P)
SOL_ROOT=$(cd -- "$SOL_DIR/.." && pwd -P)
unset SOL_SOURCE SOL_TARGET
SOL_VERSION="0.1.0"

# Φόρτωση ΟΛΩΝ των __sol_*.sh
for f in "$SOL_DIR"/__sol/__sol_*.sh; do
    [[ -r "$f" ]] && source "$f"
done

# Φόρτωση prothesis
if [[ -d "$SOL_DIR/prothesis" ]]; then
    for f in "$SOL_DIR/prothesis"/*.sh; do
        [[ -r $f ]] && source "$f"
    done
fi

# Φόρτωση rima
if [[ -d "$SOL_DIR/rima" ]]; then
    for f in "$SOL_DIR/rima"/*.sh; do
        [[ -r $f ]] && source "$f"
    done
fi

# ΣΗΜΕΙΩΣΗ: ΔΕΝ κάνουμε source το acta/* εδώ.
# Το acta/ περιέχει αυτόνομα scripts (π.χ. astra_clean.sh) με top-level κώδικα
# που τρέχει κατα το source (και κάνει exit 1) — σκοτώνοντας το interactive shell.
# Τα acta φορτώνονται on-demand από τον __sol_dispatch (script/function mode).
# --------------------------------------------------
# GEN20 CENTRAL LOG
# --------------------------------------------------

export GEN_LOG_FILE="${GEN_LOG_FILE:-${SOL_ROOT}/data/gen20.net/gen.txt}"
export GEN_LOG_DIR
GEN_LOG_DIR=$(dirname -- "$GEN_LOG_FILE")

if ! mkdir -p -- "$GEN_LOG_DIR"; then
    printf 'SOL: cannot create log directory: %s\n' "$GEN_LOG_DIR" >&2
fi

log_action() {
    local msg="${1:-}"
    local src="${BASH_SOURCE[1]:-${BASH_SOURCE[0]}}"
    local line="${BASH_LINENO[0]:-0}"
    local file timestamp entry

    file=$(basename -- "$src")
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    entry="[$timestamp] [$file:$line] $msg"

    if ! printf '%s\n' "$entry" >> "$GEN_LOG_FILE"; then
        printf 'SOL: cannot write central log: %s\n' "$GEN_LOG_FILE" >&2
        return 1
    fi

    printf '%s\n' "$entry"
}

SOL_PROMPT='\[\e[1;31m\]gen>\[\e[0m\] '
declare -gA SOL_LOADED=()

# --------------------------------------------------
# PRESERVE NATIVE BASH ENVIRONMENT
# --------------------------------------------------

if [[ $- == *i* && -r ${HOME}/.bashrc ]]; then
    # shellcheck source=/dev/null
    source "${HOME}/.bashrc"
fi

help() { __sol_help; }
# --------------------------------------------------
# NATIVE BASH FALLBACK
# --------------------------------------------------

command_not_found_handle() {
    local name="${1:-}"
    shift || true

    if ! declare -F __sol_dispatch >/dev/null || [[ -n ${__SOL_IN_HANDLER:-} ]]; then
        printf '%s: command not found\n' "$name" >&2
        return 127
    fi

    local __SOL_IN_HANDLER=1
    __sol_dispatch "$name" "$@"
}

# --------------------------------------------------
# HISTORY AND PROMPT
# --------------------------------------------------

HISTFILE="${GEN_HISTORY:-${HOME}/.gen_history}"
HISTSIZE=5000
HISTFILESIZE=10000
HISTCONTROL=ignoredups:erasedups

shopt -s histappend
set -o history

export LS_COLORS="${LS_COLORS:-}di=1;36:ln=1;35:ex=1;32:"
PS1="$SOL_PROMPT"

# --------------------------------------------------
# INTERACTIVE MODE
# --------------------------------------------------

if [[ $- == *i* ]]; then
    if [[ -r "$SOL_DIR/banner.sh" ]]; then
        # shellcheck source=/dev/null
        source "$SOL_DIR/banner.sh"
        show_banner
    fi

 # cd στο SOL_ROOT — τελευταίο, μετά από όλα τα source
    cd "$SOL_ROOT" || {
        printf 'SOL: cannot cd to SOL_ROOT: %s\n' "$SOL_ROOT" >&2
        exit 1
    }


    PROMPT_COMMAND="_sol_prompt"
    # --------------------------------------------------
    # Aliases για γρήγορη πλοήγηση
    # (cd, ls είναι κρατημένα — δεν τα αγγίζουμε)
    # --------------------------------------------------

    printf 'SOL %s | GEN20 language environment\n' "$SOL_VERSION"
    printf 'Type help for expressions. Native Bash is available.\n'

    return 0 2>/dev/null || exit 0
fi


# --------------------------------------------------
# SCRIPT / COMMAND MODE
# --------------------------------------------------

if (($#)); then
    if [[ $1 == -c || $1 == --command ]]; then
        shift
        eval "$*"
        exit $?
    fi

    __sol_dispatch "$@"
    exit $?
fi