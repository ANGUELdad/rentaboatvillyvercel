#!/usr/bin/env python3
"""Pick non-black poster frames from videos by sampling timestamps."""

from __future__ import annotations

import random
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIDEOS = ROOT / "public" / "videos"
POSTERS = VIDEOS / "posters"
TMP = VIDEOS / ".poster-pick-tmp"

MIN_BRIGHTNESS = 28.0
MIN_PEAK = 90.0
SAMPLES = 28

POSTER_MAP = {
    "rent-a-boat-villy.mp4": "hero.jpg",
    "villy-horizon.mp4": "horizon.jpg",
    "villy-cruise.mp4": "cruise.jpg",
    "villy-vertical-1.mp4": "vertical-1.jpg",
    "villy-vertical-2.mp4": "vertical-2.jpg",
    "villy-vertical-3.mp4": "vertical-3.jpg",
}


def duration(video: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(video),
        ],
        text=True,
    ).strip()
    return float(out)


def extract_frame(video: Path, ts: float, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-ss",
            f"{ts:.3f}",
            "-i",
            str(video),
            "-vframes",
            "1",
            "-q:v",
            "2",
            str(dest),
        ],
        capture_output=True,
    )
    return proc.returncode == 0 and dest.exists() and dest.stat().st_size > 0


def brightness_stats(image: Path) -> tuple[float, float] | None:
    proc = subprocess.run(
        [
            "ffmpeg",
            "-loglevel",
            "error",
            "-i",
            str(image),
            "-vf",
            "scale=200:-1,format=gray",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "gray",
            "-",
        ],
        capture_output=True,
    )
    if proc.returncode != 0 or not proc.stdout:
        return None
    pixels = proc.stdout
    if not pixels:
        return None
    avg = sum(pixels) / len(pixels)
    peak = max(pixels)
    return avg, float(peak)


def pick_poster(video: Path, out: Path) -> None:
    dur = duration(video)
    rng = random.Random(hash(video.name) & 0xFFFFFFFF)

    # Spread samples across clip; avoid first/last 3% (fade to black)
    pcts = sorted(
        {
            rng.uniform(4, 96)
            for _ in range(SAMPLES)
        }
    )

    best_avg = -1.0
    best_path: Path | None = None

    for i, pct in enumerate(pcts):
        ts = dur * pct / 100.0
        tmp = TMP / f"{video.stem}-{i}.jpg"
        if not extract_frame(video, ts, tmp):
            continue
        stats = brightness_stats(tmp)
        if stats is None:
            continue
        avg, peak = stats
        if avg < MIN_BRIGHTNESS or peak < MIN_PEAK:
            continue
        if avg > best_avg:
            best_avg = avg
            best_path = tmp

    out.parent.mkdir(parents=True, exist_ok=True)
    if best_path:
        shutil.copy2(best_path, out)
        print(f"OK {video.name} -> {out.name} (avg={best_avg:.1f})")
    else:
        fallback_ts = dur * 0.35
        extract_frame(video, fallback_ts, out)
        print(f"WARN {video.name}: fallback frame at 35% -> {out.name}")


def pick_random_shots(video: Path, out_dir: Path, count: int = 3) -> None:
    dur = duration(video)
    rng = random.Random((hash(video.name) ^ 0xA5A5) & 0xFFFFFFFF)
    out_dir.mkdir(parents=True, exist_ok=True)
    saved = 0
    attempts = 0
    while saved < count and attempts < count * 12:
        attempts += 1
        pct = rng.uniform(5, 95)
        ts = dur * pct / 100.0
        tmp = TMP / f"shot-{video.stem}-{attempts}.jpg"
        if not extract_frame(video, ts, tmp):
            continue
        stats = brightness_stats(tmp)
        if stats is None or stats[0] < MIN_BRIGHTNESS or stats[1] < MIN_PEAK:
            continue
        dest = out_dir / f"{video.stem}-{saved + 1}.jpg"
        shutil.copy2(tmp, dest)
        saved += 1
        print(f"  shot {dest.name} (avg={stats[0]:.1f})")


def main() -> None:
    if TMP.exists():
        shutil.rmtree(TMP)
    TMP.mkdir(parents=True, exist_ok=True)

    screenshots_dir = VIDEOS / "screenshots"
    all_videos = sorted(VIDEOS.glob("*.mp4"))

    for video_name, poster_name in POSTER_MAP.items():
        video = VIDEOS / video_name
        if not video.exists():
            print(f"skip missing {video_name}")
            continue
        pick_poster(video, POSTERS / poster_name)

    print("\nRandom screenshots:")
    for video in all_videos:
        print(video.name)
        pick_random_shots(video, screenshots_dir / video.stem)

    shutil.rmtree(TMP, ignore_errors=True)
    print("\nPosters:")
    for p in sorted(POSTERS.glob("*.jpg")):
        print(f"  {p.name}: {p.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
