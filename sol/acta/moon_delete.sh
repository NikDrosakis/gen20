#!/bin/bash
# sol/acta/moon_delete.sh — διαγράφει ΟΛΟΚΛΗΡΩΤΙΚΑ ένα moon domain από τον κόσμο.
# Αφαιρεί: filesystem, database, nginx conf, DNS zone, tor hidden service,
#          gen_admin.domain entry, data/<domain>.
#
# Usage: moon_delete <domain>

moon_delete() {
    local domain="${1:-}"
    [[ -z $domain ]] && { printf 'Usage: moon_delete <domain>\n' >&2; return 1; }
    domain="${domain#moon/}"

    local REPO_ROOT="${SOL_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)}"
    local env_file="$REPO_ROOT/.env"
    if [[ -f $env_file ]]; then
        set -a
        # shellcheck source=/dev/null
        source "$env_file"
        set +a
    fi
    SOL_ROOT="$REPO_ROOT"

    local DB_USER="${DB_USER:-root}"
    local DB_PASS="${DB_PASS:-}"
    local DB_HOST="${DB_HOST:-localhost}"
    local DB_ADMIN="${DB_ADMIN:-gen_admin}"

    local is_tor=false
    [[ $domain == *.onion ]] && is_tor=true

    # 1. Filesystem
    if [[ -d "$SOL_ROOT/moon/$domain" ]]; then
        rm -rf "$SOL_ROOT/moon/$domain"
        printf '🗑️  filesystem: %s/moon/%s\n' "$SOL_ROOT" "$domain"
    fi

    # 2. Database (maria name από gen_admin.domain, fallback στο όνομα)
    local maria=""
    if command -v mariadb >/dev/null 2>&1; then
        maria=$(mariadb -N -B -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D "$DB_ADMIN" \
            -e "SELECT IFNULL(maria,'') FROM domain WHERE name='$domain' LIMIT 1;" 2>/dev/null)
    fi
    [[ -n $maria && $maria != NULL ]] || maria="gen_${domain//[.-]/}"
    if command -v mariadb >/dev/null 2>&1; then
        mariadb -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" \
            -e "DROP DATABASE IF EXISTS \`$maria\`;" 2>/dev/null
        printf '🗄️  database: %s\n' "$maria"
    fi

    # 3. Nginx conf
    if [[ -f "/etc/nginx/conf.d/$domain.conf" ]]; then
        rm -f "/etc/nginx/conf.d/$domain.conf"
        printf '⚙️  nginx: /etc/nginx/conf.d/%s.conf\n' "$domain"
    fi

    # 4. DNS zone (μόνο public/internal)
    if [[ $is_tor == false && $domain != localhost* ]]; then
        if [[ -f "/etc/bind/zones/db.$domain" ]]; then
            rm -f "/etc/bind/zones/db.$domain"
            printf '🌍 dns zone: db.%s\n' "$domain"
        fi
        # αφαίρεση block από named.conf.remote
        if [[ -f /etc/bind/named.conf.remote ]]; then
            sed -i "/zone \"$domain\"/,/};/d" /etc/bind/named.conf.remote 2>/dev/null
        fi
    fi

    # 5. Tor hidden service (βρες το dir από το hostname)
    if [[ $is_tor == true ]]; then
        local svc_dir=""
        local d
        for d in /var/lib/tor/hidden_service_*; do
            [[ -d $d && -f "$d/hostname" ]] || continue
            if [[ "$(tr -d '\n\r' < "$d/hostname")" == "$domain" ]]; then
                svc_dir="$d"
                break
            fi
        done
        if [[ -n $svc_dir ]]; then
            # αφαίρεση των γραμμών HiddenServiceDir/HiddenServicePort για αυτό το dir
            sed -i "\|$(basename "$svc_dir")|d" /etc/tor/torrc 2>/dev/null
            rm -rf "$svc_dir"
            printf '🔒 tor: %s\n' "$svc_dir"
            systemctl reload tor 2>/dev/null
        fi
    fi

    # 6. gen_admin.domain entry
    if command -v mariadb >/dev/null 2>&1; then
        mariadb -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -D "$DB_ADMIN" \
            -e "DELETE FROM domain WHERE name='$domain';" 2>/dev/null
        printf '📝 db entry removed\n'
    fi

    # 7. Data files
    if [[ -d "$REPO_ROOT/data/$domain" ]]; then
        rm -rf "$REPO_ROOT/data/$domain"
        printf '📦 data: data/%s\n' "$domain"
    fi

    # 8. Reload nginx
    if nginx -t >/dev/null 2>&1; then
        systemctl reload nginx 2>/dev/null
    fi

    printf '✅ moon_delete: %s\n' "$domain"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    moon_delete "$@"
fi
