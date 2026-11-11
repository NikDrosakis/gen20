#!/usr/bin/env bash
# SOL Action: Preflight
# Writes the complete execution output to the GEN20 platform log.
preflight_probe() {
    local label="$1"
    shift

    local output
    local rc

    printf '\n--- %s ---\n' "$label"

    if ! command -v "$1" >/dev/null 2>&1; then
        printf 'NOT INSTALLED: %s\n' "$1"
        return 0
    fi

    output=$("$@" 2>&1)
    rc=$?

    if [[ -n $output ]]; then
        printf '%s\n' "$output" | sed -n '1,8p'
    else
        printf '(no output)\n'
    fi

    printf 'Exit status: %s\n' "$rc"
}

preflight_php_fpm() {
    local binary
    local found=0

    printf '\n--- PHP-FPM ---\n'

    for binary in \
        /usr/sbin/php-fpm \
        /usr/sbin/php-fpm[0-9]* \
        /usr/bin/php-fpm \
        /usr/bin/php-fpm[0-9]*
    do
        [[ -x $binary && ! -d $binary ]] || continue

        found=1
        printf '\nBinary: %s\n' "$binary"
        "$binary" -v 2>&1 | sed -n '1,4p'
    done

    ((found)) || printf 'NOT INSTALLED: PHP-FPM\n'
}

preflight_services() {
    printf '\n--- RUNNING SYSTEMD SERVICES ---\n'

    if command -v systemctl >/dev/null 2>&1; then
        systemctl list-units \
            --type=service \
            --state=running \
            --no-pager \
            --no-legend 2>&1 | sed -n '1,35p'
    else
        printf 'systemctl not available\n'
    fi
}

preflight_network() {
    printf '\n--- LISTENING TCP PORTS ---\n'

    if command -v ss >/dev/null 2>&1; then
        ss -lnt 2>&1 | sed -n '1,35p'
    elif command -v netstat >/dev/null 2>&1; then
        netstat -lnt 2>&1 | sed -n '1,35p'
    else
        printf 'Neither ss nor netstat is installed\n'
    fi
}

preflight_disk() {
    printf '\n--- FILESYSTEMS ---\n'
    df -hT 2>&1 | sed -n '1,20p'
}

preflight_run() {
    local log
    local host
    local started
    local rc

    log="${GEN_LOG_FILE:-${SOL_ROOT}/data/gen.txt}"

    if ! mkdir -p -- "$(dirname -- "$log")"; then
        printf 'PREFLIGHT: cannot create log directory\n' >&2
        return 1
    fi

    host=$(hostname 2>/dev/null || printf 'unknown')
    started=$(date --iso-8601=seconds 2>/dev/null || date)

    {
        printf '\n'
        printf '==================================================\n'
        printf 'GEN20 PREFLIGHT START\n'
        printf 'Date: %s\n' "$started"
        printf 'Host: %s\n' "$host"
        printf 'User: %s\n' "${USER:-unknown}"
        printf '==================================================\n'

        printf '\n--- OPERATING SYSTEM ---\n'
        preflight_probe 'OS RELEASE' cat /etc/os-release
        preflight_probe 'KERNEL' uname -a
        preflight_probe 'ARCHITECTURE' uname -m
        preflight_probe 'UPTIME' uptime
        preflight_probe 'HOSTNAME' hostname

        printf '\n--- PHP ---\n'
        preflight_probe 'PHP CLI' php -v
        preflight_probe 'PHP MODULES' php -m
        preflight_php_fpm

        printf '\n--- JAVASCRIPT ---\n'
        preflight_probe 'NODE.JS' node --version
        preflight_probe 'NPM' npm --version
        preflight_probe 'YARN' yarn --version
        preflight_probe 'COREPACK' corepack --version

        printf '\n--- PYTHON ---\n'
        preflight_probe 'PYTHON 3' python3 --version
        preflight_probe 'PIP' pip3 --version
        preflight_probe 'VIRTUALENV' virtualenv --version

        printf '\n--- GO ---\n'
        preflight_probe 'GO' go version
        preflight_probe 'GOPATH' go env GOPATH
        preflight_probe 'GOROOT' go env GOROOT

        printf '\n--- C / C++ TOOLCHAIN ---\n'
        preflight_probe 'GCC' gcc --version
        preflight_probe 'G++' g++ --version
        preflight_probe 'MAKE' make --version
        preflight_probe 'CMAKE' cmake --version
        preflight_probe 'PKG-CONFIG' pkg-config --version

        printf '\n--- DATABASES ---\n'
        preflight_probe 'MARIADB' mariadb --version
        preflight_probe 'MYSQL' mysql --version
        preflight_probe 'REDIS' redis-cli --version
        preflight_probe 'SQLITE' sqlite3 --version

        printf '\n--- WEB AND SYSTEM TOOLS ---\n'
        preflight_probe 'NGINX' nginx -v
        preflight_probe 'GIT' git --version
        preflight_probe 'CURL' curl --version
        preflight_probe 'WGET' wget --version
        preflight_probe 'OPENSSL' openssl version
        preflight_probe 'SSH' ssh -V

        printf '\n--- RUNNING SERVICES ---\n'
        preflight_services

        printf '\n--- NETWORK ---\n'
        preflight_network

        printf '\n--- STORAGE ---\n'
        preflight_disk

        printf '\n--- INSTALLED DEBIAN PACKAGES ---\n'

        if command -v dpkg-query >/dev/null 2>&1; then
            dpkg-query -W \
                -f='${binary:Package}\t${Version}\n' \
                2>&1 | sort
        else
            printf 'dpkg-query not available\n'
        fi

        printf '\n==================================================\n'
        printf 'GEN20 PREFLIGHT COMPLETE\n'
        printf 'Date: %s\n' "$(date --iso-8601=seconds 2>/dev/null || date)"
        printf '==================================================\n'

    } 2>&1 | tee -a "$log"

    rc=${PIPESTATUS[0]}

    return "$rc"
}

preflight_latest() {
    local log
    log="${GEN_LOG_FILE:-${SOL_ROOT}/data/gen.txt}"

    if [[ ! -f $log ]]; then
        printf 'Platform log not found: %s\n' "$log"
        return 1
    fi

    sed -n '/GEN20 PREFLIGHT START/,$p' "$log" | tail -n 300
}

preflight_history() {
    local log
    log="${GEN_LOG_FILE:-${SOL_ROOT}/data/gen.txt}"

    if [[ ! -f $log ]]; then
        printf 'Platform log not found: %s\n' "$log"
        return 1
    fi

    grep -n 'GEN20 PREFLIGHT START\|GEN20 PREFLIGHT COMPLETE' "$log"
}
