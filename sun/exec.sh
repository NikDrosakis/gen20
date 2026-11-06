#!/bin/bash
# /var/www/gs/sun/exec.sh

set -u
set -o pipefail

source "$(dirname "$0")/init.sh"

# ==============================================
# Helpers
# ==============================================
run_step() {
    local script="$1"
    local label="${2:-$(basename "$script")}"

    if [ ! -f "$script" ]; then
        log_action "WARN: missing $label ($script)"
        return 1
    fi
    if [ ! -x "$script" ]; then
        log_action "WARN: not executable $label ($script)"
        return 1
    fi

    log_action "RUN: $label"
    if "$script" 2>&1 | tee -a "$GEN_LOG_FILE"; then
        log_action "OK: $label"
        return 0
    else
        log_action "FAIL: $label (exit $?)"
        return 1
    fi
}

run_php() {
    local script="$1"
    shift
    local args=("$@")

    if [ ! -f "$script" ]; then
        log_action "WARN: missing PHP script ($script)"
        return 1
    fi

    log_action "RUN: php $script ${args[*]:-}"
    if php "$script" "${args[@]}" 2>&1 | tee -a "$GEN_LOG_FILE"; then
        log_action "OK: php $(basename "$script")"
        return 0
    else
        log_action "FAIL: php $(basename "$script") (exit $?)"
        return 1
    fi
}

run_sub() {
    local level="$1"
    local sub="$2"
    shift 2
    local args=("$@")

    local script="$SUN_DIR/com/$level/$sub.sh"
    if [ ! -f "$script" ]; then
        log_action "ERROR: $script not found"
        return 1
    fi
    run_step "$script" "$level/$sub"
}

# Helper: τρέχει μια απλή εντολή και λογγάρει
run_cmd() {
    local label="$1"
    shift
    log_action "RUN: $label"
    if "$@" 2>&1 | tee -a "$GEN_LOG_FILE"; then
        log_action "OK: $label"
        return 0
    else
        log_action "FAIL: $label (exit $?)"
        return 1
    fi
}

# ==============================================
# Main executor
# ==============================================
execute_command() {
    local cmd="$1"
    local target="${2:-}"
    shift 2 2>/dev/null || true
    local args=("$@")

    log_action "EXEC: $cmd $target ${args[*]:-}"

    case "$cmd" in

        # ==============================================
        # COMPONENTS (σύνθετα)
        # ==============================================
        "build")
            log_action "Building component: $target..."
            if [ -f "$SUN_DIR/com/$target/install.sh" ]; then
                run_step "$SUN_DIR/com/$target/install.sh" "build/$target"
            else
                log_action "ERROR: Component $target not found."
                return 1
            fi
            ;;

        "gaia")
            log_action "Running gaia: $target ${args[*]:-}"
            run_php "$SUN_DIR/com/gaia/index.php" "$target" "${args[@]}"
            ;;

        "god")
            run_step "$SUN_DIR/com/god/start.sh" "god"
            ;;

        "kronos")
            run_step "$SUN_DIR/com/kronos/start.sh" "kronos"
            ;;

        "mars")
            run_step "$SUN_DIR/com/mars/start.sh" "mars"
            ;;

        "npm")
            run_step "$SUN_DIR/com/npm/publish.sh" "npm/publish"
            ;;

        "composer")
            run_step "$SUN_DIR/com/gaia/composer.sh" "gaia/composer"
            ;;

        "ai")
            if [ -n "$target" ]; then
                run_sub "ai" "$target" "${args[@]}"
            else
                run_step "$SUN_DIR/com/ai/init.sh" "ai/init"
            fi
            ;;

        "chat")
            if [ -n "$target" ]; then
                run_sub "chat" "$target" "${args[@]}"
            else
                run_step "$SUN_DIR/com/chat/init.sh" "chat/init"
            fi
            ;;

        "ws")
            if [ -n "$target" ]; then
                run_sub "ws" "$target" "${args[@]}"
            else
                run_step "$SUN_DIR/com/ws/status.sh" "ws/status"
            fi
            ;;

        "domain")
            if [ -n "$target" ]; then
                run_sub "domain" "$target" "${args[@]}"
            else
                run_step "$SUN_DIR/com/domain/init.sh" "domain/init"
            fi
            ;;

        # ==============================================
        # UTILS (σύνθετα → utils/*.sh)
        # ==============================================
        "permissions")
            run_step "$SUN_DIR/utils/permissions.sh" "utils/permissions"
            ;;
        "kill")
            run_step "$SUN_DIR/utils/kill.sh" "utils/kill"
            ;;
        "install")
            run_step "$SUN_DIR/utils/install.sh" "utils/install"
            ;;
        "presetup")
            run_step "$SUN_DIR/utils/presetup.sh" "utils/presetup"
            ;;
        "backup")
            run_step "$SUN_DIR/utils/backup.sh" "utils/backup"
            ;;
        "systems:status")
            run_step "$SUN_DIR/utils/systems_status.sh" "utils/systems_status"
            ;;
        "metadata")
            run_step "$SUN_DIR/utils/metadata.sh" "utils/metadata"
            ;;

        # ==============================================
        # SIMPLE EXECUTABLES (inline — χωρίς utils/)
        # ==============================================

        # ---------- Tree ----------
        "tree")
            run_cmd "tree" tree -L 2 -d "$ROOT"
            ;;

        # ---------- status----------
        "status")
            log_action "RUN: status"
            {
                echo "=== Systemd services ==="
                for svc in nginx mariadb redis-server php8.2-fpm cron; do
                    if systemctl is-active --quiet "$svc" 2>/dev/null; then
                        echo "  ✅ $svc: active"
                    else
                        echo "  ❌ $svc: inactive/failed"
                    fi
                done

                echo ""
                echo "=== Gen apps (ports) ==="
                for entry in "god:3008" "kronos:3006" "mars:3004" "ermis:3010" "cubos-react:3000"; do
                    name="${entry%%:*}"
                    port="${entry##*:}"
                    if ss -tulnp 2>/dev/null | grep -q ":$port "; then
                        echo "  ✅ $name (port $port): listening"
                    else
                        echo "  ❌ $name (port $port): not listening"
                    fi
                done

                echo ""
                echo "=== Gen daemon ==="
                if [ -f "$SUN_DIR/gen.pid" ] && kill -0 "$(cat "$SUN_DIR/gen.pid")" 2>/dev/null; then
                    echo "  ✅ gen-daemon: running (PID $(cat "$SUN_DIR/gen.pid"))"
                else
                    echo "  ❌ gen-daemon: not running"
                fi

                echo ""
                echo "=== DB checks ==="
                if command -v mariadb >/dev/null 2>&1; then
                    if mariadb -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "SELECT 1" >/dev/null 2>&1; then
                        echo "  ✅ MariaDB: reachable"
                    else
                        echo "  ❌ MariaDB: unreachable"
                    fi
                fi
                if command -v redis-cli >/dev/null 2>&1; then
                    if redis-cli ping >/dev/null 2>&1; then
                        echo "  ✅ Redis: reachable"
                    else
                        echo "  ❌ Redis: unreachable"
                    fi
                fi
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: status"
            ;;
        # ---------- Report ----------
        "report")
            log_action "RUN: report"
            {
                echo "=== API endpoints ==="
                for url in \
                    "https://gen20.net/api/v1/local/" \
                    "https://gen20.net/god/v1/" \
                    "https://gen20.net/god/v1/ws" \
                    "https://gen20.net/apy/v1/" \
                    "https://gen20.net/ermis/v1/" \
                    "https://gen20.net/cubos/react/" \
                    "https://gen20.net/admin/"; do
                    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
                    if [ "$code" = "200" ] || [ "$code" = "204" ]; then
                        echo "  ✅ $url → $code"
                    else
                        echo "  ❌ $url → $code"
                    fi
                done

                echo ""
                echo "=== Nginx config test ==="
                if sudo nginx -t 2>/dev/null; then
                    echo "  ✅ nginx -t: OK"
                else
                    echo "  ❌ nginx -t: FAILED"
                fi

                echo ""
                echo "=== Systemd services ==="
                for svc in nginx mariadb redis-server php8.2-fpm; do
                    systemctl is-active --quiet "$svc" 2>/dev/null \
                        && echo "  ✅ $svc: active" \
                        || echo "  ❌ $svc: inactive"
                done

                echo ""
                echo "=== Gen daemon ==="
                [ -f "$SUN_DIR/gen.pid" ] && kill -0 "$(cat "$SUN_DIR/gen.pid")" 2>/dev/null \
                    && echo "  ✅ gen-daemon: running" \
                    || echo "  ❌ gen-daemon: not running"

                echo ""
                echo "=== Log files ==="
                ls -la "$ROOT/data/gen20.net/" 2>/dev/null || echo "  (no logs yet)"
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: report"
            ;;
        # ---------- Health ----------
        "health")
            log_action "RUN: health"
            score=0
            total=0
            {
                echo "=== Health check ==="

                # Systemd
                for svc in nginx mariadb redis-server php8.2-fpm; do
                    total=$((total+1))
                    if systemctl is-active --quiet "$svc" 2>/dev/null; then
                        score=$((score+1))
                        echo "  ✅ $svc"
                    else
                        echo "  ❌ $svc"
                    fi
                done

                # Ports
                for entry in "god:3008" "kronos:3006" "mars:3004" "ermis:3010"; do
                    total=$((total+1))
                    name="${entry%%:*}"; port="${entry##*:}"
                    if ss -tulnp 2>/dev/null | grep -q ":$port "; then
                        score=$((score+1))
                        echo "  ✅ $name ($port)"
                    else
                        echo "  ❌ $name ($port)"
                    fi
                done

                # API
                total=$((total+1))
                code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://gen20.net/api/v1/local/" 2>/dev/null || echo "000")
                [ "$code" = "200" ] && { score=$((score+1)); echo "  ✅ API /local/ ($code)"; } || echo "  ❌ API /local/ ($code)"

                # gen-daemon
                total=$((total+1))
                if [ -f "$SUN_DIR/gen.pid" ] && kill -0 "$(cat "$SUN_DIR/gen.pid")" 2>/dev/null; then
                    score=$((score+1)); echo "  ✅ gen-daemon"
                else
                    echo "  ❌ gen-daemon"
                fi

                pct=$((score * 100 / total))
                echo ""
                echo "=== Score: $score/$total ($pct%) ==="
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: health ($score/$total)"
            [ "$score" -eq "$total" ] && return 0 || return 1
            ;;
        # ---------- Logs ----------
        "logs")
            log_action "RUN: logs"
            {
                echo "=== Logs in $ROOT/data/gen20.net/ ==="
                if [ -d "$ROOT/data/gen20.net" ]; then
                    ls -lah "$ROOT/data/gen20.net/"
                else
                    echo "  (directory does not exist)"
                fi
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: logs"
            ;;
          "log:rotate")
              log_action "RUN: log:rotate"
              {
                  echo "=== Rotating logs in $ROOT/data/gen20.net/ ==="
                  for f in "$ROOT/data/gen20.net"/*.txt; do
                      [ -e "$f" ] || continue
                      size=$(stat -c%s "$f" 2>/dev/null || echo 0)
                      if [ "$size" -gt $((10*1024*1024)) ]; then
                          mv "$f" "${f}.$(date +%Y%m%d%H%M%S)"
                          echo "  ✅ rotated $(basename "$f") ($size bytes)"
                      else
                          echo "  - $(basename "$f"): $size bytes (skip)"
                      fi
                  done
              } 2>&1 | tee -a "$GEN_LOG_FILE"
              log_action "OK: log:rotate"
              ;;
        # ---------- Top ----------
        "top")
            run_cmd "top" ps -eo pid,user,%cpu,%mem,command --sort=-%cpu
            ;;

        # ---------- Ports ----------
        "ports:map")
            log_action "RUN: ports:map"
            {
                echo "=== Port map ==="
                for entry in \
                    "nginx:80,443" \
                    "mariadb:3306" \
                    "redis:6379" \
                    "god:3008" \
                    "kronos:3006" \
                    "mars:3004" \
                    "ermis:3010" \
                    "cubos-react:3000" \
                    "arango:8529"; do
                    name="${entry%%:*}"
                    ports="${entry##*:}"
                    for p in ${ports//,/ }; do
                        if ss -tulnp 2>/dev/null | grep -q ":$p "; then
                            echo "  ✅ $name → :$p"
                        else
                            echo "  ❌ $name → :$p (not listening)"
                        fi
                    done
                done
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: ports:map"
            ;;
        # ---------- Performance ----------
        "performance")
            log_action "RUN: performance"
            {
                echo "=== CPU Load ==="
                uptime
                echo ""
                echo "=== Memory Usage ==="
                free -m
                echo ""
                echo "=== Disk Usage ==="
                df -h
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: performance"
            ;;

        # ---------- Ports ----------
        "ports")
            run_cmd "ports" bash -c "netstat -tulnp 2>/dev/null | grep LISTEN || ss -tulnp | grep LISTEN"
            ;;

        # ---------- Find large ----------
        "find:large")
            run_cmd "find:large" bash -c "sudo find / -type f -size +500M -exec ls -lh {} \; 2>/dev/null"
            ;;

        # ---------- History grep ----------
        "history:grep")
            if [ -z "$target" ]; then
                log_action "ERROR: history:grep needs a keyword"
                echo "Usage: gen history:grep <keyword>"
                return 1
            fi
            run_cmd "history:grep" bash -c "history | grep --color=auto '$target'"
            ;;

        # ---------- Net info ----------
        "net:info")
            log_action "RUN: net:info"
            {
                echo "Public IP: $(curl -s ifconfig.me)"
                echo "DNS Resolvers: $(grep nameserver /etc/resolv.conf)"
                echo "Active Interfaces:"
                ip -brief a
                echo "Open Network Ports:"
                sudo netstat -tulnp 2>/dev/null | grep LISTEN || ss -tulnp | grep LISTEN
            } 2>&1 | tee -a "$GEN_LOG_FILE"
            log_action "OK: net:info"
            ;;

        # ---------- Net speed ----------
        "net:speed")
            if ! command -v speedtest >/dev/null 2>&1; then
                log_action "ERROR: speedtest not installed"
                return 1
            fi
            run_cmd "net:speed" speedtest
            ;;

        # ---------- Log ----------
        "log")
            if [ -z "$target" ]; then
                log_action "ERROR: log needs a filename"
                echo "Usage: gen log <filename>"
                return 1
            fi
            run_cmd "log" tail -f "$ROOT/log/$target"
            ;;

        # ---------- Magick ----------
        "magick")
            if ! command -v magick >/dev/null 2>&1; then
                log_action "ERROR: magick not installed"
                return 1
            fi
            run_cmd "magick" magick "${args[@]}"
            ;;

        # ---------- PHP lint ----------
        "php:lint")
            if [ -z "$target" ]; then
                log_action "ERROR: php:lint needs a file"
                echo "Usage: gen php:lint <file.php>"
                return 1
            fi
            run_cmd "php:lint" php -l "$target"
            ;;

        # ---------- Domain:nginx ----------
        "domain:nginx")
            run_cmd "domain:nginx" bash -c "grep -r 'server_name' /etc/nginx/conf.d/ | awk '{print \$3}' | tr -d ';'"
            ;;

        # ---------- Domain:ssl ----------
        "domain:ssl")
            run_cmd "domain:ssl" ls -1 /etc/letsencrypt/live/
            ;;

        # ---------- All (placeholder) ----------
        "all")
            log_action "GEN ALL: not implemented yet"
            ;;

        # ---------- Unknown ----------
        *)
            log_action "Unknown command: $cmd"
            return 1
            ;;
    esac
}

# ==============================================
# Entry point
# ==============================================
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    execute_command "${1:-}" "${2:-}" "${@:3}"
fi