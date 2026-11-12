#!/bin/bash
# /var/www/gs/mars/install.sh

set -uo pipefail

MARS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔨 Building mars..."
echo "   source: $MARS_DIR"

# --- 1. Dependencies ---
echo ""
echo "🔍 Checking dependencies..."
for dep in g++ make mariadb_config; do
    if ! command -v "$dep" &>/dev/null; then
        echo "  ❌ $dep not found"
        exit 1
    fi
    echo "  ✓ $dep"
done

# yaml-cpp
if pkg-config --exists yaml-cpp 2>/dev/null; then
    echo "  ✓ yaml-cpp"
else
    echo "  ⚠️  yaml-cpp not found"
fi

# --- 2. Build ---
echo ""
echo "🔨 make -j$(nproc)..."
cd "$MARS_DIR" && make -j"$(nproc)" || { echo "❌ make failed"; exit 1; }

# --- 3. Check ---
if [ -x "$MARS_DIR/main" ]; then
    echo ""
    echo "✅ build OK → $MARS_DIR/main"
    ls -la "$MARS_DIR/main"
else
    echo "❌ binary not found: $MARS_DIR/main"
    exit 1
fi