#!/bin/bash
# migrate-hello.sh
# 1. Μετακινεί όλα τα hello cubos στο astra/hello/<system>/
# 2. Καθαρίζει τα manifests των συστημάτων (αφαιρεί το hello entry)

set -uo pipefail

GS_ROOT="/var/www/gs"
ASTRA_HELLO="$GS_ROOT/astra/hello"

echo "=========================================="
echo "  MIGRATE ALL HELLO → astra/hello/"
echo "=========================================="
echo "  target: $ASTRA_HELLO"
echo ""

# --- 1. Δημιούργησε το astra/hello/ ---
mkdir -p "$ASTRA_HELLO"

# --- 2. Μετακίνησε τα hello από κάθε σύστημα ---
declare -A MOVED

# ΟΛΑ τα systems (συμπεριλαμβανομένου moon)
ALL_SYSTEMS=(god kronos gaia mars sun moon)

for sys in "${ALL_SYSTEMS[@]}"; do
    echo ""
    echo "=== $sys ==="

    case "$sys" in
        god)    SRC="$GS_ROOT/god/cubos/hello" ;;
        kronos) SRC="$GS_ROOT/kronos/cubos/hello" ;;
        gaia)   SRC="$GS_ROOT/gaia/core/cubos/Hello" ;;
        mars)   SRC="$GS_ROOT/mars/cubos/hello" ;;
        sun)    SRC="$GS_ROOT/sun/cubos/hello" ;;
        moon)   SRC="$GS_ROOT/moon/gaia.net/cubos/Hello" ;;
        *)      echo "  ⚠️  unknown system: $sys"; continue ;;
    esac

    DST="$ASTRA_HELLO/$sys"

    # Έλεγχος αν υπάρχει (directory ή file)
    if [ -d "$SRC" ]; then
        echo "  src: $SRC (directory)"
        mkdir -p "$DST"

        if [ -d "$DST" ] && [ "$(ls -A "$DST" 2>/dev/null)" ]; then
            echo "  ⚠️  $DST already has files — merging..."
            cp -r "$SRC"/* "$DST"/ 2>/dev/null || true
        else
            cp -r "$SRC"/* "$DST"/ 2>/dev/null || true
        fi
        rm -rf "$SRC"
        MOVED["$sys"]=1
        echo "  ✅ moved (directory)"

    elif [ -f "$SRC" ]; then
        # Είναι single file (π.χ. Hello.php)
        echo "  src: $SRC (file)"
        mkdir -p "$DST"
        mv "$SRC" "$DST/"
        MOVED["$sys"]=1
        echo "  ✅ moved (file)"

    else
        # Ψάξε για Hello*.php (moon case)
        if [ "$sys" = "moon" ]; then
            MOON_HELLO=$(find "$GS_ROOT/moon" -maxdepth 4 -name "Hello*.php" -not -path "*/vendor/*" 2>/dev/null | head -1)
            if [ -n "$MOON_HELLO" ]; then
                echo "  found via search: $MOON_HELLO"
                mkdir -p "$DST"
                mv "$MOON_HELLO" "$DST/"
                MOVED["$sys"]=1
                echo "  ✅ moved (file, via find)"
            else
                echo "  ⏭  no Hello*.php found in moon"
                MOVED["$sys"]=0
            fi
        else
            echo "  ⏭  no hello found at $SRC"
            MOVED["$sys"]=0
        fi
    fi
done

# --- 3. Καθάρισμα manifests ---
echo ""
echo "=========================================="
echo "  CLEANING MANIFESTS"
echo "=========================================="

for sys in "${ALL_SYSTEMS[@]}"; do
    case "$sys" in
        god)    MANIFEST="$GS_ROOT/god/cubos/manifest.json" ;;
        kronos) MANIFEST="$GS_ROOT/kronos/cubos/manifest.json" ;;
        gaia)   MANIFEST="$GS_ROOT/gaia/cubos/manifest.json" ;;
        mars)   MANIFEST="$GS_ROOT/mars/cubos/manifest.json" ;;
        sun)    MANIFEST="$GS_ROOT/sun/cubos/manifest.json" ;;
        moon)   MANIFEST="" ;;  # moon δεν έχει δικό του manifest
    esac

    echo ""
    echo "=== $sys ==="

    if [ -z "$MANIFEST" ]; then
        echo "  ⏭  no manifest for $sys"
        continue
    fi

    if [ ! -f "$MANIFEST" ]; then
        echo "  ⏭  no manifest at $MANIFEST"
        continue
    fi

    # Backup
    cp "$MANIFEST" "$MANIFEST.bak.$(date +%Y%m%d_%H%M%S)"

    # Αφαίρεση hello entry (case-insensitive)
    if jq -e '.cubos[]? | select(.name | ascii_downcase == "hello")' "$MANIFEST" > /dev/null 2>&1; then
        jq '.cubos |= map(select(.name | ascii_downcase != "hello"))' "$MANIFEST" > "$MANIFEST.tmp"
        mv "$MANIFEST.tmp" "$MANIFEST"
        echo "  ✅ removed 'hello' from manifest"
    else
        echo "  ⏭  no 'hello' in manifest"
    fi
done

# --- 4. Δημιούργησε astra/hello/manifest.json ---
echo ""
echo "=========================================="
echo "  CREATING astra/hello/manifest.json"
echo "=========================================="

cat > "$ASTRA_HELLO/manifest.json" << 'JSONEOF'
{
  "version": "1.0.0",
  "name": "hello",
  "description": "Multi-system Hello cubo",
  "systems": {
    "god": {
      "language": "go",
      "path": "god",
      "files": ["god/hello.go"],
      "register_line": "hello.Register(a.router)"
    },
    "kronos": {
      "language": "python",
      "path": "kronos",
      "files": ["kronos/hello.py", "kronos/__init__.py"],
      "register_line": "_REGISTRY.append((\"hello\", cubo_hello.register_routes))"
    },
    "gaia": {
      "language": "php",
      "path": "gaia",
      "files": ["gaia/Hello.php"],
      "register_line": "use Hello;",
      "trait": "Hello"
    },
    "mars": {
      "language": "cpp",
      "path": "mars",
      "files": ["mars/hello.cpp", "mars/hello.h"],
      "register_line": "registry().push_back({\"hello\", cubo_hello::register_routes});"
    },
    "sun": {
      "language": "bash",
      "path": "sun",
      "files": ["sun/hello.sh"],
      "register_line": "cubos_register \"hello\" hello_register"
    },
    "moon": {
      "language": "jsx",
      "path": "moon",
      "files": ["moon/Hello.jsx"],
      "register_line": "import Hello from './Hello';"
    }
  }
}
JSONEOF

echo "  ✅ created $ASTRA_HELLO/manifest.json"

# --- 5. Σύνοψη ---
echo ""
echo "=========================================="
echo "  SUMMARY"
echo "=========================================="
echo ""
echo "  Moved:"
for sys in "${!MOVED[@]}"; do
    if [ "${MOVED[$sys]}" = "1" ]; then
        echo "    ✅ $sys"
    fi
done
echo ""
echo "  Not found:"
for sys in "${!MOVED[@]}"; do
    if [ "${MOVED[$sys]}" = "0" ]; then
        echo "    ⏭  $sys"
    fi
done

echo ""
echo "  Final structure:"
find "$ASTRA_HELLO" -type f 2>/dev/null | sort | sed 's/^/    /'

echo ""
echo "  Manifests cleaned:"
for sys in "${ALL_SYSTEMS[@]}"; do
    case "$sys" in
        god)    MANIFEST="$GS_ROOT/god/cubos/manifest.json" ;;
        kronos) MANIFEST="$GS_ROOT/kronos/cubos/manifest.json" ;;
        gaia)   MANIFEST="$GS_ROOT/gaia/cubos/manifest.json" ;;
        mars)   MANIFEST="$GS_ROOT/mars/cubos/manifest.json" ;;
        sun)    MANIFEST="$GS_ROOT/sun/cubos/manifest.json" ;;
        moon)   MANIFEST="" ;;
    esac
    if [ -n "$MANIFEST" ] && [ -f "$MANIFEST" ]; then
        count=$(jq '.cubos | length' "$MANIFEST" 2>/dev/null || echo 0)
        printf "    %-10s cubos: %s\n" "$sys" "$count"
    fi
done

echo ""
echo "🎉 Done"