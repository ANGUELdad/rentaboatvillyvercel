#!/usr/bin/env bash
# Compress gallery videos (≤5MB) and hero video (best quality at minimal size).
set -euo pipefail

ROOT="/Users/aggelosdadalis/Projects/thassos-boat-charters/public/videos"
GALLERY_MAX=$((5 * 1024 * 1024))
HERO_TARGET=$((5 * 1024 * 1024)) # ~5MB hero — ultra small, still sharp at 1080 vertical

mkdir -p "$ROOT/_originals/gallery"

backup_if_needed() {
  local src="$1"
  local dest="$2"
  if [[ ! -f "$dest" ]]; then
    cp -p "$src" "$dest"
    echo "Backed up: $dest"
  fi
}

get_duration() {
  ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"
}

get_dims() {
  ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$1"
}

compress_two_pass() {
  local input="$1"
  local output="$2"
  local target_bytes="$3"
  local scale_filter="$4"

  local duration
  duration=$(get_duration "$input")
  local bitrate_k
  bitrate_k=$(python3 -c "print(max(200, int($target_bytes * 8 / float('$duration') / 1000 * 0.92)))")

  local passlog
  passlog=$(mktemp /tmp/ffmpeg2pass.XXXXXX)

  ffmpeg -y -hide_banner -loglevel error -i "$input" \
    -an -vf "$scale_filter" \
    -c:v libx264 -preset slow -profile:v main -pix_fmt yuv420p \
    -b:v "${bitrate_k}k" -maxrate "$((bitrate_k * 110 / 100))k" -bufsize "$((bitrate_k * 2))k" \
    -pass 1 -passlogfile "$passlog" -f mp4 /dev/null

  ffmpeg -y -hide_banner -loglevel error -i "$input" \
    -an -vf "$scale_filter" \
    -c:v libx264 -preset slow -profile:v main -pix_fmt yuv420p \
    -b:v "${bitrate_k}k" -maxrate "$((bitrate_k * 110 / 100))k" -bufsize "$((bitrate_k * 2))k" \
    -pass 2 -passlogfile "$passlog" \
    -movflags +faststart "$output"

  rm -f "${passlog}"*
}

scale_for_attempt() {
  local w="$1" h="$2" attempt="$3"
  if (( w > h )); then
    case "$attempt" in
      0) echo "scale=1280:-2" ;;
      1) echo "scale=960:-2" ;;
      *) echo "scale=720:-2" ;;
    esac
  else
    case "$attempt" in
      0) echo "scale=-2:1280" ;;
      1) echo "scale=-2:960" ;;
      *) echo "scale=-2:720" ;;
    esac
  fi
}

compress_gallery() {
  local input="$1"
  local name
  name=$(basename "$input")
  backup_if_needed "$input" "$ROOT/_originals/gallery/$name"

  local dims w h
  dims=$(get_dims "$input")
  w=${dims%x*}
  h=${dims#*x}

  local tmp out="$input"
  tmp=$(mktemp /tmp/gallery-out.XXXXXX.mp4)
  local target=$((GALLERY_MAX * 95 / 100))

  for attempt in 0 1 2; do
    local sf
    sf=$(scale_for_attempt "$w" "$h" "$attempt")
    echo ">>> Gallery $name attempt $attempt ($sf, target ${target} bytes)"
    compress_two_pass "$ROOT/_originals/gallery/$name" "$tmp" "$target" "$sf"
    local size
    size=$(stat -f%z "$tmp")
    echo "    Result: $size bytes"
    if (( size <= GALLERY_MAX )); then
      mv "$tmp" "$out"
      echo "OK: $name -> $(ls -lh "$out" | awk '{print $5}')"
      return 0
    fi
  done

  echo "WARN: $name still above 5MB after 3 attempts; keeping smallest pass"
  mv "$tmp" "$out"
}

compress_hero() {
  local input="$ROOT/rent-a-boat-villy.mp4"
  backup_if_needed "$input" "$ROOT/_originals/rent-a-boat-villy.mp4"

  local tmp
  tmp=$(mktemp /tmp/hero-out.XXXXXX.mp4)
  local target=$((HERO_TARGET * 95 / 100))
  local duration
  duration=$(get_duration "$ROOT/_originals/rent-a-boat-villy.mp4")
  local bitrate_k
  bitrate_k=$(python3 -c "print(max(350, int($target * 8 / float('$duration') / 1000 * 0.92)))")

  echo ">>> Hero two-pass 1080x1920 @ ${bitrate_k}k (target ~5MB)"
  local passlog
  passlog=$(mktemp /tmp/ffmpeg-hero.XXXXXX)

  ffmpeg -y -hide_banner -loglevel error -i "$ROOT/_originals/rent-a-boat-villy.mp4" \
    -an -vf "scale=1080:-2" \
    -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
    -b:v "${bitrate_k}k" -maxrate "$((bitrate_k * 115 / 100))k" -bufsize "$((bitrate_k * 2))k" \
    -pass 1 -passlogfile "$passlog" -f mp4 /dev/null

  ffmpeg -y -hide_banner -loglevel error -i "$ROOT/_originals/rent-a-boat-villy.mp4" \
    -an -vf "scale=1080:-2" \
    -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
    -b:v "${bitrate_k}k" -maxrate "$((bitrate_k * 115 / 100))k" -bufsize "$((bitrate_k * 2))k" \
    -pass 2 -passlogfile "$passlog" \
    -movflags +faststart "$tmp"

  rm -f "${passlog}"*
  mv "$tmp" "$input"
  echo "OK: hero -> $(ls -lh "$input" | awk '{print $5}')"
}

echo "=== Gallery compression (max 5MB) ==="
for f in "$ROOT/gallery"/villy-*.mp4; do
  compress_gallery "$f"
done

echo ""
echo "=== Hero compression (~5MB, full quality) ==="
compress_hero

echo ""
echo "=== Final sizes ==="
ls -lh "$ROOT/rent-a-boat-villy.mp4" "$ROOT/gallery"/*.mp4
