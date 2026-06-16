#!/usr/bin/env bash
# Pick non-black poster frames from each video by sampling timestamps and scoring brightness.
set -euo pipefail

VIDEOS_DIR="/Users/aggelosdadalis/Projects/thassos-boat-charters/public/videos"
POSTERS_DIR="$VIDEOS_DIR/posters"
TMP_DIR="$VIDEOS_DIR/.poster-pick-tmp"
MIN_YAVG=28   # reject near-black frames
MIN_YMAX=80   # need some bright pixels (not all crushed)

mkdir -p "$POSTERS_DIR" "$TMP_DIR"

pick_poster() {
  local video="$1"
  local out="$2"
  local name
  name=$(basename "$video" .mp4)

  local dur
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")
  if [[ -z "$dur" || "$dur" == "N/A" ]]; then
    echo "skip $name: no duration"
    return 1
  fi

  local best_yavg=0
  local best_file=""
  local i=0

  # 24 samples spread across the clip (skip first/last 3% — often black fades)
  for pct in 4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 72 76 80 84 88 92 96; do
    local ts
    ts=$(awk -v d="$dur" -v p="$pct" 'BEGIN { printf "%.3f", d * p / 100 }')
    local tmp="$TMP_DIR/${name}-${i}.jpg"
    ffmpeg -y -loglevel error -ss "$ts" -i "$video" -vframes 1 -q:v 2 "$tmp" 2>/dev/null || { i=$((i+1)); continue; }

    local stats
    stats=$(ffmpeg -loglevel error -i "$tmp" -vf signalstats -f null - 2>&1 || true)
    local yavg ymax ymin
    yavg=$(echo "$stats" | grep -o 'lavfi.signalstats.YAVG=[0-9.]*' | tail -1 | cut -d= -f2)
    ymax=$(echo "$stats" | grep -o 'lavfi.signalstats.YMAX=[0-9.]*' | tail -1 | cut -d= -f2)
    ymin=$(echo "$stats" | grep -o 'lavfi.signalstats.YMIN=[0-9.]*' | tail -1 | cut -d= -f2)

    if [[ -z "$yavg" ]]; then
      i=$((i+1))
      continue
    fi

    # Reject black / near-black frames
    if awk -v y="$yavg" -v min="$MIN_YAVG" 'BEGIN { exit (y >= min) ? 0 : 1 }' && \
       awk -v y="$ymax" -v min="$MIN_YMAX" 'BEGIN { exit (y >= min) ? 0 : 1 }'; then
      if awk -v a="$yavg" -v b="$best_yavg" 'BEGIN { exit (a > b) ? 0 : 1 }'; then
        best_yavg=$yavg
        best_file=$tmp
      fi
    fi
    i=$((i+1))
  done

  if [[ -z "$best_file" || ! -f "$best_file" ]]; then
    echo "WARN $name: no bright frame found, using 25% mark fallback"
    local fallback_ts
    fallback_ts=$(awk -v d="$dur" 'BEGIN { printf "%.3f", d * 0.25 }')
    ffmpeg -y -loglevel error -ss "$fallback_ts" -i "$video" -vframes 1 -q:v 2 "$out"
  else
    cp "$best_file" "$out"
    echo "OK $name -> $(basename "$out") (YAVG=$best_yavg)"
  fi
}

# Gallery + hero posters
pick_poster "$VIDEOS_DIR/rent-a-boat-villy.mp4" "$POSTERS_DIR/hero.jpg"
pick_poster "$VIDEOS_DIR/villy-horizon.mp4" "$POSTERS_DIR/horizon.jpg"
pick_poster "$VIDEOS_DIR/villy-cruise.mp4" "$POSTERS_DIR/cruise.jpg"
pick_poster "$VIDEOS_DIR/villy-vertical-1.mp4" "$POSTERS_DIR/vertical-1.jpg"
pick_poster "$VIDEOS_DIR/villy-vertical-2.mp4" "$POSTERS_DIR/vertical-2.jpg"
pick_poster "$VIDEOS_DIR/villy-vertical-3.mp4" "$POSTERS_DIR/vertical-3.jpg"

rm -rf "$TMP_DIR"
ls -lh "$POSTERS_DIR"/*.jpg
