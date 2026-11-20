#!/bin/bash
# rima/token.sh — auth tokens για την επικοινωνία sol > god
# Source-only. Φορτώνεται από το gen.sh (όπως build.sh, bigbang.sh).
#
# Διαχειρίζεται τα μυστικά:
#   SOL_TOKEN        (/var/www/gs/.env)      — στέλνει ο gen-daemon ως X-Sol-Token
#   SOL_WS_TOKEN     (/var/www/gs/god/.env)  — ελέγχει ο god στο /god/v1/sol/ws
#   GOD_SHARED_SECRET (/var/www/gs/god/.env) — HMAC secret για το /god/v1/messaging/ws
#
# Χρήση:
#   token            → συγχρονίζει (sync) τα secrets
#   token sync       → ίδιο με το σκέτο token
#   token new        → νέα τυχαία secrets και στα δύο αρχεία
#   token status     → δείχνει αν ταιριάζουν
#   token mint <db>  → τυπώνει signed token (HMAC) για το messaging/ws

token() {
    local cmd="${1:-sync}"
    local sol_env="$SOL_ROOT/.env"
    local god_env="$SOL_ROOT/god/.env"

    case "$cmd" in
        sync|"")
            __token_sync "$sol_env" "$god_env"
            ;;
        new|rotate)
            __token_new "$sol_env" "$god_env"
            ;;
        status)
            __token_status "$sol_env" "$god_env"
            ;;
        mint)
            __token_mint "$sol_env" "$god_env" "${2:-}" "${3:-1}" "${4:-system}"
            ;;
        *)
            printf 'Usage: token [sync|new|status|mint <db> [uid] [role]]\n' >&2
            return 1
            ;;
    esac
}

# --- helpers ---

__token_rand_hex() {
    local n="${1:-32}"
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex "$n" 2>/dev/null
    else
        head -c "$n" /dev/urandom | od -An -tx1 | tr -d ' \n'
    fi
}

# read KEY= from a file (first match, strip CR)
__token_env_get() {
    local file="$1" key="$2"
    grep -oE "^${key}=.*" "$file" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r'
}

# set/update KEY=VALUE in a file, preserving other lines
__token_env_set() {
    local file="$1" key="$2" val="$3" tmp
    [[ -f $file ]] || : > "$file"
    if grep -qE "^${key}=" "$file" 2>/dev/null; then
        tmp=$(mktemp)
        sed -E "s|^${key}=.*|${key}=${val}|" "$file" > "$tmp"
        mv "$tmp" "$file"
    else
        printf '%s=%s\n' "$key" "$val" >> "$file"
    fi
}

__token_sync() {
    local sol_env="$1" god_env="$2" tok secret

    tok=$(__token_env_get "$sol_env" SOL_TOKEN)
    [[ -z $tok ]] && tok=$(__token_rand_hex 32)
    __token_env_set "$sol_env" SOL_TOKEN "$tok"
    __token_env_set "$god_env" SOL_WS_TOKEN "$tok"

    secret=$(__token_env_get "$god_env" GOD_SHARED_SECRET)
    [[ -z $secret ]] && secret=$(__token_rand_hex 32)
    __token_env_set "$god_env" GOD_SHARED_SECRET "$secret"

    printf '✅ token sync OK\n'
    printf '   SOL_TOKEN = SOL_WS_TOKEN  (%s…)\n' "${tok:0:8}"
    printf '   GOD_SHARED_SECRET set     (%s…)\n' "${secret:0:8}"
    printf '   ⚠️  restart god για να πάρει τα νέα secrets: god restart\n'
    return 0
}

__token_new() {
    local sol_env="$1" god_env="$2" tok secret
    tok=$(__token_rand_hex 32)
    secret=$(__token_rand_hex 32)
    __token_env_set "$sol_env" SOL_TOKEN "$tok"
    __token_env_set "$god_env" SOL_WS_TOKEN "$tok"
    __token_env_set "$god_env" GOD_SHARED_SECRET "$secret"
    printf '✅ νέα secrets δημιουργήθηκαν (restart god για εφαρμογή)\n'
    return 0
}

__token_status() {
    local sol_env="$1" god_env="$2" sol god secret
    sol=$(__token_env_get "$sol_env" SOL_TOKEN)
    god=$(__token_env_get "$god_env" SOL_WS_TOKEN)
    secret=$(__token_env_get "$god_env" GOD_SHARED_SECRET)

    [[ -n $sol ]] && printf 'SOL_TOKEN        : set\n' || printf 'SOL_TOKEN        : ❌ missing\n'
    if [[ -n $sol && "$sol" == "$god" ]]; then
        printf 'SOL_WS_TOKEN     : ✅ matches SOL_TOKEN\n'
    else
        printf 'SOL_WS_TOKEN     : ❌ mismatch/missing\n'
    fi
    [[ -n $secret ]] && printf 'GOD_SHARED_SECRET: set\n' || printf 'GOD_SHARED_SECRET: ❌ missing\n'
    return 0
}

# mint signed token for messaging/ws: payload = db|uid|role|exp, sig = hmac_sha256(payload, secret)
# Το UserID στο god = GUID(db,uid) = "db:uid", άρα εδώ το uid είναι το bare id (π.χ. "1").
__token_mint() {
    local sol_env="$1" god_env="$2" db="${3:-}" uid="${4:-1}" role="${5:-system}"
    [[ -n $db ]] || { printf 'Usage: token mint <db> [uid] [role]\n' >&2; return 1; }

    local secret payload b64 sig exp
    secret=$(__token_env_get "$god_env" GOD_SHARED_SECRET)
    if [[ -z $secret ]]; then
        printf '❌ GOD_SHARED_SECRET not set — run: token sync\n' >&2
        return 1
    fi

    exp=$(( $(date +%s) + 315360000 ))   # ~10 έτη
    payload="${db}|${uid}|${role}|${exp}"

    b64=$(printf '%s' "$payload" | openssl base64 -A 2>/dev/null | tr '+/' '-_' | tr -d '=')
    sig=$(printf '%s' "$payload" | openssl dgst -sha256 -hmac "$secret" -hex 2>/dev/null | awk '{print $NF}')

    printf '%s.%s\n' "$b64" "$sig"
    return 0
}
