"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import Link from "next/link";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface BoatGalleryHandle {
  scrollTo: (index: number, smooth?: boolean) => void;
  getActive: () => number;
}

interface BoatGalleryProps {
  images: string[];
  alt: string;
  backLabel: string;
  pageTitle: string;
  shareLabel: string;
  linkCopiedLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
  shareTitle?: string;
  shareUrl?: string;
  backHref?: string;
}

export const BoatGallery = forwardRef<BoatGalleryHandle, BoatGalleryProps>(
  function BoatGallery(
    {
      images,
      alt,
      backLabel,
      pageTitle,
      shareLabel,
      linkCopiedLabel = "Link copied",
      prevLabel = "Previous image",
      nextLabel = "Next image",
      shareTitle,
      shareUrl,
      backHref = "/fleet",
    },
    ref,
  ) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [active, setActive] = useState(0);
  const [copiedToast, setCopiedToast] = useState(false);

  const syncActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(Math.max(idx, 0), images.length - 1));
  }, [images.length]);

  const scrollTo = useCallback((index: number, smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(index, 0), images.length - 1);
    el.scrollTo({
      left: clamped * el.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
    setActive(clamped);
  }, [images.length]);

  useImperativeHandle(ref, () => ({
    scrollTo,
    getActive: () => active,
  }), [scrollTo, active]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncActiveFromScroll);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncActiveFromScroll]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showCopiedToast = useCallback(() => {
    setCopiedToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setCopiedToast(false), 2000);
  }, []);

  const handleShare = useCallback(async () => {
    const url = shareUrl ?? window.location.href;
    const title = shareTitle ?? alt;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      showCopiedToast();
    } catch {
      window.alert(linkCopiedLabel);
    }
  }, [alt, linkCopiedLabel, shareTitle, shareUrl, showCopiedToast]);

  return (
    <div className="relative isolate w-full bg-slate-900">
      {/* Scrollable gallery — receives all swipe gestures in the image area */}
      <div
        ref={scrollRef}
        onScroll={syncActiveFromScroll}
        className="relative z-0 flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pinch-zoom" }}
        aria-label={`${alt} gallery`}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative aspect-[4/3] min-w-full max-w-full shrink-0 grow-0 basis-full snap-start snap-always sm:aspect-[16/10] lg:aspect-[2/1]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${alt} — photo ${i + 1}`}
              className="h-full w-full object-cover"
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Decorative gradients — never intercept touches */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-gradient-to-b from-black/55 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-black/45 to-transparent"
      />

      {/* Top controls — only buttons capture taps */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-center justify-between px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
        <Link
          href={backHref}
          className="pointer-events-auto flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:bg-black/60"
          aria-label={backLabel}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <p className="pointer-events-none text-base font-semibold text-white drop-shadow-md">
          {pageTitle}
        </p>
        <div className="pointer-events-auto relative flex items-center">
          <button
            type="button"
            className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:bg-black/60"
            aria-label={shareLabel}
            onClick={() => {
              void handleShare();
            }}
          >
            <Share2 className="size-[18px]" />
          </button>
          {copiedToast && (
            <p
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md"
            >
              {linkCopiedLabel}
            </p>
          )}
        </div>
      </div>

      {/* Side arrows — desktop / tablet */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollTo(active - 1)}
            disabled={active === 0}
            className="absolute left-3 top-1/2 z-[2] hidden size-11 min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md disabled:opacity-30 sm:flex"
            aria-label={prevLabel}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(active + 1)}
            disabled={active === images.length - 1}
            className="absolute right-3 top-1/2 z-[2] hidden size-11 min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md disabled:opacity-30 sm:flex"
            aria-label={nextLabel}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-center justify-center px-4 pb-4 sm:px-5">
          <div className="pointer-events-auto flex items-center gap-0.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i, false)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className="flex size-11 min-h-[44px] min-w-[36px] items-center justify-center"
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === active ? "h-1.5 w-7 bg-white" : "size-2 bg-white/45"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  },
);
