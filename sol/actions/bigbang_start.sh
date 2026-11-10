#!/usr/bin/env bash
# GEN20 GALAXY BIGBANG
# Base infrastructure bootstrap for Debian 12 (Bookworm) and Debian 13 (Trixie).
# Installs system runtimes and development libraries used by SOL, MOON, GOD,
# KRONOS, ERMIS and MARS. Does not configure domains, credentials or app services.

set -Eeuo pipefail

GS_ROOT="${GS_ROOT:-/var/www/gs}"
LOG_DIR="${GS_LOG_DIR:-$GS_ROOT/data/gen20.net}"
LOG_FILE="${GS_LOG_FILE:-$LOG_DIR/bigbang.log}"
NODE_MAJOR=20
YARN_VERSION="4.14.1"

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RESET='\033[0m'

say()  { printf "${CYAN}[BIGBANG]${RESET} %s\n" "$*"; }
ok()   { printf "${GREEN}[OK]${RESET} %s\n" "$*"; }
warn() { printf "${YELLOW}[WARN]${RESET} %s\n" "$*" >&2; }
die()  { printf "${RED}[ERROR]${RESET} %s\n" "$*" >&2; exit 1; }

if [[ $EUID -ne 0 ]]; then
    die "Run as root: sudo bash sol/bigbang.sh"
fi

[[ -f /etc/os-release ]] || die "/etc/os-release not found"
# shellcheck disable=SC1091
source /etc/os-release

case "${ID:-}" in
    debian) ;;
    *) die "Supported operating system: Debian 12/13. Detected: ${PRETTY_NAME:-unknown}" ;;
esac

case "${VERSION_ID:-}" in
    12|13) ;;
    *) die "Supported Debian releases: 12 (Bookworm) and 13 (Trixie). Detected: ${VERSION_ID:-unknown}" ;;
esac

case "$(dpkg --print-architecture)" in
    amd64|arm64) ;;
    *) die "Unsupported architecture: $(dpkg --print-architecture). Supported: amd64, arm64." ;;
esac

mkdir -p "$LOG_DIR"
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1

trap 'rc=$?; printf "\n[BIGBANG] Failed at line %s (exit %s). Log: %s\n" "$LINENO" "$rc" "$LOG_FILE" >&2; exit "$rc"' ERR

say "GEN20 Galaxy infrastructure bootstrap"
say "OS: $PRETTY_NAME | Architecture: $(dpkg --print-architecture)"
say "Root: $GS_ROOT"
say "Log: $LOG_FILE"

export DEBIAN_FRONTEND=noninteractive

say "Refreshing APT metadata..."
apt-get update

BASE_PACKAGES=(
    ca-certificates curl wget gnupg lsb-release apt-transport-https
    git rsync unzip zip xz-utils jq tree
    build-essential make cmake pkg-config
    gcc g++ clang
    openssl libssl-dev
    python3 python3-dev python3-venv python3-pip python3-wheel
    nginx
    mariadb-server mariadb-client libmariadb-dev libmariadbcpp-dev
    redis-server redis-tools libhiredis-dev
    libyaml-cpp-dev nlohmann-json3-dev
    libboost-system-dev libboost-thread-dev
    libwebsocketpp-dev libasio-dev
    libcurl4-openssl-dev
    php8.2-cli php8.2-fpm php8.2-mysql php8.2-curl php8.2-mbstring php-xml
    php8.2-zip php8.2-gd php8.2-intl php8.2-bcmath php8.2-opcache
    php8.2-redis php8.2-apcu
    golang-go
    supervisor
    procps psmisc lsof net-tools iproute2
    couchdb
)

say "Installing base system packages..."
apt-get install -y --no-install-recommends "${BASE_PACKAGES[@]}"

# GOD's go.mod currently declares Go 1.26.0. Debian 12/13 APT versions
# can be older, so install the latest official Go 1.26 patch when required.
go_version_number() {
    go version 2>/dev/null | awk '{print $3}' | sed 's/^go//'
}

GO_CURRENT="$(go_version_number || true)"
if [[ -z "$GO_CURRENT" ]] || [[ "$(printf '%s\n' "$GO_CURRENT" "1.26.0" | sort -V | head -n 1)" != "1.26.0" ]]; then
    say "Installing official Go 1.26 release required by GOD..."
    case "$(dpkg --print-architecture)" in
        amd64) GO_ARCH="amd64" ;;
        arm64) GO_ARCH="arm64" ;;
        *) die "No Go 1.26 bootstrap mapping for this architecture." ;;
    esac

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

    if [[ ! -e /usr/local/bin/go || ( -L /usr/local/bin/go && "$(readlink -f /usr/local/bin/go)" == "/opt/gen20/go1.26/bin/go" ) ]]; then
        ln -sfn /opt/gen20/go1.26/bin/go /usr/local/bin/go
    else
        warn "/usr/local/bin/go already exists; Go 1.26 installed at /opt/gen20/go1.26/bin/go without replacing it."
    fi
    if [[ ! -e /usr/local/bin/gofmt || ( -L /usr/local/bin/gofmt && "$(readlink -f /usr/local/bin/gofmt)" == "/opt/gen20/go1.26/bin/gofmt" ) ]]; then
        ln -sfn /opt/gen20/go1.26/bin/gofmt /usr/local/bin/gofmt
    fi
fi

# Node.js 20 is required by the Moon/Vite workspaces.
node_major() {
    command -v node >/dev/null 2>&1 || return 1
    node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null
}

CURRENT_NODE="$(node_major || true)"
if [[ ! $CURRENT_NODE =~ ^[0-9]+$ ]] || (( CURRENT_NODE != NODE_MAJOR )); then
    say "Installing Node.js ${NODE_MAJOR}.x from the NodeSource Debian repository..."
    install -d -m 0755 /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
    chmod 0644 /etc/apt/keyrings/nodesource.gpg
    printf 'deb [arch=%s signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_%s.x nodistro main\n' \
        "$(dpkg --print-architecture)" "$NODE_MAJOR" \
        > /etc/apt/sources.list.d/nodesource.list
    apt-get update
    apt-get install -y nodejs
fi

command -v node >/dev/null 2>&1 || die "Node.js installation failed"
[[ "$(node_major)" == "$NODE_MAJOR" ]] || die "Node.js ${NODE_MAJOR}.x is required; found $(node --version)"

say "Activating Corepack and Yarn ${YARN_VERSION}..."
if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare "yarn@${YARN_VERSION}" --activate
else
    npm install --global "yarn@${YARN_VERSION}"
fi

# Create the standard KRONOS virtual environment without replacing an existing one.
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
    warn "KRONOS directory not found at $GS_ROOT/kronos; Python venv creation skipped."
fi

# Verify the native MARS toolchain and its link dependencies.
say "Checking MARS development libraries..."
for package in libmariadb-dev libmariadbcpp-dev libhiredis-dev libyaml-cpp-dev nlohmann-json3-dev \
               libboost-system-dev libboost-thread-dev libssl-dev libwebsocketpp-dev libasio-dev; do
    dpkg-query -W -f='${Status}' "$package" 2>/dev/null | grep -q 'install ok installed' \
        || die "Required MARS package is missing: $package"
done

say "Installed runtime versions:"
printf '  Node.js: '; node --version
printf '  npm: '; npm --version
printf '  Yarn: '; yarn --version
printf '  PHP CLI: '; php --version | head -n 1
printf '  PHP FPM: '; for fpm_bin in /usr/sbin/php-fpm*; do [[ -x "$fpm_bin" ]] && { "$fpm_bin" -v 2>/dev/null | head -n 1; break; }; done
printf '  Python: '; python3 --version
printf '  pip: '; python3 -m pip --version
printf '  Go: '; go version
printf '  GCC: '; g++ --version | head -n 1
printf '  CMake: '; cmake --version | head -n 1
printf '  MariaDB: '; mariadb --version
printf '  Redis: '; redis-server --version
printf '  Nginx: '; nginx -v 2>&1

say "Galaxy base infrastructure is installed."
warn "No domains, Nginx virtual hosts, TLS certificates, database users, secrets or application services were modified."
warn "KRONOS requirements.txt is not installed automatically; it contains heavyweight ML/CUDA packages."

say "Next: run 'make -C $GS_ROOT/mars' to build MARS after reviewing its configuration."
