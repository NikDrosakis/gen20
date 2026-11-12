#!/bin/bash
#repo_push
# FIXME: λείπει έλεγχος $1
commit_message="$1"
git add . -- ':!data' ':!media'
git commit -m "$commit_message"
git push -u origin main --force