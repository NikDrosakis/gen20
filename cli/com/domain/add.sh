#!/bin/bash
# /var/www/gs/cli/com/domain/add.sh
# Domain creation command for gen CLI
# Usage: gen domain add [domain] [options]
# Examples:
#   gen domain add example.com
#   gen domain add --type tor
#   gen domain add example.com --ssl --template php
# Description: Creates domains with filesystem, database, nginx, DNS, and SSL

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_NAME="createDomain"
VERSION="1.0.0"
LOG_FILE="/var/www/gs/log/domain-new.log"
#CONFIG_DIR="/etc/domain-manager"
#CONFIG_FILE="${CONFIG_DIR}/config.conf"

# Default values
DEFAULT_TYPE="public"
DEFAULT_TEMPLATE="default"
DEFAULT_WEB_ROOT="/var/www/gs/public"
DEFAULT_NGINX_CONF_DIR="/etc/nginx/conf.d"
DEFAULT_BIND_ZONES_DIR="/etc/bind/zones"
DEFAULT_NAMED_CONF="/etc/bind/named.conf.remote"

# Global variables
DOMAIN=""
SERVERIP="135.181.219.173"
DOMAIN_TYPE=""
OPTIONS=()
CREATE_FILESYSTEM=true
CREATE_DATABASE=true
CREATE_NGINX=true
CREATE_DNS=true
CREATE_SSL=false
TEMPLATE="default"
TOR_PORT=80
TOR_HIDDEN_SERVICE=""

# ============================================
# Helper Functions
# ============================================

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case "$level" in
        "INFO") echo -e "${GREEN}[INFO]${NC} $message" ;;
        "WARN") echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "DEBUG") echo -e "${CYAN}[DEBUG]${NC} $message" ;;
        *) echo "[$level] $message" ;;
    esac

    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

error_exit() {
    log "ERROR" "$1"
    exit 1
}

add_domain_db_entry() {
    local domain="$1"
    local actual_domain="${2:-$domain}"
    local title="${3:-$actual_domain}"
    local description="${4:-}"

    # Δημιουργία database name
    local db_name=""
    local clean_domain=$(echo "$actual_domain" | tr -d '.-')

    if [[ ${#clean_domain} -gt 55 ]]; then
        local hash=$(echo "$actual_domain" | md5sum | cut -c1-6)
        clean_domain="${clean_domain:0:50}${hash}"
    fi

    db_name="gen_${clean_domain}"

    # Έλεγχος μήκους
    if [[ ${#db_name} -gt 64 ]]; then
        local hash=$(echo "$actual_domain" | md5sum | cut -c1-8)
        db_name="gen_${hash}"
    fi

    log "INFO" "Adding domain entry: $actual_domain -> $db_name"

    # ✅ INSERT IGNORE - αποφεύγει duplicates
    mariadb -uroot -pn130177! -D gen_admin -e "
        INSERT IGNORE INTO domain (name, title, description, maria, created, status, fsys_check, nginx_check, maria_check)
        VALUES ('$actual_domain', '$title', '$description', '$db_name', NOW(), 1, 1, 1, 1)
    " 2>/dev/null || {
        log "ERROR" "Failed to insert domain entry for $domain"
        return 1
    }

    log "INFO" "Domain entry added successfully: $actual_domain"
    return 0
}

configure_tor_hidden_service() {
    local domain="$1"
    local port="${2:-80}"
    local torrc="/etc/tor/torrc"
    local service_dir="/var/lib/tor/hidden_service_${domain}/"

    # ✅ Όλα τα logs πάνε στο stderr (>&2)
    log "INFO" "Configuring Tor hidden service for $domain..." >&2

    if grep -q "HiddenServiceDir ${service_dir}" "$torrc" 2>/dev/null; then
        log "WARN" "Tor hidden service already exists for $domain" >&2
        if [[ -f "${service_dir}/hostname" ]]; then
            local onion_addr=$(cat "${service_dir}/hostname" | tr -d '\n\r' | xargs)
            echo "$onion_addr"  # ✅ Μόνο αυτό πάει στο stdout
            return 0
        fi
        return 1
    fi

    # Προσθήκη στο torrc
    {
        echo ""
        echo "# Hidden service for ${domain}"
        echo "HiddenServiceDir ${service_dir}"
        echo "HiddenServicePort 80 127.0.0.1:${port}"
    } >> "$torrc"

    log "INFO" "Restarting Tor to generate hostname..." >&2
    systemctl restart tor || {
        log "ERROR" "Failed to restart Tor" >&2
        return 1
    }

    sleep 3

    local hostname_file="${service_dir}/hostname"
    if [[ -f "$hostname_file" ]]; then
        local onion_addr=$(cat "$hostname_file" | tr -d '\n\r' | xargs)
        log "INFO" "✅ Tor hidden service created: $onion_addr" >&2
        echo "$onion_addr"  # ✅ Μόνο αυτό πάει στο stdout
        return 0
    else
        log "ERROR" "Failed to generate hostname for $domain" >&2
        return 1
    fi
}

gen_tor_react_conf() {
    local domain="$1"
    local web_root="${2:-$DEFAULT_WEB_ROOT}"
    local shared_conf="/var/www/gs/setup/server/gen_shared.conf"

    # Αν το shared config δεν υπάρχει, δημιούργησέ το
    if [[ ! -f "$shared_conf" ]]; then
        mkdir -p "$(dirname "$shared_conf")"
        cat > "$shared_conf" <<'EOF'
# Shared Nginx configuration
# Includes: security headers, gzip, caching, etc.

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml application/json;

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;

# Disable server tokens
server_tokens off;
EOF
        log "INFO" "Created shared Nginx config: $shared_conf"
    fi

    cat <<EOF
# Tor Hidden Service Configuration for ${domain}
server {
    listen 80;
    server_name ${domain};

    root ${web_root}/${domain}/dist;
    index index.html;

    access_log /var/www/gs/log/${domain}-access.log;
    error_log /var/www/gs/log/${domain}-error.log;

    # Include shared configuration
    include ${shared_conf};

location = /favicon.ico {
    log_not_found off;
    access_log off;
    try_files /favicon.ico =204;
}

location / {
    index index.html;
    root /var/www/gs/public/gen20.art/dist;

    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

    try_files $uri $uri/ /index.html;
}
}
EOF
}

check_requirements() {
    log "INFO" "Checking system requirements..."

    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error_exit "This script must be run as root (sudo)"
    fi

    # Required commands (basic)
    local required_commands=("nginx" "systemctl" "curl" "mkdir" "chown" "chmod")

    # Add BIND only if NOT tor domain
    if [[ -n "$DOMAIN" ]] && ! is_tor_domain "$DOMAIN"; then
        required_commands+=("named-checkzone" "dig")
        log "INFO" "Regular domain detected - BIND required"
    else
        log "INFO" "Tor domain detected - BIND not required"
    fi

    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            if [[ "$cmd" == "named-checkzone" ]] || [[ "$cmd" == "dig" ]]; then
                log "WARN" "$cmd not found, but may not be needed for Tor"
            else
                error_exit "Required command not found: $cmd"
            fi
        fi
    done

    log "INFO" "All requirements satisfied"
}

validate_domain() {
    local domain="$1"
    local type="${2:-$DOMAIN_TYPE}"

    # Αφαίρεση whitespace
    domain=$(echo "$domain" | tr -d '\n\r' | xargs)

    if [[ -z "$domain" ]]; then
        error_exit "Domain is required"
    fi

    case "$type" in
        "tor")
            local name="${domain%.onion}"

            if [[ ! "$domain" =~ \.onion$ ]]; then
                error_exit "Tor domain must end with .onion"
            fi

            if [[ ! "$name" =~ ^[a-z2-9]+$ ]]; then
                error_exit "Invalid .onion: only a-z and 2-7 allowed"
            fi

            if [[ ${#name} -lt 10 ]] || [[ ${#name} -gt 56 ]]; then
                error_exit "Tor domain length: ${#name} (must be 10-56)"
            fi

            log "INFO" "✅ Tor domain accepted: $domain (${#name} chars)"
            ;;

        "public"|"internal")
            # ✅ Χωρίς σύνθετα regex - απλοί έλεγχοι

            # 1. Μήκος
            if [[ ${#domain} -gt 253 ]]; then
                error_exit "Domain too long: ${#domain} (max 253)"
            fi

            # 2. Χαρακτήρες
            if [[ ! "$domain" =~ ^[a-zA-Z0-9.-]+$ ]]; then
                error_exit "Invalid characters in domain"
            fi

            # 3. Πρέπει να έχει τελεία
            if [[ ! "$domain" =~ \. ]]; then
                error_exit "Domain must contain a dot"
            fi

            # 4. Δεν αρχίζει/τελειώνει με ειδικούς χαρακτήρες
            if [[ "$domain" =~ ^[.-] ]] || [[ "$domain" =~ [.-]$ ]]; then
                error_exit "Domain cannot start or end with dot or hyphen"
            fi

            # 5. Διπλές τελείες
            if [[ "$domain" =~ \.\. ]]; then
                error_exit "Domain cannot have consecutive dots"
            fi

            # 6. TLD validation
            local tld="${domain##*.}"
            if [[ ${#tld} -lt 2 ]] || [[ ! "$tld" =~ ^[a-zA-Z]+$ ]]; then
                error_exit "Invalid TLD: $tld"
            fi

            log "INFO" "✅ Domain validated: $domain"
            ;;

        *)
            error_exit "Invalid domain type: $type. Must be 'public', 'tor', or 'internal'"
            ;;
    esac

    log "INFO" "Domain validation passed: $domain"
    return 0
}

generate_onion_address() {
    local chars="abcdefghijklmnopqrstuvwxyz234567"
    local result=""

    for i in {1..16}; do
        result="${result}${chars:$((RANDOM % ${#chars})):1}"
    done

    echo "${result}.onion"
}

# ============================================
# Core Functions
# ============================================

create_filesystem() {
    local domain="$1"
    local web_root="${2:-$DEFAULT_WEB_ROOT}"
    local template="${3:-simple}"
    local template_dir="/var/www/gs/public/admin/templates/${template}"

    log "INFO" "Creating React/Vite filesystem for $domain..."
    local path="${web_root}/${domain}"

    if [[ -d "$path" ]]; then
        log "WARN" "Directory already exists: $path"
        return 0
    fi

    cd "$web_root" || {
        log "ERROR" "Failed to change to directory: $web_root"
        return 1
    }

    # Check if yarn is available
    if ! command -v yarn &> /dev/null; then
        log "WARN" "Yarn not found. Installing yarn..."
        npm install -g yarn || {
            log "ERROR" "Failed to install yarn"
            return 1
        }
    fi

    # Initialize with Vite React template - με --no-pnp flag
    yarn create vite "${domain}" --template react --no-pnp || {
        log "ERROR" "Failed to create Vite React project"
        return 1
    }

    cd "$path" || {
        log "ERROR" "Failed to change to directory: $path"
        return 1
    }

    # ✅ Απενεργοποίησε το PnP και διόρθωσε το packageManager
    yarn config set nodeLinker node-modules
    yarn config set pnpMode loose

    # ✅ Πρόσθεσε το packageManager field στο package.json
    if [[ -f "package.json" ]]; then
        # Πρόσθεσε το packageManager field
        jq '. + { "packageManager": "yarn@4.14.1" }' package.json > package.json.tmp
        mv package.json.tmp package.json
    fi

    # Install dependencies
    log "INFO" "Installing dependencies with yarn..."
    yarn install || {
        log "ERROR" "Failed to install dependencies"
        return 1
    }

    # Update package.json with domain info
    if [[ -f "package.json" ]]; then
        if command -v jq &> /dev/null; then
            jq --arg domain "$domain" \
               --arg desc "React application for $domain" \
               '.name = $domain | .description = $desc' \
               package.json > package.json.tmp
            mv package.json.tmp package.json
        else
            sed -i "s/\"name\": \".*\"/\"name\": \"$domain\"/" package.json
            sed -i "s/\"description\": \".*\"/\"description\": \"React application for $domain\"/" package.json
        fi
    fi

    # ✅ Copy template files (OVERWRITE everything)
    log "INFO" "Copying template from: $template_dir"
    cp -Rf "${template_dir}/"* "$path/" || {
        log "ERROR" "Failed to copy template files"
        return 1
    }

    #install simple plugins
    yarn add react-helmet-async react-router-dom react-icons js-cookie

    # Build the project
    log "INFO" "Building the React/Vite project..."
    yarn build || {
        log "WARN" "Build failed, but continuing..."
    }

    # Set proper permissions
    chown -R dros:dros "$path" 2>/dev/null || {
        log "WARN" "Could not set ownership to dros:dros, using current user"
        chown -R $(whoami):$(whoami) "$path"
    }
    chmod -R 755 "$path"

    log "INFO" "React/Vite project created at: $path"
    echo "$path"
}

create_database() {
    local domain="$1"
    local db_name="gen_$(echo "$domain" | tr -d '.')"

    log "INFO" "Creating database: $db_name..."

    # Check if MySQL/MariaDB is installed
    if ! command -v mariadb &> /dev/null; then
        log "WARN" "MySQL/MariaDB not installed. Skipping database creation."
        return 1
    fi

    # Create database
    mariadb -uroot -pn130177! -e "CREATE DATABASE IF NOT EXISTS \`$db_name\`;" 2>/dev/null || {
        log "ERROR" "Failed to create database: $db_name"
        return 1
    }

    # Import template if exists
    local template_file="/var/www/gs/public/admin/templates/simple/data/template.sql"
    if [[ -f "$template_file" ]]; then
        mariadb -uroot -pn130177! -D "$db_name" < "$template_file" 2>/dev/null || {
            log "WARN" "Failed to import template SQL"
        }
    fi

    log "INFO" "Database created: $db_name"
    echo "$db_name"
}

gen_react_conf() {
    local domain="$1"
    local web_root="${2:-$DEFAULT_WEB_ROOT}"
    local port="${3:-5173}"

    cat <<EOF
# React/Vite configuration for $domain
server {
    listen 80;
    server_name $domain;

    root ${web_root}/${domain}/dist;
    index index.html;

    access_log /var/log/nginx/${domain}-access.log;
    error_log /var/log/nginx/${domain}-error.log;

include /var/www/gs/setup/server/gen_shared.conf;


location = /favicon.ico {
    log_not_found off;
    access_log off;
    try_files /favicon.ico =204;
}

location / {
    index index.html;
    root /var/www/gs/public/${domain}/dist;

    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

    try_files $uri $uri/ /index.html;
}
}
EOF
}

create_nginx_config() {
    local domain="$1"
    local app_type="${2:-vite}"
    local web_root="${3:-$DEFAULT_WEB_ROOT}"
    local nginx_dir="${4:-$DEFAULT_NGINX_CONF_DIR}"
    local is_tor="${5:-false}"

    log "INFO" "Creating Nginx configuration for $domain..."

    local config_file="${nginx_dir}/${domain}.conf"

    # Generate configuration based on app type
    local config_content=""
    case "$app_type" in
        "vite"|"react")
            config_content=$(gen_react_conf "$domain" "$web_root")
            ;;
        *)
            error_exit "Unsupported application type: $app_type"
            ;;
    esac

    # Write configuration
    echo "$config_content" > "$config_file"
    chmod 644 "$config_file"

    # Test Nginx configuration
    if ! nginx -t &>/dev/null; then
        log "ERROR" "Nginx configuration test failed. Rolling back..."
        rm -f "$config_file"
        error_exit "Invalid Nginx configuration"
    fi

    # Reload Nginx
    systemctl reload nginx || {
        log "ERROR" "Failed to reload Nginx"
        return 1
    }

    log "INFO" "Nginx configuration created: $config_file"
    echo "$config_file"
}

is_tor_domain() {
    local domain="$1"
    if [[ "$domain" == *.onion ]]; then
        return 0  # true
    fi
    return 1  # false
}

create_dns_zone() {
    local domain="$1"
    local ext_ip="${2:-$SERVERIP}"
    local zones_dir="${3:-$DEFAULT_BIND_ZONES_DIR}"
    local named_conf="${4:-$DEFAULT_NAMED_CONF}"

    log "INFO" "Creating DNS zone for $domain..."

    # Check if BIND is active
    if ! systemctl is-active bind9 &>/dev/null; then
        log "WARN" "BIND9 is not active. Skipping DNS configuration."
        return 1
    fi

    # Create zones directory if not exists
    mkdir -p "$zones_dir"

    local zone_file="${zones_dir}/db.${domain}"

    # Check if zone already exists
    if [[ -f "$zone_file" ]]; then
        log "WARN" "Zone file already exists: $zone_file"
        return 0
    fi

    # Generate reverse IP
    local reverse_ip=$(echo "$ext_ip" | awk -F. '{print $4"."$3"."$2"."$1}')

    # Create zone file
    cat > "$zone_file" <<EOF
\$TTL	3000
$domain.	IN	SOA	ns1.$domain. admin.$domain. (
			2018112810
			1200
			3600
			1209601
			60000 )
$domain.	IN	NS	ns2.$domain.
$domain.	IN	NS	ns1.$domain.
$domain.	IN	A	$ext_ip
ns1.$domain.	IN	A	$ext_ip
ns2.$domain.	IN	A	$ext_ip
mail.$domain.	10	IN	A	$ext_ip
*	IN	CNAME	$domain.
$reverse_ip.in-addr.arpa.    IN      PTR     $domain.
$domain.	IN	MX	10	mail.$domain.
EOF

    chmod 644 "$zone_file"

    # Add zone configuration
    local zone_config=$(cat <<EOF

zone "$domain" {
    type master;
    file "/etc/bind/zones/db.$domain";
    allow-query { any; };
    also-notify { $ext_ip; };
};
EOF
)

    echo "$zone_config" >> "$named_conf"

    # Reload BIND
    systemctl reload bind9 || {
        log "ERROR" "Failed to reload BIND9"
        return 1
    }

    log "INFO" "DNS zone created: $zone_file"
    echo "$zone_file"
}

install_ssl_certificate() {
    local domain="$1"
    local nginx_conf="/etc/nginx/conf.d/${domain}.conf"

    log "INFO" "Installing SSL certificate for $domain..."

    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        log "WARN" "Certbot not installed. Installing..."
        apt-get update -qq && apt-get install -y certbot python3-certbot-nginx || {
            log "ERROR" "Failed to install certbot"
            return 1
        }
    fi

    # Check if Nginx config exists
    if [[ ! -f "$nginx_conf" ]]; then
        log "ERROR" "Nginx config not found: $nginx_conf"
        return 1
    fi

    # Install certificate
    log "INFO" "Running certbot for $domain..."
    certbot certonly --nginx -d "$domain"

    if [[ ! -f "/etc/letsencrypt/live/${domain}/fullchain.pem" ]]; then
        log "ERROR" "SSL certificate installation failed"
        return 1
    fi

    log "INFO" "SSL certificate installed successfully for $domain"

    # ✅ Update Nginx config with SSL using sed
    log "INFO" "Updating Nginx configuration for SSL..."

 # ✅ 1. Αφαίρεσε το listen 80;
    sed -i '/listen 80;/d' "$nginx_conf"

    # ✅ 2. Πρόσθεσε τις SSL γραμμές ΜΕΤΑ το server_name
    sed -i "/server_name/a \\
    listen 443 ssl;\\
    http2 on;\\
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;\\
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;\\
    include /etc/letsencrypt/options-ssl-nginx.conf;\\
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;" "$nginx_conf"

    systemctl reload nginx || {
        log "ERROR" "Failed to reload Nginx"
        mv "${nginx_conf}.backup" "$nginx_conf"
        return 1
    }

    log "INFO" "✅ SSL configuration applied successfully!"
    return 0
}

# ============================================
# Main Function
# ============================================

create_domain() {
    local domain="$1"
    local type="${2:-$DEFAULT_TYPE}"
    local template="${3:-$DEFAULT_TEMPLATE}"
    local options="$4"
    local requested_domain="$domain"
    local actual_domain="$domain"
    log "INFO" "Starting domain creation: $domain (type: $type)"

    # Parse options
    for opt in $options; do
        case "$opt" in
            "no-fs") CREATE_FILESYSTEM=false ;;
            "no-db") CREATE_DATABASE=false ;;
            "no-nginx") CREATE_NGINX=false ;;
            "no-dns") CREATE_DNS=false ;;
            "ssl") CREATE_SSL=true ;;
            *) log "WARN" "Unknown option: $opt" ;;
        esac
    done

    # Validate domain
    validate_domain "$domain" "$type"

    # Results array
    local results=""
    local actual_domain="$domain"

    # 1. Create filesystem
    if [[ "$CREATE_FILESYSTEM" == "true" ]]; then
           if fs_path=$(create_filesystem "$actual_domain"); then
               results+="filesystem: $fs_path\n"
           else
               log "WARN" "Filesystem creation failed"
           fi
       fi

    # 2. Create database
    if [[ "$CREATE_DATABASE" == "true" ]]; then
        if db_name=$(create_database "$domain"); then
            results+="database: $db_name\n"
        else
            log "WARN" "Database creation ${db_name} failed"
        fi
    fi

    # 2.5 Configure Tor hidden service (if type is tor)
    local tor_port=80
    if [[ "$type" == "tor" ]]; then
        log "INFO" "Setting up Tor hidden service for $domain..."

        if onion_addr=$(configure_tor_hidden_service "$domain" "$tor_port"); then
            # Update actual_domain with the real onion address
            requested_domain="$domain"
           actual_domain="$onion_addr"  # Χρησιμοποίησε το πραγματικό .onion

           results+="tor_requested: $requested_domain\n"
           results+="tor_actual: $actual_domain\n"
            log "INFO" "✅ Tor hidden service configured: $onion_addr"
        else
            log "WARN" "Tor hidden service configuration failed"
        fi
    fi

    # 3. Configure Nginx
    if [[ "$CREATE_NGINX" == "true" ]]; then
        local nginx_app_type="vite"
        local is_tor="false"

        case "$template" in
            "php") nginx_app_type="php" ;;
            "static") nginx_app_type="static" ;;
            *) nginx_app_type="vite" ;;
        esac

        # Check if this is a Tor domain
        if [[ "$type" == "tor" ]]; then
            is_tor="true"
        fi

        # Use actual_domain for nginx config (the real onion address)
        if nginx_file=$(create_nginx_config "$actual_domain" "$nginx_app_type" "$DEFAULT_WEB_ROOT" "$DEFAULT_NGINX_CONF_DIR" "$is_tor"); then
            results+="nginx: $nginx_file\n"
        else
            log "WARN" "Nginx configuration failed"
        fi
    fi

    # 4. Configure DNS (skip for tor)
    if [[ "$CREATE_DNS" == "true" ]] && [[ "$type" != "tor" ]]; then
        if dns_file=$(create_dns_zone "$actual_domain"); then
            results+="dns: $dns_file\n"
        else
            log "WARN" "DNS configuration failed"
        fi
    elif [[ "$type" == "tor" ]]; then
        log "INFO" "Skipping DNS configuration for Tor hidden service"
    fi

   # 5. SSL (skip for tor - not supported)
   if [[ "$CREATE_SSL" == "true" ]]; then
       if [[ "$type" == "tor" ]]; then
           log "WARN" "SSL certificates are not supported for .onion domains. Skipping."
       else
           if install_ssl_certificate "$actual_domain"; then
               results+="ssl: installed\n"
           else
               log "WARN" "SSL installation failed"
           fi
       fi
   fi

   # 6. Add entry to gen_admin database
   log "INFO" "Adding domain entry to gen_admin database..."
   if add_domain_db_entry "$domain" "$actual_domain" "$type"; then
       results+="db_entry: added\n"
       log "INFO" "Domain entry added successfully"
   else
       log "WARN" "Failed to add domain entry to database"
   fi

   # Log results
   log "INFO" "Domain created successfully"
   log "INFO" "  Original domain: $domain"
   log "INFO" "  Actual domain: $actual_domain"
   log "INFO" "  Results:\n$results"

   # Return JSON-like result
   cat <<EOF
   {
       "success": true,
       "domain": "$domain",
       "actual_domain": "$actual_domain",
       "type": "$type",
       "template": "$template",
       "is_tor": $( [[ "$type" == "tor" ]] && echo "true" || echo "false" ),
       "results": {
           $(echo "$results" | sed 's/: /: "/g' | sed 's/\\n/",\n/g' | sed 's/$/",/g' | sed '$ s/,$//')
       },
       "message": "Domain ${actual_domain} created successfully"
   }
   EOF

}



# ============================================
# Command Line Interface
# ============================================

show_help() {
    cat <<EOF
$SCRIPT_NAME v$VERSION - Debian Domain Creation Tool

Usage: $0 [OPTIONS] <domain>

OPTIONS:
    -t, --type TYPE        Domain type: public (default), tor, internal
    -T, --template TEMPL   Template: default (default), php, static, api, minimal
    -o, --options OPTS     Comma-separated options: no-fs,no-db,no-nginx,no-dns,ssl

    --no-fs                Skip filesystem creation
    --no-db                Skip database creation
    --no-nginx             Skip Nginx configuration
    --no-dns               Skip DNS configuration
    --ssl                  Install SSL certificate

    --tor-port PORT        Tor port (default: 80)
    --tor-service NAME     Tor hidden service name

    -h, --help             Show this help message
    -v, --version          Show version information

EXAMPLES:
    $0 example.com
    $0 --type tor abc123.onion
    $0 --template php --ssl example.com
    $0 --options no-dns,no-ssl example.com
    $0 --type internal --template static internal.example.com

DOMAIN VALIDATION:
    Public:   example.com, subdomain.example.com
    Tor:      16-56 chars a-z2-7 + .onion
    Internal: Any valid domain format (no external validation)

NOTES:
    - Must be run as root (sudo)
    - Requires Nginx, MySQL/MariaDB, BIND9, Certbot
    - Logs are written to: $LOG_FILE
EOF
}

show_version() {
    echo "$SCRIPT_NAME v$VERSION"
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -t|--type)
                DOMAIN_TYPE="$2"
                shift 2
                ;;
            -T|--template)
                TEMPLATE="$2"
                shift 2
                ;;
            -o|--options)
                IFS=',' read -ra OPTIONS <<< "$2"
                shift 2
                ;;
            --no-fs)
                OPTIONS+=("no-fs")
                shift
                ;;
            --no-db)
                OPTIONS+=("no-db")
                shift
                ;;
            --no-nginx)
                OPTIONS+=("no-nginx")
                shift
                ;;
            --no-dns)
                OPTIONS+=("no-dns")
                shift
                ;;
            --ssl)
                OPTIONS+=("ssl")
                shift
                ;;
            --tor-port)
                TOR_PORT="$2"
                shift 2
                ;;
            --tor-service)
                TOR_HIDDEN_SERVICE="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--version)
                show_version
                exit 0
                ;;
            -*)
                error_exit "Unknown option: $1"
                ;;
            *)
                # Μόνο το πρώτο non-option argument είναι το domain
                if [[ -z "$DOMAIN" ]]; then
                    DOMAIN="$1"
                fi
                shift
                ;;
        esac
    done

    # Αν είναι TOR και δεν έχει domain, δημιούργησε αυτόματα
    if [[ "$DOMAIN_TYPE" == "tor" && -z "$DOMAIN" ]]; then
        DOMAIN=$(generate_onion_address)
        log "INFO" "🔒 Auto-generated .onion address: $DOMAIN"
        echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}🔒 TOR DOMAIN GENERATED: ${CYAN}$DOMAIN${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    fi

    # Set default type if not specified
    DOMAIN_TYPE="${DOMAIN_TYPE:-$DEFAULT_TYPE}"
    TEMPLATE="${TEMPLATE:-$DEFAULT_TEMPLATE}"
}

# ============================================
# Main Execution
# ============================================

main() {
echo "Number of arguments: $#"
echo "All arguments:"
for i in $(seq 1 $#); do
    echo "  \$ $i: '${!i}'"
done
    if [[ "$1" == "domain" ]]; then
          shift
      fi
       if [[ "$1" == "add" ]]; then
              shift
          fi
    # Parse arguments
    parse_args "$@"

    # Check if domain is provided
    if [[ -z "$DOMAIN" ]]; then
        log "ERROR" "Domain is required"
        show_help
        exit 1
    fi

    # Check requirements
    check_requirements

    # Create domain
    create_domain "$DOMAIN" "$DOMAIN_TYPE" "$TEMPLATE" "${OPTIONS[*]}"

    log "INFO" "Script completed successfully"
}

# ============================================
# Script Entry Point
# ============================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
