#!/bin/bash
# /var/www/gs/sun/com/cubo/install.sh
# Πλήρες cubos installation: sync aggregator + checks + build + restart + verify

set -uo pipefail

source "$(dirname "$0")/../../init.sh"

# ============================================================
# CONFIG
# ============================================================
GOD_ROOT="/var/www/gs/god"
MANIFEST="$GOD_ROOT/cubos/manifest.json"
AGGREGATOR="$GOD_ROOT/cubos/aggregator.go"

# ============================================================
# Έλεγχοι
# ============================================================
log_action "=== CUBO INSTALL ==="
log_action "god root: $GOD_ROOT"

[ -d "$GOD_ROOT" ] || { log_action "ERROR: god root not found"; exit 1; }
[ -f "$MANIFEST" ] || { log_action "ERROR: manifest not found: $MANIFEST"; exit 1; }
[ -f "$AGGREGATOR" ] || { log_action "ERROR: aggregator not found: $AGGREGATOR"; exit 1; }

command -v jq &>/dev/null || { log_action "ERROR: jq required"; exit 1; }
command -v python3 &>/dev/null || { log_action "ERROR: python3 required"; exit 1; }

# ============================================================
# 0. SYNC AGGREGATOR
# ============================================================
echo ""
echo "🔄 Syncing aggregator from manifest..."

NEW_BLOCK=$'\t// === CUBOS:START === (auto-generated από cubo/install.sh — μην αλλάξεις χειροκίνητα)\n'

while IFS= read -r row; do
    name=$(echo "$row" | jq -r '.name')
    line=$(echo "$row" | jq -r '.register_line // empty')

    if [[ -z "$line" ]]; then
        echo "  ⚠️  $name — no register_line, skipping"
        continue
    fi

    NEW_BLOCK+=$'\t'"$line"$'\n'
    echo "  ✓ $name → $line"
done < <(jq -c '.cubos[] | select(.enabled)' "$MANIFEST")

NEW_BLOCK+=$'\t// === CUBOS:END ==='

python3 - "$AGGREGATOR" "$NEW_BLOCK" << 'PYEOF'
import sys

path = sys.argv[1]
new_block = sys.argv[2]

with open(path) as f:
    content = f.read()

start_marker = "// === CUBOS:START ==="
end_marker = "// === CUBOS:END ==="

start = content.find(start_marker)
end = content.find(end_marker)

if start == -1 or end == -1:
    print("  ❌ markers not found in aggregator.go")
    print("  💡 Πρόσθεσε τα σχόλια μέσα στη function RegisterAll():")
    print("       // === CUBOS:START ===")
    print("       // === CUBOS:END ===")
    sys.exit(1)

end = content.find("\n", end) + 1
new_content = content[:start] + new_block + content[end:]

if new_content == content:
    print("  ⏭  no changes")
else:
    with open(path, "w") as f:
        f.write(new_content)
    print("  ✅ aggregator updated")
PYEOF

# ============================================================
# 1. ΕΛΕΓΧΟΣ FILES
# ============================================================
echo ""
echo "🔍 Checking files..."
missing=0

while IFS= read -r row; do
    name=$(echo "$row" | jq -r '.name')

    while IFS= read -r file; do
        if [[ ! -f "$GOD_ROOT/$file" ]]; then
            echo "  ❌ $name/$file missing"
            missing=$((missing + 1))
        fi
    done < <(echo "$row" | jq -r '.files[]')

    echo "  ✓ $name"
done < <(jq -c '.cubos[] | select(.enabled)' "$MANIFEST")

[[ "$missing" -eq 0 ]] || { log_action "ERROR: $missing file(s) missing"; exit 1; }

# ============================================================
# 2. ΕΛΕΓΧΟΣ REGISTER FUNCTIONS
# ============================================================
echo ""
echo "🔧 Checking Register functions..."
while IFS= read -r row; do
    name=$(echo "$row" | jq -r '.name')
    register=$(echo "$row" | jq -r '.register')
    package=$(echo "$row" | jq -r '.package')

    dir="$GOD_ROOT/${package#god/}"
    if grep -rq "func $register" "$dir" 2>/dev/null; then
        echo "  ✓ $name → $register"
    else
        echo "  ⚠️  $name → $register NOT FOUND in $dir"
    fi
done < <(jq -c '.cubos[] | select(.enabled)' "$MANIFEST")

# ============================================================
# 3. BUILD
# ============================================================
echo ""
echo "🔨 Building..."
cd "$GOD_ROOT"
[[ -f ".env" ]] && { set -a; source .env; set +a; }

go build -o god . 2>&1 | tee -a "$GEN_LOG_FILE"
[[ "${PIPESTATUS[0]}" -eq 0 ]] || { log_action "ERROR: build failed"; exit 1; }
echo "✅ build OK → $GOD_ROOT/god"

# ============================================================
# 4. RESTART
# ============================================================
echo ""
read -rp "Restart god service? [y/N] " ans
if [[ "${ans,,}" == "y" ]]; then
    systemctl restart god
    sleep 1
    systemctl status god --no-pager | head -15
fi

# ============================================================
# 5. VERIFY ROUTES
# ============================================================
echo ""
echo "🌐 Checking routes..."
port="${PORT:-3008}"
if curl -sf "http://127.0.0.1:$port/god/v1/routes" > /tmp/god-routes.json; then
    total=$(jq '.routes | length' /tmp/god-routes.json)
    echo "  ✅ $total routes registered"

    while IFS= read -r ep; do
        method=$(echo "$ep" | awk '{print $1}')
        path=$(echo "$ep" | awk '{print $2}')
        [[ "$path" == *"*"* ]] && continue

        if ! jq -e --arg m "$method" --arg p "$path" \
            '.routes[] | select(.method == $m and .path == $p)' \
            /tmp/god-routes.json > /dev/null; then
            echo "  ⚠️  missing: $method $path"
        fi
    done < <(jq -r '.cubos[] | select(.enabled) | .endpoints[]' "$MANIFEST")
else
    echo "  ⚠️  could not reach /god/v1/routes (port $port)"
fi

echo ""
log_action "OK: cubo install completed"
