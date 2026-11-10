#!/usr/bin/env bash
# SOL banner — GEN20 identity.
# Source-safe: defines show_banner() and performs no output on load.

SOL_BANNER_RED='\033[1;31m'
SOL_BANNER_RESET='\033[0m'

show_banner() {
    printf '%b' "$SOL_BANNER_RED"
    printf '%s\n' \
        '        #####   #####  ' \
        '       ##   ## ##   ## ' \
        '            ## ##   ## ' \
        '           ##  ##   ## ' \
        '          ##   ##   ## ' \
        '         ##    ##   ## ' \
        '        ######  #####  ' \
        '' \
        '  ####   ######  ##   ## ' \
        ' ##  ##  ##      ###  ## ' \
        ' ##      #####   #### ## ' \
        ' ## ###  ##      ## #### ' \
        ' ##  ##  ##      ##  ### ' \
        '  ####   ######  ##   ## '
    printf '%b\n' "$SOL_BANNER_RESET"
}
