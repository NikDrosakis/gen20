#!/usr/bin/env bash
# GEN20 GALAXY BIGBANG
# Debian 12 (Bookworm) / Debian 13 (Trixie)
# Installs system runtimes and development libraries for SOL, MOON, GOD,
# KRONOS, ERMIS and MARS. PHP follows the Debian default version.
# MariaDB and Redis are native services.
# CouchDB: native Apache package on Debian 12; systemd-managed official
# CouchDB container on Debian 13 (Apache's convenience .deb list covers 11/12).

set -Eeuo pipefail

GS_ROOT="${GS_ROOT:-/var/www/gs}"
LOG_DIR="${GS_LOG_DIR:-$GS_ROOT/data/gen20.net}"
LOG_FILE="${GS_LOG_FILE:-$LOG_DIR/bigbang.log}"
NODE_MAJOR=20
YARN_VERSION="4.14.1"
GO_REQUIRED_VERSION="1.26.0"
COUCHDB_IMAGE="${COUCHDB_IMAGE:-couchdb:3.5}"

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RESET='\033[0m'

say()  { printf "${CYAN}[BIGBANG]${RESET} %s\n" "$*"; }
ok()   { printf "${GREEN}[OK]${RESET} %s\n" "$*"; }
warn() { printf "${YELLOW}[WARN]${RESET} %s\n" "$*" >&2; }
die()  { printf "${RED}[ERROR]${RESET} %s\n" "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Run as root: sudo bash sol/bigbang_install.sh"
[[ -f /etc/os-release ]] || die "/etc/os-release not found"
# shellcheck disable=SC1091
source /etc/os-release

[[ "${ID:-}" == debian ]] || die "Supported OS: Debian 12/13. Detected: ${PRETTY_NAME:-unknown}"
case "${VERSION_ID:-}" in 12|13) ;; *) die "Supported Debian releases: 12 and 13. Detected: ${VERSION_ID:-unknown}" ;; esac

ARCH="$(dpkg --print-architecture)"
case "$ARCH" in amd64|arm64) ;; *) die "Unsupported architecture: $ARCH" ;; esac

mkdir -p "$LOG_DIR"
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1
trap 'rc=$?; printf "\n[BIGBANG] Failed at line %s (exit %s). Log: %s\n" "$LINENO" "$rc" "$LOG_FILE" >&2; exit "$rc"' ERR

export DEBIAN_FRONTEND=noninteractive

say "GEN20 Galaxy infrastructure bootstrap"
say "OS: $PRETTY_NAME | Architecture: $ARCH"
say "Root: $GS_ROOT"
say "Log: $LOG_FILE"

# Debian 13 CouchDB runs in the official Apache image. Ensure Docker's
# official APT repository exists before resolving docker-ce packages.
if [[ "$VERSION_ID" == 13 ]]; then
    install -d -m 0755 /etc/apt/keyrings
    if [[ ! -s /etc/apt/keyrings/docker.gpg ]]; then
        curl -fsSL https://download.docker.com/linux/debian/gpg |
            gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
        chmod 0644 /etc/apt/keyrings/docker.gpg
    fi
    printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian trixie stable\\n' \\
        "$ARCH" > /etc/apt/sources.list.d/docker.list
fi

say "Refreshing APT metadata..."
apt-get update

# Debian 13 uses Docker only to run CouchDB because Apache's published
# convenience Debian packages currently list Bookworm, not Trixie.
BASE_PACKAGES=(
    ca-certificates curl wget gnupg lsb-release apt-transport-https
    git rsync unzip zip xz-utils jq tree
    build-essential make cmake pkg-config gcc g++ clang
    openssl libssl-dev
    python3 python3-dev python3-venv python3-pip python3-wheel
    nginx

    # MariaDB server + Connector/C development files
    mariadb-server mariadb-client libmariadb-dev libmariadb-dev-compat

    # Redis server + development headers
    redis-server redis-tools libhiredis-dev

    # Native libraries
    libyaml-cpp-dev nlohmann-json3-dev
    libboost-system-dev libboost-thread-dev
    libwebsocketpp-dev libasio-dev libcurl4-openssl-dev

    # PHP: unpinned Debian default + repository-selected MariaDB driver.
    php-cli php-fpm php-curl php-mbstring php-xml
    php-zip php-gd php-intl php-bcmath php-opcache php-redis php-apcu
    "$PHP_MARIADB_PACKAGE"

    golang-go supervisor
    procps psmisc lsof net-tools iproute2
)

if [[ "$VERSION_ID" == 13 ]]; then
    BASE_PACKAGES+=(docker-ce docker-ce-cli containerd.io)
fi

say "Installing base system packages..."
apt-get install -y --no-install-recommends "${BASE_PACKAGES[@]}"

# --------------------------------------------------
# Go 1.26+
# --------------------------------------------------

go_version_number() {
    go version 2>/dev/null | awk '{print $3}' | sed 's/^go//'
}

GO_CURRENT="$(go_version_number || true)"
if [[ -z "$GO_CURRENT" ]] ||
   [[ "$(printf '%s\n' "$GO_CURRENT" "$GO_REQUIRED_VERSION" | sort -V | head -n 1)" != "$GO_REQUIRED_VERSION" ]]; then
    say "Installing official Go ${GO_REQUIRED_VERSION} or newer..."
    case "$ARCH" in amd64) GO_ARCH=amd64 ;; arm64) GO_ARCH=arm64 ;; esac

    read -r GO_VERSION GO_FILENAME GO_SHA256 < <(
        curl -fsSL 'https://go.dev/dl/?mode=json&include=all' |
        python3 -c '
import json, sys
releases = json.load(sys.stdin)
matches = []
for release in releases:
    version = release.get("version", "")
    if not version.startswith("go1.26."):
        continue
    for item in release.get("files", []):
        if item.get("os") == "linux" and item.get("arch") == sys.argv[1] and item.get("kind") == "archive":
            matches.append((version, item["filename"], item["sha256"]))
if not matches:
    raise SystemExit("No official Go 1.26 Linux archive found")
def key(row):
    return tuple(int(part) for part in row[0][2:].split("."))
print(*max(matches, key=key))
' "$GO_ARCH"
    )

    GO_TMP="$(mktemp -d)"
    curl -fsSL "https://go.dev/dl/$GO_FILENAME" -o "$GO_TMP/$GO_FILENAME"
    printf '%s  %s\n' "$GO_SHA256" "$GO_TMP/$GO_FILENAME" | sha256sum -c -
    install -d -m 0755 /opt/gen20
    rm -rf /opt/gen20/go1.26
    tar -xzf "$GO_TMP/$GO_FILENAME" -C "$GO_TMP"
    mv "$GO_TMP/go" /opt/gen20/go1.26
    rm -rf "$GO_TMP"
    ln -sfn /opt/gen20/go1.26/bin/go /usr/local/bin/go
    ln -sfn /opt/gen20/go1.26/bin/gofmt /usr/local/bin/gofmt
fi

# --------------------------------------------------
# Node.js 20 + Yarn
# --------------------------------------------------

node_major() {
    command -v node >/dev/null 2>&1 || return 1
    node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null
}

CURRENT_NODE="$(node_major || true)"
if [[ ! "$CURRENT_NODE" =~ ^[0-9]+$ ]] || (( CURRENT_NODE != NODE_MAJOR )); then
    say "Installing Node.js ${NODE_MAJOR}.x from NodeSource..."
    install -d -m 0755 /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key |
        gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
    chmod 0644 /etc/apt/keyrings/nodesource.gpg
    printf 'deb [arch=%s signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_%s.x nodistro main\n' \
        "$ARCH" "$NODE_MAJOR" > /etc/apt/sources.list.d/nodesource.list
    apt-get update
    apt-get install -y nodejs
fi

command -v node >/dev/null 2>&1 || die "Node.js installation failed"
[[ "$(node_major)" == "$NODE_MAJOR" ]] || die "Node.js ${NODE_MAJOR}.x required; found $(node --version)"

say "Activating Corepack and Yarn ${YARN_VERSION}..."
if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare "yarn@${YARN_VERSION}" --activate
else
    npm install --global "yarn@${YARN_VERSION}"
fi

# --------------------------------------------------
# KRONOS Python virtual environment
# --------------------------------------------------

if [[ -d "$GS_ROOT/kronos" ]]; then
    KRONOS_VENV="$GS_ROOT/kronos/genenv"
    if [[ ! -x "$KRONOS_VENV/bin/python" ]]; then
        say "Creating KRONOS Python virtual environment..."
        python3 -m venv "$KRONOS_VENV"
    else
        ok "Existing KRONOS virtual environment preserved: $KRONOS_VENV"
    fi
    "$KRONOS_VENV/bin/python" -m pip install --upgrade pip setuptools wheel
else
    warn "KRONOS directory not found at $GS_ROOT/kronos; venv creation skipped."
fi

# --------------------------------------------------
# CouchDB credentials
# --------------------------------------------------

COUCHDB_SECRET_DIR=/etc/gen20
COUCHDB_SECRET_FILE="$COUCHDB_SECRET_DIR/couchdb.env"
install -d -m 0700 "$COUCHDB_SECRET_DIR"

if [[ ! -s "$COUCHDB_SECRET_FILE" ]]; then
    COUCHDB_ADMIN_USER="${COUCHDB_ADMIN_USER:-admin}"
    COUCHDB_ADMIN_PASSWORD="${COUCHDB_ADMIN_PASSWORD:-$(openssl rand -hex 24)}"
    umask 077
    printf 'COUCHDB_USER=%s\nCOUCHDB_PASSWORD=%s\n' \
        "$COUCHDB_ADMIN_USER" "$COUCHDB_ADMIN_PASSWORD" > "$COUCHDB_SECRET_FILE"
    chmod 0600 "$COUCHDB_SECRET_FILE"
    unset COUCHDB_ADMIN_PASSWORD
fi

if [[ "$VERSION_ID" == 12 ]]; then
    say "Installing Apache CouchDB from its official Debian repository..."
    install -d -m 0755 /usr/share/keyrings
    curl -fsSL https://couchdb.apache.org/repo/keys.asc |
        gpg --dearmor --yes -o /usr/share/keyrings/couchdb-archive-keyring.gpg
    chmod 0644 /usr/share/keyrings/couchdb-archive-keyring.gpg
    printf 'deb [signed-by=/usr/share/keyrings/couchdb-archive-keyring.gpg] https://apache.jfrog.io/artifactory/couchdb-deb/ bookworm main\n' \
        > /etc/apt/sources.list.d/couchdb.list

    COUCHDB_ADMIN_USER="$(sed -n 's/^COUCHDB_USER=//p' "$COUCHDB_SECRET_FILE")"
    COUCHDB_ADMIN_PASSWORD="$(sed -n 's/^COUCHDB_PASSWORD=//p' "$COUCHDB_SECRET_FILE")"
    printf 'couchdb couchdb/mode select standalone\n' | debconf-set-selections
    printf 'couchdb couchdb/bindaddress string 127.0.0.1\n' | debconf-set-selections
    printf 'couchdb couchdb/adminpass password %s\n' "$COUCHDB_ADMIN_PASSWORD" | debconf-set-selections
    printf 'couchdb couchdb/adminpass_again password %s\n' "$COUCHDB_ADMIN_PASSWORD" | debconf-set-selections

    apt-get update
    COUCHDB_CANDIDATE="$(apt-cache policy couchdb | awk '/Candidate:/ {print $2; exit}')"
    [[ -n "$COUCHDB_CANDIDATE" && "$COUCHDB_CANDIDATE" != "(none)" ]] ||
        die "Apache CouchDB package has no candidate for Debian Bookworm."
    apt-get install -y couchdb
    unset COUCHDB_ADMIN_PASSWORD
else
    say "Installing CouchDB ${COUCHDB_IMAGE} as a systemd-managed service..."
    systemctl enable --now docker
    docker info >/dev/null 2>&1 || die "Docker daemon is unavailable; required for CouchDB on Debian 13."
    docker pull "$COUCHDB_IMAGE"

    install -d -m 0750 /var/lib/gen20/couchdb
    cat > /etc/systemd/system/gen20-couchdb.service <<UNIT
[Unit]
Description=GEN20 Apache CouchDB
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStartPre=-/usr/bin/docker rm -f gen20-couchdb
ExecStart=/usr/bin/docker run --name gen20-couchdb --publish 127.0.0.1:5984:5984 --env-file $COUCHDB_SECRET_FILE --volume /var/lib/gen20/couchdb:/opt/couchdb/data $COUCHDB_IMAGE
ExecStop=/usr/bin/docker stop --time 30 gen20-couchdb
ExecStopPost=-/usr/bin/docker rm -f gen20-couchdb
Restart=always
RestartSec=5
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
UNIT
    chmod 0644 /etc/systemd/system/gen20-couchdb.service
    systemctl daemon-reload
    systemctl enable gen20-couchdb.service
fi

# --------------------------------------------------
# Enable and start native infrastructure services
# --------------------------------------------------

say "Enabling and starting MariaDB, Redis and Nginx..."
for service in mariadb redis-server nginx; do
    systemctl enable "$service"
    systemctl restart "$service"
    systemctl is-active --quiet "$service" || die "$service failed to start"
    ok "$service is running"
done

if [[ "$VERSION_ID" == 12 ]]; then
    systemctl enable couchdb
    systemctl restart couchdb
    systemctl is-active --quiet couchdb || die "CouchDB failed to start"
else
    systemctl restart gen20-couchdb.service
    systemctl is-active --quiet gen20-couchdb.service || die "CouchDB service failed to start"
fi

PHP_VERSION="$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
PHP_FPM_SERVICE="php${PHP_VERSION}-fpm"
systemctl enable "$PHP_FPM_SERVICE"
systemctl restart "$PHP_FPM_SERVICE"
systemctl is-active --quiet "$PHP_FPM_SERVICE" || die "$PHP_FPM_SERVICE failed to start"

# --------------------------------------------------
# MARS native development dependencies
# --------------------------------------------------

say "Checking MARS development libraries..."
for package in \
    libmariadb-dev libmariadb-dev-compat libhiredis-dev \
    libyaml-cpp-dev nlohmann-json3-dev \
    libboost-system-dev libboost-thread-dev \
    libssl-dev libwebsocketpp-dev libasio-dev
do
    dpkg-query -W -f='${Status}' "$package" 2>/dev/null |
        grep -q 'install ok installed' ||
        die "Required MARS package is missing: $package"
done

# --------------------------------------------------
# Runtime verification
# --------------------------------------------------

say "Verifying infrastructure..."
mariadb-admin ping >/dev/null || die "MariaDB is not responding"
redis-cli ping | grep -q '^PONG$' || die "Redis is not responding"
php -m | grep -qi '^mysqli$' || die "PHP mysqli extension is missing"
php -m | grep -qi '^pdo_mysql$' || die "PHP PDO_MYSQL extension is missing"

COUCHDB_HTTP_CODE="$(
    curl -sS -o /dev/null -w '%{http_code}' \
        --max-time 10 http://127.0.0.1:5984/
)"
case "$COUCHDB_HTTP_CODE" in
    200|401) ok "CouchDB HTTP responding: $COUCHDB_HTTP_CODE" ;;
    *) die "CouchDB HTTP check failed: $COUCHDB_HTTP_CODE" ;;
esac

# --------------------------------------------------
# Versions
# --------------------------------------------------

say "Installed runtime versions:"
printf '  Node.js: '; node --version
printf '  npm: '; npm --version
printf '  Yarn: '; yarn --version
printf '  PHP CLI: '; php --version | head -n 1
printf '  PHP FPM: '; "/usr/sbin/php-fpm${PHP_VERSION}" -v 2>/dev/null | head -n 1
printf '  Python: '; python3 --version
printf '  pip: '; python3 -m pip --version
printf '  Go: '; go version
printf '  GCC: '; g++ --version | head -n 1
printf '  CMake: '; cmake --version | head -n 1
printf '  MariaDB: '; mariadb --version
printf '  Redis: '; redis-server --version
printf '  Nginx: '; nginx -v 2>&1
if [[ "$VERSION_ID" == 12 ]]; then
    printf '  CouchDB: '; dpkg-query -W -f='${Version}\n' couchdb
else
    printf '  CouchDB image: %s\n' "$COUCHDB_IMAGE"
fi

say "GEN20 Galaxy base infrastructure is installed and running."
say "MariaDB, Redis, CouchDB, Nginx and PHP-FPM are active."
warn "No domains, Nginx virtual hosts, TLS certificates, application databases, database users or application services were configured."
warn "KRONOS requirements.txt is not installed automatically; it may contain heavyweight ML/CUDA packages."
say "Next: review MARS configuration, then run 'make -C $GS_ROOT/mars'."
