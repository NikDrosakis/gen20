#!/usr/bin/env bash
# rima/status.sh
# GEN20 system health check.

STATUS_LOG="${STATUS_LOG:-${SOL_ROOT:-/var/www/gs}/data/gen.txt}"

# --------------------------------------------------
# OUTPUT
# --------------------------------------------------

status_result() {
    local label="$1"
    local state="$2"
    local detail="${3:-}"

    printf '%-18s [%s]' "$label" "$state"
    [[ -n $detail ]] && printf ' %s' "$detail"
    printf ''
}

status_check() {
    local label="$1"
    shift

    if "$@" >/dev/null 2>&1; then
        status_result "$label" "OK"
        return 0
    fi

    status_result "$label" "FAIL"
    return 1
}

# --------------------------------------------------
# PROCESS / PID
# --------------------------------------------------

status_pid() {
    local name="$1"
    local file="$2"
    local pid

    if [[ ! -f $file ]]; then
        status_result "$name" "STOPPED" "PID file missing"
        return 1
    fi

    pid=$(cat "$file" 2>/dev/null)

    if [[ ! "$pid" =~ ^[0-9]+$ ]] || ! kill -0 "$pid" 2>/dev/null; then
        status_result "$name" "STOPPED" "stale PID file"
        return 1
    fi

    status_result "$name" "OK" "PID $pid"
    return 0
}

status_god() {
    local pid

    pid=$(pgrep -f '^/var/www/gs/god/god$' | head -1)

    if [[ -z $pid ]]; then
        pid=$(pgrep -f 'go run.*god/main.go' | head -1)
    fi

    if [[ -n $pid ]]; then
        status_result "GOD" "OK" "PID $pid"
        return 0
    fi

    status_result "GOD" "FAIL" "process not found"
    return 1
}

# --------------------------------------------------
# DATABASES
# --------------------------------------------------

status_databases() {
    printf 'DATABASES'

    status_check "MariaDB" mariadb-admin ping --silent
    status_check "Redis" redis-cli ping
    status_check "CouchDB" curl -fsS --max-time 3 \
        http://127.0.0.1:5984/_up
}

# --------------------------------------------------
# PLANETS
# --------------------------------------------------

status_planets() {
    printf 'PLANETS'

    status_god

    status_pid "KRONOS" \
        "${KRONOS_PID:-${SOL_ROOT}/kronos/kronos.pid}"

    status_pid "MARS" \
        "${MARS_PID:-${SOL_ROOT}/mars/mars.pid}"

    status_pid "SOL DAEMON" \
        "${SOL_ROOT}/sol/gen.pid"
}

# --------------------------------------------------
# SERVICES
# --------------------------------------------------

status_services() {
    printf 'SYSTEM SERVICES'

    local service
    for service in mariadb redis-server couchdb nginx; do
        if systemctl is-active --quiet "$service"; then
            status_result "$service" "OK"
        else
            status_result "$service" "STOPPED"
        fi
    done

    local php_service
    for php_service in /etc/systemd/system/php*-fpm.service \
                       /lib/systemd/system/php*-fpm.service; do
        [[ -e $php_service ]] || continue
        service=$(basename "$php_service" .service)

        if systemctl is-active --quiet "$service"; then
            status_result "$service" "OK"
        else
            status_result "$service" "STOPPED"
        fi
    done
}

# --------------------------------------------------
# DEFAULT STATUS
# --------------------------------------------------
status() {
    local failed=0

    printf 'GEN20 SYSTEM STATUS'
    status_check "Filesystem" test -d "${SOL_ROOT:-/var/www/gs}" || ((failed++))
    status_fs || ((failed++))
    status_network || ((failed++))
    status_check "PHP" command -v php || ((failed++))
    status_check "Node" command -v node || ((failed++))
    status_check "Python" command -v python3 || ((failed++))
    status_check "Nginx" systemctl is-active --quiet nginx || ((failed++))

    printf 'DATABASES'

    status_check "MariaDB" mariadb-admin ping --silent || ((failed++))
    status_check "Redis" redis-cli ping || ((failed++))
    status_check "CouchDB" curl -fsS --max-time 3 \
        http://127.0.0.1:5984/_up || ((failed++))

    status_planets

    if ((failed == 0)); then
        printf 'STATUS: ALL CORE CHECKS PASSED'
    else
        printf 'STATUS: %s CORE CHECK(S) FAILED' "$failed"
    fi

    return "$((failed > 0))"
}

# DETAILED CHECKS

status_preflight() {
    printf 'SYSTEM PREFLIGHT'
    printf '--- OS ---'
    cat /etc/os-release
    uname -a
    uptime

    printf '--- RUNTIMES ---'
    php -v 2>&1 | head -4
    node --version 2>&1
    python3 --version 2>&1
    go version 2>&1

    printf '--- PACKAGES ---'
    dpkg-query -W \
        -f='${binary:Package}\t${Version}' 2>/dev/null | sort

    printf '--- STORAGE ---'
    df -hT
}

status_network() {
    ss -lntup
}

status_disk() {
    df -hT
}

status_latest() {
    [[ -f $STATUS_LOG ]] || return 1
    tail -n 300 "$STATUS_LOG"
}

status_history() {
    [[ -f $STATUS_LOG ]] || return 1
    grep -n 'GEN20 SYSTEM STATUS' "$STATUS_LOG"
}


# Filesystem structure and permissions

# --------------------------------------------------
# FILESYSTEM STRUCTURE & PERMISSIONS
# --------------------------------------------------

status_fs() {
    local root="${SOL_ROOT:-/var/www/gs}"
    local expected="${GEN_USER:-dros:dros}"
    local user="${expected%%:*}"
    local dirs=(
        mars
        kronos
        data
        media
        astra
        gaia
        god
        moon
        sol
    )

    local failed=0
    local path owner mode access dir

    printf 'FILESYSTEM\n'
    printf '%-18s %-14s %-8s %s\n' \
        "DIRECTORY" "OWNER:GROUP" "MODE" "ACCESS"

    for dir in "${dirs[@]}"; do
        path="$root/$dir"

        if [[ ! -d "$path" ]]; then
            printf '%-18s %-14s %-8s %s\n' \
                "$dir" "MISSING" "-" "FAIL"
            ((failed++))
            continue
        fi

        owner=$(stat -c '%U:%G' "$path" 2>/dev/null)
        mode=$(stat -c '%a' "$path" 2>/dev/null)

        if [[ "$owner" != "$expected" ]]; then
            printf '%-18s %-14s %-8s %s\n' \
                "$dir" "$owner" "$mode" "OWNER MISMATCH"
            ((failed++))
            continue
        fi

        if ! id "$user" >/dev/null 2>&1; then
            access="USER MISSING"
        elif command -v runuser >/dev/null 2>&1 &&
             runuser -u "$user" -- test -w "$path" &&
             runuser -u "$user" -- test -x "$path"; then
            access="OK"
        else
            access="NO ACCESS"
        fi

        if [[ "$access" != "OK" ]]; then
            ((failed++))
        fi

        printf '%-18s %-14s %-8s %s\n' \
            "$dir" "$owner" "$mode" "$access"
    done

    printf '%s\n' "------------------------------------------------------------"
    printf 'Filesystem: %d issue(s)\n' "$failed"

    return "$(( failed > 0 ))"
}
