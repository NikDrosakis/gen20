#!/usr/bin/env bash
# rima/esti.sh
# GEN20 system health check.

esti_LOG="${esti_LOG:-${SOL_ROOT:-/var/www/gs}/data/gen.txt}"

# --------------------------------------------------
# OUTPUT HELPERS
# --------------------------------------------------

esti_result() {
    local label="$1"
    local state="$2"
    local detail="${3:-}"

    printf '%-18s [%s]' "$label" "$state"
    [[ -n $detail ]] && printf ' %s' "$detail"
    printf '\n'
}

esti_check() {
    local label="$1"
    shift

    if "$@" >/dev/null 2>&1; then
        esti_result "$label" "OK"
        return 0
    fi

    esti_result "$label" "FAIL"
    return 1
}

# --------------------------------------------------
# PROCESS / PID
# --------------------------------------------------

esti_pid() {
    local name="$1"
    local file="$2"
    local pid

    if [[ ! -f $file ]]; then
        esti_result "$name" "STOPPED" "PID file missing"
        return 1
    fi

    pid=$(cat "$file" 2>/dev/null)

    if [[ ! "$pid" =~ ^[0-9]+$ ]] || ! kill -0 "$pid" 2>/dev/null; then
        esti_result "$name" "STOPPED" "stale PID file"
        return 1
    fi

    esti_result "$name" "OK" "PID $pid"
    return 0
}

esti_god() {
    local pid

    # 1) όποιος ακούει στη θύρα 3008 (πιο αξιόπιστο — πιάνει και ./god και go-run temp)
    pid=$(ss -tulnp 2>/dev/null | grep ':3008 ' | grep -oE 'pid=[0-9]+' | head -1 | cut -d= -f2)
    # 2) compiled binary
    [[ -z $pid ]] && pid=$(pgrep -fx '/var/www/gs/god/god' | head -1)
    # 3) go run
    [[ -z $pid ]] && pid=$(pgrep -f 'go run .*main\.go' | head -1)

    if [[ -n $pid ]]; then
        esti_result "GOD" "OK" "PID $pid"
        return 0
    fi

    esti_result "GOD" "FAIL" "process not found"
    return 1
}

# --------------------------------------------------
# DATABASES
# --------------------------------------------------

esti_databases() {
    printf 'DATABASES\n'
    esti_check "MariaDB" mariadb-admin ping --silent
    esti_check "Redis" redis-cli ping
    esti_check "CouchDB" curl -fsS --max-time 3 http://127.0.0.1:5984/_up
}

# --------------------------------------------------
# PLANETS
# --------------------------------------------------

esti_planets() {
    printf 'PLANETS\n'

    esti_god

    esti_pid "KRONOS" \
        "${KRONOS_PID:-${SOL_ROOT}/kronos/kronos.pid}"

    esti_pid "MARS" \
        "${MARS_PID:-${SOL_ROOT}/mars/mars.pid}"

    esti_pid "SOL DAEMON" \
        "${SOL_ROOT}/sol/gen.pid"
}

# --------------------------------------------------
# SERVICES
# --------------------------------------------------

esti_services() {
    printf 'SYSTEM SERVICES\n'

    local service
    for service in mariadb redis-server couchdb nginx; do
        if systemctl is-active --quiet "$service"; then
            esti_result "$service" "OK"
        else
            esti_result "$service" "STOPPED"
        fi
    done

    local php_service
    for php_service in /etc/systemd/system/php*-fpm.service \
                       /lib/systemd/system/php*-fpm.service; do
        [[ -e $php_service ]] || continue
        service=$(basename "$php_service" .service)

        if systemctl is-active --quiet "$service"; then
            esti_result "$service" "OK"
        else
            esti_result "$service" "STOPPED"
        fi
    done
}

# --------------------------------------------------
# FILESYSTEM STRUCTURE & PERMISSIONS
# --------------------------------------------------

esti_fs() {
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

# --------------------------------------------------
# NETWORK / DISK / PREFLIGHT
# --------------------------------------------------

esti_network() {
    ss -lntup
}

esti_disk() {
    df -hT
}

esti_preflight() {
    printf 'SYSTEM PREFLIGHT\n'
    printf '--- OS ---\n'
    cat /etc/os-release
    uname -a
    uptime

    printf '\n--- RUNTIMES ---\n'
    php -v 2>&1 | head -4
    node --version 2>&1
    python3 --version 2>&1
    go version 2>&1

    printf '\n--- PACKAGES ---\n'
    dpkg-query -W \
        -f='${binary:Package}\t${Version}\n' 2>/dev/null | sort

    printf '\n--- STORAGE ---\n'
    df -hT
}

esti_latest() {
    [[ -f $esti_LOG ]] || return 1
    tail -n 300 "$esti_LOG"
}

esti_history() {
    [[ -f $esti_LOG ]] || return 1
    grep -n 'GEN20 SYSTEM esti' "$esti_LOG"
}

# --------------------------------------------------
# DEFAULT esti (full health check)
# --------------------------------------------------

esti_default() {
    local failed=0

    printf 'GEN20 SYSTEM esti\n'
    esti_check "Filesystem" test -d "${SOL_ROOT:-/var/www/gs}" || ((failed++))
    esti_check "PHP" command -v php || ((failed++))
    esti_check "Node" command -v node || ((failed++))
    esti_check "Python" command -v python3 || ((failed++))
    esti_check "Nginx" systemctl is-active --quiet nginx || ((failed++))

    esti_databases

    esti_planets

    if ((failed == 0)); then
        printf 'esti: ALL CORE CHECKS PASSED\n'
    else
        printf 'esti: %s CORE CHECK(S) FAILED\n' "$failed"
    fi

    return "$((failed > 0))"
}

# --------------------------------------------------
# DISPATCHER
# --------------------------------------------------

esti() {
    local cmd="${1:-default}"
    shift 2>/dev/null || true

    case "$cmd" in
        default|"")
            esti_default
            ;;
        fs)
            esti_fs "$@"
            ;;
        databases|db)
            esti_databases "$@"
            ;;
        services)
            esti_services "$@"
            ;;
        planets)
            esti_planets "$@"
            ;;
        network)
            esti_network "$@"
            ;;
        disk)
            esti_disk "$@"
            ;;
        preflight)
            esti_preflight "$@"
            ;;
        latest)
            esti_latest "$@"
            ;;
        history)
            esti_history "$@"
            ;;
        help|--help|-h)
            cat <<'EOF'
Usage: esti [command]

Commands:
  default       Full health check (default)
  fs            Filesystem structure & permissions
  databases     MariaDB, Redis, CouchDB
  services      systemd services
  planets       GOD, KRONOS, MARS, SOL daemon
  network       Listening ports
  disk          Disk usage
  preflight     OS, runtimes, packages
  latest        Tail of esti log
  history       History of esti runs
EOF
            ;;
        *)
            echo "Unknown esti command: $cmd" >&2
            echo "Try: esti help" >&2
            return 1
            ;;
    esac
}