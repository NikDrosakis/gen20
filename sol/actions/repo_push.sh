#!/bin/bash
#repo_push
# Λήψη commit message
commit_message="$1"

git add . -- ':!data' ':!media'
git commit -m "$commit_message"
git push -u origin main --force