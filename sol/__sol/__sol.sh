#!/usr/bin/env bash
# /var/www/gs/sol/__sol/__sol.sh
# Entry point: φορτώνει όλα τα __sol_*.sh με σωστή σειρά.

set -u
set -o pipefail

: "${SOL_ROOT:=/var/www/gs/sol}"
: "${ROOT:=$(dirname "$SOL_ROOT")}"

__SOL_DIR="$SOL_ROOT/__sol"

# Σειρά: πρώτα τα low-level, μετά resolver, μετά dispatch/complete/help/prompt
for f in \
    __sol_load \
    __sol_entity_file \
    __sol_search_dirs \
    __sol_entities \
    __sol_verbs \
    __sol_find_expression \
    __sol_find_noun \
    __sol_dispatch \
    __sol_complete \
    __sol_help \
    __sol_prompt
do
    [[ -r "$__SOL_DIR/$f.sh" ]] && source "$__SOL_DIR/$f.sh"
done

unset __SOL_DIR
