#!/bin/bash
# WS — WebSocket client για το GOD messaging hub
# Source-only. Όλες οι εκφράσεις είναι functions: ws_<verb>.

WS_URL="${WS_URL:-wss://gen20.net/god/v1/messaging/ws}"
WS_USER="${WS_USER:-sol:1}"
WS_SYSTEM="${WS_SYSTEM:-sol}"

ws_about() { printf '%s\n' 'WS | WebSocket client για το GOD messaging hub'; }
ws_esti()  { ws_help; }
ws_help()  {
    printf '%s\n' \
        'WS — WebSocket client' \
        '' \
        'Usage:' \
        '  ws send <message> --to <user> [--cast one|all]' \
        '  ws interactive --to <user>' \
        '  ws test'
}

ws_uri() {
    local encoded
    encoded=$(printf '%s' "$WS_USER" | jq -sRr @uri)
    printf '%s?userid=%s\n' "$WS_URL" "$encoded"
}

ws_cid() {
    local a="$1" b="$2"
    if [[ "$a" < "$b" ]]; then
        printf '%s-%s\n' "$a" "$b"
    else
        printf '%s-%s\n' "$b" "$a"
    fi
}

ws_send() {
    local msg=""
    local to=""
    local cast="all"

    while (($#)); do
        case "$1" in
            --to)    to="$2"; shift 2 ;;
            --cast)  cast="$2"; shift 2 ;;
            *)       msg="$1"; shift ;;
        esac
    done

    [[ -n $msg && -n $to ]] || {
        printf 'Usage: ws send <msg> --to <user> [--cast one|all]\n' >&2
        return 1
    }

    if ! command -v websocat >/dev/null 2>&1; then
        printf '❌ websocat not installed\n' >&2
        return 1
    fi

    local cid
    cid=$(ws_cid "$WS_USER" "$to")

    local payload
    payload=$(jq -cn \
        --arg system "$WS_SYSTEM" \
        --arg type "message" \
        --arg cid "$cid" \
        --arg userid "$WS_USER" \
        --arg to "$to" \
        --arg cast "$cast" \
        --arg c "$msg" \
        --argjson timestamp "$(date +%s)" \
        '{
            system: $system,
            type: $type,
            cid: $cid,
            userid: $userid,
            to: $to,
            cast: $cast,
            c: $c,
            timestamp: $timestamp
        }')

    local uri
    uri=$(ws_uri)

    printf '🔌 %s\n' "$uri"
    printf '📤 %s\n' "$payload"
    printf '%s\n' "$payload" | websocat -t -1 "$uri"
}

ws_interactive() {
    local to=""

    while (($#)); do
        case "$1" in
            --to) to="$2"; shift 2 ;;
            *)    shift ;;
        esac
    done

    if ! command -v websocat >/dev/null 2>&1; then
        printf '❌ websocat not installed\n' >&2
        return 1
    fi

    if [[ -z $to ]]; then
        printf '❌ --to required (π.χ. --to kronos:1)\n' >&2
        return 1
    fi

    local uri
    uri=$(ws_uri)

    local cid
    cid=$(ws_cid "$WS_USER" "$to")

    printf '╔══════════════════════════════════════════════════════╗\n'
    printf '║  WS INTERACTIVE                                      ║\n'
    printf '╠══════════════════════════════════════════════════════╣\n'
    printf '║  uri: %-46s ║\n' "$uri"
    printf '║  to:  %-46s ║\n' "$to"
    printf '║  cid: %-46s ║\n' "$cid"
    printf '╚══════════════════════════════════════════════════════╝\n'
    printf '\n'
    printf 'Type messages, Ctrl-D to exit\n'
    printf 'Commands: /quit, /to <user>, /ping\n\n'

    # Background: διαβάζει από WS και τυπώνει
    (
        websocat -t "$uri" 2>/dev/null | while IFS= read -r line; do
            [[ -z $line ]] && continue
            if printf '%s' "$line" | jq empty 2>/dev/null; then
                local uid msg_text
                uid=$(printf '%s' "$line" | jq -r '.userid // .uid // "?"')
                msg_text=$(printf '%s' "$line" | jq -r '.c // .msg // ""')
                printf '\n\033[1;36m📥 %s:\033[0m %s\n> ' "$uid" "$msg_text"
            else
                printf '\n\033[1;36m📥\033[0m %s\n> ' "$line"
            fi
        done
    ) &
    local reader_pid=$!

    trap "kill $reader_pid 2>/dev/null; trap - INT TERM EXIT; return 0" INT TERM EXIT

    local line
    while IFS= read -r -p "> " line; do
        [[ -z $line ]] && continue

        case "$line" in
            /quit|/exit) break ;;
            /to\ *)
                to="${line#/to }"
                cid=$(ws_cid "$WS_USER" "$to")
                printf '📬 to: %s (cid: %s)\n' "$to" "$cid"
                continue
                ;;
            /ping) line="ping" ;;
        esac

        local payload
        payload=$(jq -cn \
            --arg system "$WS_SYSTEM" \
            --arg type "message" \
            --arg cid "$cid" \
            --arg userid "$WS_USER" \
            --arg to "$to" \
            --arg cast "one" \
            --arg c "$line" \
            --argjson timestamp "$(date +%s)" \
            '{
                system: $system,
                type: $type,
                cid: $cid,
                userid: $userid,
                to: $to,
                cast: $cast,
                c: $c,
                timestamp: $timestamp
            }')

        printf '%s\n' "$payload" | websocat -t -1 "$uri" 2>/dev/null || {
            printf '❌ send failed\n' >&2
        }
    done

    kill "$reader_pid" 2>/dev/null
    trap - INT TERM EXIT
    printf '\n👋 bye\n'
}

ws_test() {
    ws_send "hello from SOL" --to "god:1"
}