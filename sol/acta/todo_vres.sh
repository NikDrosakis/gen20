#!/bin/bash
# todo.sh — βρες όλα τα TODO/FIXME/XXX/HACK σε όλο το σύστημα

# Ψάξε από το SOL_ROOT (η μητέρα του ήλιου), όχι μόνο actions/systems
grep -rn --color=auto \
    -E "TODO|FIXME|HACK" \
    "$SOL_ROOT" \
    --include='*.sh' \
    --include='*.php' \
    --include='*.js' \
    --include='*.jsx' \
    --include='*.ts' \
    --include='*.tsx' \
    --include='*.json' \
    --include='*.md' \
    --include='*.txt' \
    --include='*.css' \
    --include='*.html' \
    2>/dev/null | grep -v '/node_modules/' | grep -v '/old/' | grep -v '/vendor/'