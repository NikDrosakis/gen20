#!/bin/bash
set -e

# 1. Login στο Yarn
echo "🔑 Logging in to Yarn..."
yarn login <<EOF
gen20
info@gen20.net
EOF

# 2. Αύξηση έκδοσης (minor default)
echo "📦 Bumping package version..."
npm version minor --no-git-tag-version

# 3. Αντιγραφή /src -> /dist στον Apache φάκελο
echo "📁 Copying current build to public dist..."
SRC_DIR="./src"
DIST_DIR="/var/www/gs/gaia/public/gen20.net/@gen20/official"
mkdir -p "$DIST_DIR"
rsync -a --delete "$SRC_DIR/" "$DIST_DIR/"

# 4. Αναδημιουργία index.js με όλα τα exports
echo "📦 Rebuilding index.js..."
INDEX_FILE="./index.js"
echo "// AUTO-GENERATED INDEX FILE" > "$INDEX_FILE"
find ./components -name "*.js" | while read filepath; do
  filename=$(basename "$filepath" .js)
  echo "export { default as $filename } from './components/$filename';" >> "$INDEX_FILE"
done

# 5. Publish στο npm
echo "🚀 Publishing to NPM registry..."
yarn publish --access public

# 6. Ανανέωση cuboviews σε MariaDB
echo "🔄 Refreshing cuboviews in MariaDB..."
mysql -u root -pn130177! -e "CALL update_cuboviews();" gen20_db

echo "✅ All done. NPM package updated and deployed."
