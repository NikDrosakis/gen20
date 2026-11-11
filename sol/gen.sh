#!/usr/bin/env bash
#
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

source "$SOL_DIR/__sol/__sol_dispatch.sh"
source "$SOL_DIR/__sol/__sol_complete.sh"

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

SOL_PROMPT='gen> '
declare -gA SOL_LOADED=()

# --------------------------------------------------
# PRESERVE NATIVE BASH ENVIRONMENT
# --------------------------------------------------

if [[ $- == *i* && -r ${HOME}/.bashrc ]]; then
    # shellcheck source=/dev/null
    source "${HOME}/.bashrc"
fi


# --------------------------------------------------
# ENTITY DISCOVERY
# Κανόνας: underscore = διαχωριστής λέξεων.
#   "astra migrate" -> astra_migrate
# Ψάχνουμε πρώτα ολόκληρο filename, μετά function μέσα στο <noun>.sh.
# --------------------------------------------------

__sol_search_dirs() {
    # Σειρά προτεραιότητας: actions -> systems -> opus
    printf '%s\n' \
        "$SOL_DIR/actions" \
        "$SOL_DIR/systems" \
        "$SOL_DIR/opus"
}

# Ψάχνει ένα filename <name>.sh σε actions/** , systems/** , opus/
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

        # Ένα επίπεδο βαθύτερα (π.χ. actions/astra/migrate.sh)
        while IFS= read -r -d '' file; do
            if [[ $(basename -- "$file") == "$name.sh" ]]; then
                printf '%s\n' "$file"
                return 0
            fi
        done < <(command find "$dir" -mindepth 2 -maxdepth 2 -type f -name "$name.sh" -print0 2>/dev/null)
    done < <(__sol_search_dirs)

    return 1
}

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

# Κανόνας 1: σκέτο "<noun>" -> <noun>.sh
__sol_find_noun() {
    local noun="${1:-}"
    __sol_entity_file "$noun"
}

# Φορτώνει expression file (μόνο functions) μία φορά.
__sol_load() {
    local file="${1:-}"

    [[ -n $file && -f $file ]] || return 1
    [[ -n ${SOL_LOADED[$file]+loaded} ]] && return 0

    # shellcheck source=/dev/null
    source "$file" || return 1

    SOL_LOADED[$file]=1
}

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
        [[ -f "$SOL_DIR/systems/gaia/index.php" ]] && printf 'gaia\n'
    } | sort -u
}

# Λίστα verbs ενός noun (functions <noun>_* μέσα στο <noun>.sh)
__sol_verbs() {
    local name="${1:-}"
    local file fn

    [[ -n $name ]] || return 0

    file=$(__sol_find_noun "$name") || return 0
    __sol_load "$file" || return 1

    while IFS= read -r fn; do
        printf '%s\n' "${fn#${name}_}"
    done < <(compgen -A function "${name}_" | sort -u)
}

# --------------------------------------------------
# HELP
# --------------------------------------------------

__sol_help() {
    cat <<'SOLHELP'
SOL language environment

  <system> esti [args...]      inspect a system
  <system> <verb> [args...]    execute a system expression
  <native Bash command>       execute Bash/Linux directly

Examples:

  god esti
  gaia esti
  moon esti
  preflight run
  preflight latest
  preflight history
  find . -type f -name '*.php' | grep api
  opus neo

Tab completes SOL expressions and falls back to native Bash completion.
Enter executes. Ctrl-D exits.

Native Bash syntax remains available.
SOLHELP
}
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