#!/usr/bin/env bash
# Copy latest site files → GitHub clone → commit → push (Vercel auto-deploys)
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/Documents/GitHub/rentaboatvillyvercel"

if [[ ! -d "$DEST/.git" ]]; then
  echo "Missing git repo: $DEST"
  echo "Clone first: git clone https://github.com/ANGUELdad/rentaboatvillyvercel.git \"$DEST\""
  exit 1
fi

rsync -a --exclude-from="$SRC/scripts/desktop-upload-excludes.txt" "$SRC/" "$DEST/"

cd "$DEST"
git add -A
if git diff --cached --quiet; then
  echo "Nothing new to commit."
  exit 0
fi

git commit -m "$(cat <<'EOF'
Sync site updates: static locale switching and compressed media.

Greek/English now use bundled locale JSON (reliable on Vercel).
EOF
)"

git push origin main
echo "Pushed to https://github.com/ANGUELdad/rentaboatvillyvercel — Vercel will redeploy."
