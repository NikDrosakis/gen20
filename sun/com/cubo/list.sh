cat > /var/www/gs/sun/com/cubo/status.sh << 'GOEOF'
#!/bin/bash
# /var/www/gs/sun/com/cubo/status.sh
# Δείχνει τι cubos είναι στο manifest και τι υπάρχει στο filesystem

set -u
set -o pipefail

source "$(dirname "$0")/../../init.sh"

GOD_ROOT="/var/www/gs/god"
MANIFEST="$GOD_ROOT/cubos/manifest.json"
AGGREGATOR="$GOD_ROOT/cubos/aggregator.go"

log_action "=== CUBO STATUS ==="

if [ ! -f "$MANIFEST" ]; then
    log_action "ERROR: manifest not found: $MANIFEST"
    exit 1
fi

echo ""
echo "=== Cubos στο manifest ==="
jq -r '.cubos[] | select(.enabled) | "  \(.name)\t\(.package)\t→ \(.register_line)"' "$MANIFEST"

echo ""
echo "=== Files check ==="
while IFS= read -r row; do
    name=$(echo "$row" | jq -r '.name')
    missing=0
    while IFS= read -r file; do
        if [ ! -f "$GOD_ROOT/$file" ]; then
            echo "  ❌ $name/$file"
            missing=$((missing+1))
        fi
    done < <(echo "$row" | jq -r '.files[]')
    [ "$missing" -eq 0 ] && echo "  ✅ $name"
done < <(jq -c '.cubos[] | select(.enabled)' "$MANIFEST")

echo ""
echo "=== Aggregator block ==="
if grep -q "CUBOS:START" "$AGGREGATOR"; then
    sed -n '/CUBOS:START/,/CUBOS:END/p' "$AGGREGATOR" | sed 's/^/  /'
else
    echo "  ⚠️  no CUBOS:START marker"
fi

echo ""
echo "=== Running service ==="
if systemctl is-active --quiet god 2>/dev/null; then
    echo "  ✅ god: active"
    port="${PORT:-3008}"
    if curl -sf "http://127.0.0.1:$port/god/v1/routes" > /tmp/god-routes.json 2>/dev/null; then
        total=$(jq '.routes | length' /tmp/god-routes.json 2>/dev/null || echo 0)
        echo "  ✅ routes: $total"
    fi
else
    echo "  ❌ god: inactive"
fi

log_action "OK: cubo status"
GOEOF

chmod +x /var/www/gs/sun/com/cubo/status.sh