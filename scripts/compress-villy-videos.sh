#!/usr/bin/env bash
# Gallery-only — hero is encoded separately from Documents/Rent A Boat Villy.mp4
set -euo pipefail

SRC="/Users/aggelosdadalis/Downloads/drive-download-20260610T085935Z-3-001"
OUT="/Users/aggelosdadalis/Projects/thassos-boat-charters/public/videos"

# CRF 23 @ native 1080p — sharp but much smaller than 200–900MB sources
encode() {
  local in="$1" out="$2"
  ffmpeg -y -i "$in" -an \
    -c:v libx264 -crf 23 -preset medium \
    -movflags +faststart -pix_fmt yuv420p \
    "$out"
}

poster() {
  local in="$1" out="$2"
  ffmpeg -y -ss 00:00:02 -i "$in" -frames:v 1 -update 1 -q:v 2 "$out"
}

mkdir -p "$OUT/posters"

echo "=== Gallery landscape ==="
encode "$SRC/vily2.mp4" "$OUT/villy-horizon.mp4"
poster "$OUT/villy-horizon.mp4" "$OUT/posters/horizon.jpg"
encode "$SRC/vily 5.mp4" "$OUT/villy-cruise.mp4"
poster "$OUT/villy-cruise.mp4" "$OUT/posters/cruise.jpg"

echo "=== Gallery portrait ==="
encode "$SRC/vily1.mp4" "$OUT/villy-vertical-1.mp4"
poster "$OUT/villy-vertical-1.mp4" "$OUT/posters/vertical-1.jpg"
encode "$SRC/villy4.mp4" "$OUT/villy-vertical-2.mp4"
poster "$OUT/villy-vertical-2.mp4" "$OUT/posters/vertical-2.jpg"
encode "$SRC/vily3.mp4" "$OUT/villy-vertical-3.mp4"
poster "$OUT/villy-vertical-3.mp4" "$OUT/posters/vertical-3.jpg"

echo "=== Done ==="
ls -lh "$OUT"/villy-*.mp4 "$OUT"/posters/*.jpg
