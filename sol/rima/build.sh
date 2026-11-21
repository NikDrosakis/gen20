#!/bin/bash
# rima/build.sh — yarn build για domain
# Source-only. Φορτώνεται από το gen.sh.

build() {
    local domain="${1:-}"
    if [[ -z $domain ]]; then
        printf 'Usage: build <domain>\n\nAvailable moons:\n' >&2
        find "$SOL_ROOT/moon" -mindepth 1 -maxdepth 1 -type d -printf '  %f\n' 2>/dev/null | sort >&2
        return 1
    fi

    domain="${domain#moon/}"
    local build_dir="$SOL_ROOT/moon/$domain"
    [[ -d $build_dir ]] || { printf '❌ not found: %s\n' "$build_dir" >&2; return 1; }

    # ASK TO MOON DOMAIN: πάρε maria (db) + status από gen_admin.domain (για το postbuild)
    local maria="" dstatus=""
    local env_file="$SOL_ROOT/.env"
    if [[ -f $env_file ]] && command -v mariadb >/dev/null 2>&1; then
        read -r maria dstatus < <(
            set -a; source "$env_file"; set +a
            mariadb -N -B -u"${DB_USER:-root}" -p"${DB_PASS:-}" -h"${DB_HOST:-localhost}" \
                -D "${DB_ADMIN:-gen_admin}" \
                -e "SELECT IFNULL(maria,''), status FROM domain WHERE name='$domain' LIMIT 1;" 2>/dev/null
        )
    fi
    [[ -n $maria && $maria != NULL ]] || maria="gen_${domain//[.-]/}"
    printf '📦 moon: %s | db: %s | status: %s\n' "$domain" "${maria:-?}" "${dstatus:-?}"

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

            # EXECUTE postbuild.sh (social share metadata + sitemap/feed/rss από content status=2)
            local postbuild="$SOL_ROOT/sol/acta/postbuild.sh"
            if [[ -x $postbuild ]]; then
                "$postbuild" "$domain" "$maria" || printf '⚠️ postbuild failed\n' >&2
            else
                printf '⚠️ postbuild.sh not found: %s\n' "$postbuild" >&2
            fi

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