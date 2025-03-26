#!/bin/bash

# Λήψη commit message
commit_message="$2"

# Αν δεν υπάρχει commit message, ζητά από τον χρήστη
if [ -z "$commit_message" ]; then
    read -p "Enter commit message: " commit_message
fi

# Αν το commit message παραμένει άδειο, σταματά
if [ -z "$commit_message" ]; then
    echo "❌ Error: Commit message is required."
    exit 1
fi

# Αν δεν υπάρχουν αλλαγές, δεν κάνει commit
git diff --quiet && echo "✅ No changes to commit." && exit 0

# Προσθήκη όλων των αλλαγών
git add .

# Commit των αλλαγών
git commit -m "$commit_message"

# Δημιουργία tag με timestamp
tag_date=$(date +%Y%m%d-%H%M%S)
git tag "release-$tag_date"

# Push των αλλαγών και tag
git push origin main --tags

# --- WebSocket Notification ---
curl -X POST -H "Content-Type: application/json" \
     -d '{"type": "git_update", "message": "New code pushed and tagged"}' \
     http://vivalibro:3010/send

echo "🚀 Code pushed, committed, and tagged successfully!"
