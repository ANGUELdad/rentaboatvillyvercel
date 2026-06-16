"use client";

import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import type { GalleryAspect } from "@/types";
import { SafeImage } from "@/components/SafeImage";
import { cn } from "@/lib/utils";

export interface SmartVideoHandle {
  pause: () => void;
}

interface SmartVideoProps {
  src: string;
  aspect?: GalleryAspect;
  poster?: string;
  alt: string;
  className?: string;
  /** Fill parent container (gallery tile / lightbox) */
  fill?: boolean;
  /** When true, fills parent and shows play overlay (gallery tile mode) */
  preview?: boolean;
  /** In-gallery lightbox player with site chrome */
  theater?: boolean;
  onPreviewClick?: () => void;
}

function aspectClass(aspect: GalleryAspect) {
  return aspect === "9:16" ? "aspect-[9/16]" : "aspect-video";
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const SmartVideo = forwardRef<SmartVideoHandle, SmartVideoProps>(
  function SmartVideo(
    {
      src,
      aspect = "16:9",
      poster,
      alt,
      className,
      fill = false,
      preview = false,
      theater = false,
      onPreviewClick,
    },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const screenRef = useRef<HTMLDivElement>(null);
    const [resolvedAspect, setResolvedAspect] = useState<GalleryAspect>(aspect);
    const [playing, setPlaying] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [loadError, setLoadError] = useState(false);

    useImperativeHandle(ref, () => ({
      pause: () => {
        videoRef.current?.pause();
      },
    }));

    const detectAspect = useCallback(() => {
      const video = videoRef.current;
      if (!video?.videoWidth || !video.videoHeight) return;
      const ratio = video.videoWidth / video.videoHeight;
      setResolvedAspect(ratio < 1 ? "9:16" : "16:9");
    }, []);

    const togglePlay = useCallback(async () => {
      const video = videoRef.current;
      if (!video) return;
      setLoadError(false);
      if (video.paused) {
        if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
          video.load();
        }
        try {
          await video.play();
        } catch {
          setLoadError(true);
        }
      } else {
        video.pause();
      }
    }, []);

    const onTimeUpdate = useCallback(() => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    }, []);

    const onLoaded = useCallback(() => {
      detectAspect();
      const video = videoRef.current;
      if (video?.duration) setDuration(video.duration);
    }, [detectAspect]);

    const onSeek = useCallback((value: number) => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      video.currentTime = (value / 100) * video.duration;
      setProgress(value);
    }, []);

    useEffect(() => {
      if (!theater) return;
      const video = videoRef.current;
      if (!video) return;
      setLoadError(false);
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      video.load();
    }, [theater, src]);

    useEffect(() => {
      if (!theater) return;
      const video = videoRef.current;
      if (!video) return;
      void video.play().catch(() => {
        /* autoplay blocked until user taps play */
      });
    }, [theater, src]);

    if (preview) {
      const previewPoster = poster ?? src;
      return (
        <button
          type="button"
          onClick={onPreviewClick}
          className={cn(
            "group relative block overflow-hidden bg-black",
            fill ? "h-full w-full" : "w-full rounded-xl",
            !fill && aspectClass(resolvedAspect),
            className,
          )}
          aria-label={`Play video: ${alt}`}
        >
          <SafeImage
            src={previewPoster}
            alt={alt}
            fill
            sizes={fill ? "92vw" : "100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Play className="size-6 fill-white" />
            </span>
          </span>
          <span className="sr-only">{alt}</span>
        </button>
      );
    }

    if (theater) {
      return (
        <div
          className={cn(
            "gallery-video-player",
            expanded && "gallery-video-player--expanded",
            className,
          )}
        >
          <div
            ref={screenRef}
            className={cn(
              "gallery-video-player__screen",
              resolvedAspect === "9:16" && "gallery-video-player__screen--portrait",
            )}
          >
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              playsInline
              preload="metadata"
              disablePictureInPicture
              controlsList="nodownload noremoteplayback"
              onLoadedMetadata={onLoaded}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => {
                setLoadError(false);
                setPlaying(true);
              }}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => setLoadError(true)}
              onClick={togglePlay}
              className="gallery-video-player__video"
              aria-label={alt}
            />
            {!playing && (
              <button
                type="button"
                className="gallery-video-player__play-overlay"
                onClick={togglePlay}
                aria-label="Play video"
              >
                <span className="gallery-video-player__play-ring">
                  <Play className="size-8 fill-white text-white" />
                </span>
              </button>
            )}
            {loadError && (
              <p className="absolute inset-x-0 bottom-4 z-10 px-4 text-center text-sm text-white/90">
                Video could not load. Try again or check your connection.
              </p>
            )}
          </div>

          <div className="gallery-video-player__chrome">
            <button
              type="button"
              className="gallery-video-player__control"
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </button>

            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="gallery-video-player__progress"
              aria-label="Seek"
            />

            <span className="gallery-video-player__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              className="gallery-video-player__control"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Shrink player" : "Expand player"}
            >
              {expanded ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        muted
        playsInline
        autoPlay
        preload="auto"
        onLoadedMetadata={detectAspect}
        className={cn(
          "bg-black object-contain",
          fill
            ? "absolute inset-0 h-full w-full max-h-full rounded-none"
            : cn("w-full max-h-[80vh] rounded-lg", aspectClass(resolvedAspect)),
          className,
        )}
        aria-label={alt}
      />
    );
  },
);
