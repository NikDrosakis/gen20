#!/bin/bash


FILE="$1"

if [ -z "$FILE" ]; then
    echo "Usage: ./npm-upload.sh Component.jsx"
    exit 1
fi

# Force file inside src/components/
FULLPATH="./src/components/$FILE"

if [ ! -f "$FULLPATH" ]; then
    echo "ERROR: File not found: $FULLPATH"
    exit 1
fi

echo "Reading headers from: $FULLPATH"

# --- Read headers from inside src/components/... ---
NAME=$(grep -m1 "^// *#name:" "$FULLPATH" | cut -d':' -f2 | xargs)
TITLE=$(grep -m1 "^// *#title:" "$FULLPATH" | cut -d':' -f2- | xargs)
DESC=$(grep -m1 "^// *#description:" "$FULLPATH" | cut -d':' -f2- | xargs)
VER=$(grep -m1 "^// *#version:" "$FULLPATH" | cut -d':' -f2 | xargs)
AUTHOR=$(grep -m1 "^// *#author:" "$FULLPATH" | cut -d':' -f2 | xargs)
LIB=$(grep -m1 "^// *#library:" "$FULLPATH" | cut -d':' -f2 | xargs)

echo "Component: $NAME"
echo "Version:   $VER"
echo "Library:   $LIB"
echo "Title:     $TITLE"
echo "Desc:      $DESC"
echo "Author:    $AUTHOR"

# --- MYSQL INSERT/UPDATE ---
mariadb -u root -pn130177! <<EOF
INSERT INTO gen_admin.npm (name, version, title, description)
VALUES (
    '$(printf "%s" "$NAME")',
    '$(printf "%s" "$VER")',
    '$(printf "%s" "$TITLE")',
    '$(printf "%s" "$DESC")'
    '$(printf "%s" "$AUTHOR")'
)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    updated = CURRENT_TIMESTAMP;
EOF

echo "✓ Database updated"

# --- NPM PUBLISH ---
LIB_PATH="./src/components"

echo "Syncing version package.json → $VER"
npm version "$VER" --allow-same-version --force

echo "Publishing to npm…"

OUTPUT=$(npm publish --access public 2>&1)
STATUS=$?

echo "$OUTPUT"

if [ $STATUS -ne 0 ]; then
    echo "❌ NPM publish FAILED"
    exit 1
fi

echo "✓ NPM package '$LIB' published"