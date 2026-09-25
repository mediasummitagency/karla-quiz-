#!/usr/bin/env bash
# Rebuilds upload-ready/to-upload/ with exactly what goes into Hostinger's public_html.
#
#   ./scripts/build-upload.sh
#
# Wipes the folder, runs a fresh production build, and copies only the built site in.
# Upload the CONTENTS of to-upload/ (not the folder itself) into public_html, after
# emptying public_html. A zip of the same files sits next to it for the File Manager's
# "extract" option.
set -euo pipefail

cd "$(dirname "$0")/.."

OUT_DIR="upload-ready"
TARGET="$OUT_DIR/to-upload"
ZIP="$OUT_DIR/to-upload.zip"

echo "→ Building the site..."
npm run build --silent

echo "→ Recreating $TARGET/"
rm -rf "$TARGET" "$ZIP"
mkdir -p "$TARGET"
cp -R dist/. "$TARGET/"

# Nothing but the built site goes up: no source maps, no dotfiles, no macOS junk.
find "$TARGET" \( -name '*.map' -o -name '.DS_Store' -o -name '.*' \) -type f -delete

(cd "$TARGET" && zip -qr "../to-upload.zip" .)

# The page must point at asset files that are actually in the folder.
missing=0
for ref in $(grep -oE '/assets/[^"]+' "$TARGET/index.html"); do
  if [ ! -f "$TARGET$ref" ]; then
    echo "✗ index.html references $ref but it is not in the folder"
    missing=1
  fi
done
[ "$missing" -eq 0 ] || exit 1

commit="$(git rev-parse --short HEAD)"
dirty=""
git diff --quiet HEAD -- src public index.html || dirty=" (+ uncommitted changes)"

echo
echo "✓ $TARGET/ rebuilt from commit $commit$dirty"
(cd "$TARGET" && find . -type f | sed 's|^\./|    |' | sort)
echo
echo "Upload: Hostinger File Manager → public_html → delete everything inside →"
echo "upload the contents of $TARGET/ (or $ZIP and extract it there)."
echo "Then open the site and hard-refresh (Cmd+Shift+R)."
