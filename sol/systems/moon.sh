#!/bin/bash
# MOON — domain, localhost and tor management
# Source-only. Όλες οι εκφράσεις είναι functions: moon_<verb>.
# Standalone: bash moon.sh <verb> [args...]
# SOL:        gen moon <verb> [args...]

# --------------------------------------------------
# Load .env
# --------------------------------------------------

MOON_ENV="${MOON_ENV:-$SOL_ROOT/.env}"
if [[ -f $MOON_ENV ]]; then
    set -a
    # shellcheck source=/dev/null
    source "$MOON_ENV"
    set +a
fi

# --------------------------------------------------
# Paths (defaults αν δεν υπάρχουν στο .env)
# --------------------------------------------------

MOON_ROOT="${MOON_ROOT:-${SOL_ROOT:-/var/www/gs}/moon}"
MOON_LOG="${MOON_LOG:-${SOL_ROOT:-/var/www/gs}/data/gen20.net/moon.txt}"

MOON_TEMPLATE_DIR="${MOON_TEMPLATE_DIR:-$MOON_ROOT/admin/templates}"
MOON_DEFAULT_TEMPLATE="${MOON_DEFAULT_TEMPLATE:-default}"

MOON_NGINX_DIR="${MOON_NGINX_DIR:-/etc/nginx/conf.d}"
MOON_NGINX_SHARED="${MOON_NGINX_SHARED:-${SOL_ROOT:-/var/www/gs}/astra/aether.conf}"
MOON_NGINX_LOG_DIR="${MOON_NGINX_LOG_DIR:-/var/log/nginx}"

MOON_BIND_ZONES="${MOON_BIND_ZONES:-/etc/bind/zones}"
MOON_BIND_CONF="${MOON_BIND_CONF:-/etc/bind/named.conf.remote}"

MOON_DB_NAME_PREFIX="${MOON_DB_NAME_PREFIX:-gen_}"
MOON_TEMPLATE_SQL="${MOON_TEMPLATE_SQL:-${SOL_ROOT:-/var/www/gs}/astra/template.sql}"

MOON_TOR_DIR="${MOON_TOR_DIR:-/var/lib/tor}"
MOON_TORRC="${MOON_TORRC:-/etc/tor/torrc}"

mkdir -p "$(dirname "$MOON_LOG")"

# --------------------------------------------------
# Logging
# --------------------------------------------------

moon_log() {
    local level="${1:-INFO}"
    local msg="${2:-}"
    local ts entry

    ts=$(date '+%Y-%m-%d %H:%M:%S')
    entry="[$ts] [$level] $msg"

    printf '%s\n' "$entry" | tee -a "$MOON_LOG"
}

moon_err() {
    moon_log "ERROR" "$*" >&2
}

# --------------------------------------------------
# Helpers
# --------------------------------------------------

moon_is_tor() {
    [[ "${1:-}" == *.onion ]]
}

moon_require_root() {
    if [[ $EUID -ne 0 ]]; then
        moon_err "must run as root"
        return 1
    fi
}

moon_generate_onion() {
    local chars="abcdefghijklmnopqrstuvwxyz234567"
    local result="" i
    for i in {1..16}; do
        result+="${chars:$((RANDOM % ${#chars})):1}"
    done
    printf '%s.onion\n' "$result"
}

moon_db_name() {
    local domain="$1"
    local clean="${domain//[.-]/}"
    if [[ ${#clean} -gt 55 ]]; then
        clean="${clean:0:50}$(printf '%s' "$domain" | md5sum | cut -c1-6)"
    fi
    printf '%s%s\n' "$MOON_DB_NAME_PREFIX" "$clean"
}

# --------------------------------------------------
# Validation
# --------------------------------------------------

moon_validate() {
    local domain="$1"
    local type="${2:-moon}"

    domain="${domain//[[:space:]]/}"

    if [[ -z $domain ]]; then
        moon_err "domain is required"
        return 1
    fi

    case "$type" in
        tor)
            local name="${domain%.onion}"
            [[ $domain == *.onion ]] || { moon_err "must end with .onion"; return 1; }
            [[ $name =~ ^[a-z2-9]+$ ]] || { moon_err "invalid .onion chars"; return 1; }
            (( ${#name} >= 10 && ${#name} <= 56 )) || { moon_err "onion length 10-56"; return 1; }
            ;;
        moon|internal)
            (( ${#domain} <= 253 )) || { moon_err "domain too long"; return 1; }
            [[ $domain =~ ^[a-zA-Z0-9.-]+$ ]] || { moon_err "invalid chars"; return 1; }
            [[ $domain == *.* ]] || { moon_err "must contain dot"; return 1; }
            [[ ! $domain =~ ^[.-] && ! $domain =~ [.-]$ ]] || { moon_err "cannot start/end with dot or hyphen"; return 1; }
            [[ ! $domain =~ \.\. ]] || { moon_err "consecutive dots"; return 1; }
            local tld="${domain##*.}"
            (( ${#tld} >= 2 )) && [[ $tld =~ ^[a-zA-Z]+$ ]] || { moon_err "invalid TLD"; return 1; }
            ;;
        *)
            moon_err "invalid type: $type"
            return 1
            ;;
    esac

    return 0
}

# --------------------------------------------------
# Filesystem (Vite + template)
# --------------------------------------------------
moon_create_filesystem() {
    local domain="$1"
    local template="${2:-$MOON_DEFAULT_TEMPLATE}"
    local path="$MOON_ROOT/$domain"
    local template_dir="$MOON_TEMPLATE_DIR/$template"

    if [[ -d $path ]]; then
        moon_log "WARN" "filesystem exists: $path"
        return 0
    fi

    command -v yarn >/dev/null 2>&1 || {
        moon_err "yarn not installed"
        return 1
    }

    mkdir -p "$path" || { moon_err "cannot mkdir $path"; return 1; }
    cd "$path" || { moon_err "cannot cd $path"; return 1; }

    # package.json
    cat > package.json <<EOF
{
  "name": "${domain//[^a-zA-Z0-9-]/-}",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-helmet-async": "^2.0.0",
    "react-router-dom": "^7.0.0",
    "react-icons": "^5.0.0",
    "js-cookie": "^3.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  },
  "packageManager": "yarn@4.14.1"
}
EOF

    # .yarnrc.yml — node-modules, όχι PnP
    cat > .yarnrc.yml <<EOF
nodeLinker: node-modules
EOF

    # yarn install
    yarn install || { moon_err "yarn install failed"; return 1; }

    # template
    if [[ -d $template_dir ]]; then
        cp -Rf "${template_dir}/"* "$path/" || {
            moon_err "template copy failed"
            return 1
        }
    fi

    # build
    yarn build || moon_log "WARN" "yarn build failed"

    chown -R dros:dros "$path" 2>/dev/null || chown -R "$(whoami):$(whoami)" "$path"
    chmod -R 755 "$path"

    moon_log "INFO" "filesystem created: $path"
    printf '%s\n' "$path"
}

# --------------------------------------------------
# Database
# --------------------------------------------------

moon_create_database() {
    local domain="$1"
    local db_name
    db_name=$(moon_db_name "$domain")

    command -v mariadb >/dev/null 2>&1 || {
        moon_log "WARN" "mariadb not installed"
        return 1
    }

    local db_user="${DB_USER:-root}"
    local db_pass="${DB_PASS:-}"
    local db_host="${DB_HOST:-localhost}"

    mariadb -u"$db_user" -p"$db_pass" -h"$db_host" \
        -e "CREATE DATABASE IF NOT EXISTS \`$db_name\`;" 2>/dev/null || {
        moon_err "cannot create database: $db_name"
        return 1
    }

    if [[ -f $MOON_TEMPLATE_SQL ]]; then
        mariadb -u"$db_user" -p"$db_pass" -h"$db_host" -D "$db_name" \
            < "$MOON_TEMPLATE_SQL" 2>/dev/null || moon_log "WARN" "template SQL import failed"
    fi

    moon_log "INFO" "database created: $db_name"
    printf '%s\n' "$db_name"
}

# --------------------------------------------------
# Nginx
# --------------------------------------------------

moon_nginx_conf() {
    local domain="$1"
    local root="$2"
    local port="${3:-80}"

    if [[ ! -f $MOON_NGINX_SHARED ]]; then
        mkdir -p "$(dirname "$MOON_NGINX_SHARED")"
        cat > "$MOON_NGINX_SHARED" <<'EOF'
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml application/json;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
server_tokens off;
EOF
    fi

    cat <<EOF
server {
    listen ${port};
    server_name ${domain};

    root ${root}/dist;
    index index.html;

    access_log ${MOON_NGINX_LOG_DIR}/${domain}-access.log;
    error_log  ${MOON_NGINX_LOG_DIR}/${domain}-error.log;

    include ${MOON_NGINX_SHARED};

    location = /favicon.ico {
        log_not_found off;
        access_log off;
        try_files /favicon.ico =204;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
}

moon_create_nginx() {
    local domain="$1"
    local port="${2:-80}"
    local root="$MOON_ROOT/$domain"

    [[ -d $root ]] || { moon_err "filesystem missing: $root"; return 1; }

    local conf="$MOON_NGINX_DIR/${domain}.conf"

    moon_nginx_conf "$domain" "$root" "$port" > "$conf" || {
        moon_err "cannot write nginx conf"
        return 1
    }

    chmod 644 "$conf"

    if ! nginx -t >/dev/null 2>&1; then
        moon_err "nginx -t failed, rolling back"
        rm -f "$conf"
        return 1
    fi

    systemctl reload nginx || { moon_err "nginx reload failed"; return 1; }

    moon_log "INFO" "nginx config created: $conf (port $port)"
    printf '%s\n' "$conf"
}

# --------------------------------------------------
# DNS
# --------------------------------------------------

moon_create_dns() {
    local domain="$1"
    local ip="${SERVERIP:-}"

    [[ -n $ip ]] || { moon_err "SERVERIP missing"; return 1; }

    systemctl is-active --quiet bind9 || {
        moon_log "WARN" "bind9 not active"
        return 1
    }

    mkdir -p "$MOON_BIND_ZONES"
    local zone="$MOON_BIND_ZONES/db.$domain"

    if [[ -f $zone ]]; then
        moon_log "WARN" "zone exists: $zone"
        return 0
    fi

    local rev
    rev=$(echo "$ip" | awk -F. '{print $4"."$3"."$2"."$1}')

    cat > "$zone" <<EOF
\$TTL 3000
$domain. IN SOA ns1.$domain. admin.$domain. (
    2018112810 1200 3600 1209601 60000 )
$domain. IN NS ns1.$domain.
$domain. IN NS ns2.$domain.
$domain. IN A $ip
ns1.$domain. IN A $ip
ns2.$domain. IN A $ip
mail.$domain. 10 IN A $ip
* IN CNAME $domain.
$rev.in-addr.arpa. IN PTR $domain.
$domain. IN MX 10 mail.$domain.
EOF

    chmod 644 "$zone"

    cat >> "$MOON_BIND_CONF" <<EOF

zone "$domain" {
    type master;
    file "$zone";
    allow-query { any; };
    also-notify { $ip; };
};
EOF

    systemctl reload bind9 || { moon_err "bind9 reload failed"; return 1; }

    moon_log "INFO" "DNS zone created: $zone"
    printf '%s\n' "$zone"
}

# --------------------------------------------------
# SSL
# --------------------------------------------------

moon_create_ssl() {
    local domain="$1"
    local conf="$MOON_NGINX_DIR/${domain}.conf"

    [[ -f $conf ]] || { moon_err "nginx conf missing: $conf"; return 1; }

    command -v certbot >/dev/null 2>&1 || {
        moon_log "WARN" "certbot not installed"
        return 1
    }

    certbot certonly --nginx -d "$domain" || {
        moon_err "certbot failed"
        return 1
    }

    [[ -f "/etc/letsencrypt/live/${domain}/fullchain.pem" ]] || {
        moon_err "cert missing"
        return 1
    }

    sed -i '/listen 80;/d' "$conf"
    sed -i "/server_name/a\\
    listen 443 ssl;\\
    http2 on;\\
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;\\
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;\\
    include /etc/letsencrypt/options-ssl-nginx.conf;\\
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;" "$conf"

    systemctl reload nginx || { moon_err "nginx reload failed"; return 1; }

    moon_log "INFO" "SSL installed: $domain"
    return 0
}

# --------------------------------------------------
# Tor
# --------------------------------------------------

moon_create_tor() {
    local domain="$1"
    local port="${2:-${TOR_PORT:-80}}"
    local svc_dir="$MOON_TOR_DIR/hidden_service_${domain}"

    [[ -f $MOON_TORRC ]] || { moon_err "torrc missing: $MOON_TORRC"; return 1; }

    if grep -q "HiddenServiceDir $svc_dir" "$MOON_TORRC" 2>/dev/null; then
        moon_log "WARN" "tor service exists: $domain"
        if [[ -f "$svc_dir/hostname" ]]; then
            cat "$svc_dir/hostname"
            return 0
        fi
        return 1
    fi

    {
        echo ""
        echo "# Hidden service for $domain"
        echo "HiddenServiceDir $svc_dir"
        echo "HiddenServicePort 80 127.0.0.1:${port}"
    } >> "$MOON_TORRC"

    systemctl restart tor || { moon_err "tor restart failed"; return 1; }
    sleep 3

    if [[ -f "$svc_dir/hostname" ]]; then
        local onion
        onion=$(tr -d '\n\r' < "$svc_dir/hostname")
        moon_log "INFO" "tor created: $onion"
        printf '%s\n' "$onion"
        return 0
    fi

    moon_err "tor hostname not generated"
    return 1
}

# --------------------------------------------------
# DB entry
# --------------------------------------------------

moon_db_entry() {
    local requested="$1"
    local actual="${2:-$1}"
    local title="${3:-$actual}"
    local desc="${4:-}"
    local db_name
    db_name=$(moon_db_name "$actual")

    local db_user="${DB_USER:-root}"
    local db_pass="${DB_PASS:-}"
    local db_host="${DB_HOST:-localhost}"
    local admin_db="${DB_ADMIN:-gen_admin}"

    mariadb -u"$db_user" -p"$db_pass" -h"$db_host" -D "$admin_db" -e "
        INSERT IGNORE INTO domain
            (name, title, description, maria, created, status, fsys_check, nginx_check, maria_check)
        VALUES
            ('$actual', '$title', '$desc', '$db_name', NOW(), 1, 1, 1, 1)
    " 2>/dev/null || {
        moon_err "db entry failed"
        return 1
    }

    moon_log "INFO" "db entry: $actual -> $db_name"
    return 0
}

# --------------------------------------------------
# Modes
# --------------------------------------------------

moon_localhost() {
    local port="${1:-3000}"
    local domain="localhost"

    moon_require_root || return 1

    moon_log "INFO" "moon localhost (port $port)"

    moon_create_filesystem "$domain" || { moon_err "fs failed"; return 1; }
    moon_create_database   "$domain" || moon_log "WARN" "db failed"
    moon_create_nginx      "$domain" "$port" || { moon_err "nginx failed"; return 1; }
    moon_db_entry          "$domain" "$domain" "localhost"

    moon_log "INFO" "moon localhost done → http://localhost:$port"
}

moon_domain() {
    local domain="${1:-}"
    local template="${2:-$MOON_DEFAULT_TEMPLATE}"

    [[ -n $domain ]] || { moon_err "usage: moon domain <name>"; return 1; }

    moon_require_root || return 1
    moon_validate "$domain" "moon" || return 1

    moon_log "INFO" "moon domain: $domain (template $template)"

    moon_create_filesystem "$domain" "$template" || { moon_err "fs failed"; return 1; }
    moon_create_database   "$domain" || moon_log "WARN" "db failed"
    moon_create_nginx      "$domain" 80 || { moon_err "nginx failed"; return 1; }
    moon_create_dns        "$domain" || moon_log "WARN" "dns failed"
    moon_create_ssl        "$domain" || moon_log "WARN" "ssl failed"
    moon_db_entry          "$domain" "$domain" "$domain"

    moon_log "INFO" "moon domain done: https://$domain"
}

moon_tor() {
    local template="${1:-$MOON_DEFAULT_TEMPLATE}"
    local domain
    domain=$(moon_generate_onion)

    moon_require_root || return 1

    moon_log "INFO" "moon tor: $domain"

    moon_create_filesystem "$domain" "$template" || { moon_err "fs failed"; return 1; }
    moon_create_database   "$domain" || moon_log "WARN" "db failed"

    local onion
    onion=$(moon_create_tor "$domain" "${TOR_PORT:-80}") || {
        moon_err "tor failed"
        return 1
    }

    moon_db_entry "$domain" "$onion" "tor"

    moon_log "INFO" "moon tor done: http://$onion"
    printf '%s\n' "$onion"
}

# --------------------------------------------------
# Extras (μία function ανά)
# --------------------------------------------------

moon_ssl() {
    local domain="${1:-}"
    [[ -n $domain ]] || { moon_err "usage: moon ssl <domain>"; return 1; }
    moon_require_root || return 1
    moon_validate "$domain" "moon" || return 1
    moon_create_ssl "$domain"
}

moon_dns() {
    local domain="${1:-}"
    [[ -n $domain ]] || { moon_err "usage: moon dns <domain>"; return 1; }
    moon_require_root || return 1
    moon_validate "$domain" "moon" || return 1
    moon_create_dns "$domain"
}

moon_nginx() {
    local domain="${1:-}"
    local port="${2:-80}"
    [[ -n $domain ]] || { moon_err "usage: moon nginx <domain> [port]"; return 1; }
    moon_require_root || return 1
    moon_create_nginx "$domain" "$port"
}

moon_db() {
    local domain="${1:-}"
    [[ -n $domain ]] || { moon_err "usage: moon db <domain>"; return 1; }
    moon_create_database "$domain"
}

moon_fs() {
    local domain="${1:-}"
    local template="${2:-$MOON_DEFAULT_TEMPLATE}"
    [[ -n $domain ]] || { moon_err "usage: moon fs <domain> [template]"; return 1; }
    moon_create_filesystem "$domain" "$template"
}

moon_list() {
    local dir="$MOON_ROOT"
    [[ -d $dir ]] || { moon_err "moon root missing: $dir"; return 1; }
    find "$dir" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' 2>/dev/null | sort | paste -sd ' ' -
}

# --------------------------------------------------
# Meta
# --------------------------------------------------

moon_about() { printf '%s\n' 'MOON | domain, localhost and tor management'; }
moon_esti()  { moon_help; }
moon_help()  {
    printf '%s\n' \
        'MOON — domain management' \
        '' \
        'Modes:' \
        '  moon localhost [port]          create localhost (default port 3000)' \
        '  moon domain <name> [template]  full domain (nginx + dns + ssl)' \
        '  moon tor [template]            generate .onion hidden service' \
        '' \
        'Extras:' \
        '  moon ssl   <domain>' \
        '  moon dns   <domain>' \
        '  moon nginx <domain> [port]' \
        '  moon db    <domain>' \
        '  moon fs    <domain> [template]' \
        '' \
        'Other:' \
        '  moon list' \
        '  moon about' \
        '  moon help'
}

# --------------------------------------------------
# Standalone entry point
# --------------------------------------------------

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    verb="${1:-help}"
    shift || true
    case "$verb" in
        localhost) moon_localhost "$@" ;;
        domain)    moon_domain    "$@" ;;
        tor)       moon_tor       "$@" ;;
        ssl)       moon_ssl       "$@" ;;
        dns)       moon_dns       "$@" ;;
        nginx)     moon_nginx     "$@" ;;
        db)        moon_db        "$@" ;;
        fs)        moon_fs        "$@" ;;
        list)      moon_list      "$@" ;;
        about|esti) moon_about    "$@" ;;
        help|*)    moon_help      "$@" ;;
    esac
fi