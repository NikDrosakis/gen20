#!/bin/bash
# rima/build.sh — yarn build για domain
# Source-only. Φορτώνεται από το gen.sh.

build() {
    local domain="${1:-}"
    [[ -z $domain ]] && { printf 'Usage: build <domain>\n' >&2; return 1; }

    domain="${domain#moon/}"
    local build_dir="$SOL_ROOT/moon/$domain"
    [[ -d $build_dir ]] || { printf '❌ not found: %s\n' "$build_dir" >&2; return 1; }

    cd "$build_dir" || return 1

    local attempt=0
    local max_attempts=2

    while (( attempt < max_attempts )); do
        attempt=$((attempt + 1))

        local tmp
        tmp=$(mktemp)

        printf '🔨 build attempt %d/%d\n' "$attempt" "$max_attempts"

        yarn build 2>&1 | tee "$tmp"
        local rc=${PIPESTATUS[0]}

        if [[ $rc -eq 0 ]]; then
            printf '✅ build OK\n'
            rm -f "$tmp"
            return 0
        fi

        printf '\n❌ build failed (attempt %d)\n\n' "$attempt"

        # Parse errors (χωρίς -P)
        local pkgs
        pkgs=$(awk '/Required package:/ {print $3}' "$tmp" | sort -u)

        local mods
        mods=$(awk "/Could not resolve '/ {gsub(/.*Could not resolve '/, \"\"); gsub(/'.*/, \"\"); print}" "$tmp" | sort -u)

        if [[ -n $pkgs ]]; then
            printf '📦 Missing packages:\n'
            printf '  %s\n' $pkgs
        fi

        if [[ -n $mods ]]; then
            printf '📄 Missing modules:\n'
            printf '  %s\n' $mods
        fi

        rm -f "$tmp"

        # 1η προσπάθεια + λείπουν packages → yarn add
        if [[ $attempt -eq 1 && -n $pkgs ]]; then
            printf '\n📥 yarn add %s\n' "$(echo "$pkgs" | tr '\n' ' ')"
            yarn add $pkgs || {
                printf '❌ yarn add failed\n' >&2
                return 1
            }
            printf '✅ packages added — retrying build\n\n'
            continue
        fi

        break
    done

    printf '❌ build failed after %d attempts\n' "$attempt"
    return 1
}