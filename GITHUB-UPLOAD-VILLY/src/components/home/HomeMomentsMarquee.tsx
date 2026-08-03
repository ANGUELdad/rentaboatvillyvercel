"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SafeImage } from "@/components/SafeImage";
import {
  SmartVideo,
  type SmartVideoHandle,
} from "@/components/showcase/SmartVideo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ParallaxLayer } from "@/components/ui/ParallaxLayer";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft, homeScrollViewport, scrollReveal, scrollRevealReduced } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";
import type { GalleryItem } from "@/types";

function posterFor(item: GalleryItem) {
  return item.type === "video" ? (item.poster ?? item.src) : item.src;
}

function MomentTile({
  item,
  tall = false,
  onPlayVideo,
}: {
  item: GalleryItem;
  tall?: boolean;
  onPlayVideo?: (item: GalleryItem) => void;
}) {
  const isVideo = item.type === "video";

  return (
    <figure
      className={`home-moments-marquee__tile group ${tall ? "home-moments-marquee__tile--tall" : ""}`}
    >
      <div className="home-moments-marquee__frame">
        {isVideo && onPlayVideo ? (
          <button
            type="button"
            data-sfx-skip
            className="home-moments-marquee__trigger"
            onClick={() => {
              playFeedback("open", "light");
              onPlayVideo(item);
            }}
            aria-label={`Play video: ${item.alt}`}
          >
            <ParallaxLayer className="absolute inset-0 scale-110" intensity={0.09}>
              <SafeImage
                src={posterFor(item)}
                alt=""
                fill
                sizes="(max-width: 768px) 42vw, 280px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
            </ParallaxLayer>
            <span className="home-moments-marquee__play" aria-hidden>
              <Play className="home-moments-marquee__play-icon" />
            </span>
          </button>
        ) : (
          /* Image scroll: the photo drifts vertically inside its fixed frame as
             the page moves. Scaled slightly past the frame so the drift never
             exposes an edge. */
          <ParallaxLayer className="absolute inset-0 scale-110" intensity={0.09}>
            <SafeImage
              src={posterFor(item)}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 42vw, 280px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
          </ParallaxLayer>
        )}
        <div className="home-moments-marquee__shine" aria-hidden />
        {item.caption && (
          <figcaption className="home-moments-marquee__caption">{item.caption}</figcaption>
        )}
      </div>
    </figure>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  onPlayVideo,
}: {
  items: GalleryItem[];
  reverse?: boolean;
  onPlayVideo?: (item: GalleryItem) => void;
}) {
  const loop = [...items, ...items];

  return (
    <div className="home-moments-marquee__viewport">
      <div
        className={`home-moments-marquee__track ${reverse ? "home-moments-marquee__track--reverse" : ""}`}
      >
        {/* Every third tile used to switch to a 3:4 portrait frame at a
            different width. Mixed with landscape neighbours in a moving belt
            that read as a ragged pile rather than an editorial layout — the
            eye had no baseline to settle on. One shape for every tile. */}
        {loop.map((item, i) => (
          <MomentTile
            key={`${item.id}-${i}`}
            item={item}
            onPlayVideo={onPlayVideo}
          />
        ))}
      </div>
    </div>
  );
}

function MomentsVideoLightbox({
  items,
  index,
  onClose,
  onGoTo,
  labels,
  reduceMotion,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onGoTo: (next: number) => void;
  labels: {
    back: string;
    close: string;
    prev: string;
    next: string;
    counter: string;
  };
  reduceMotion: boolean | null;
}) {
  const videoRef = useRef<SmartVideoHandle>(null);
  const [mounted, setMounted] = useState(false);
  const current = items[index];
  const total = items.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("aegean-lightbox-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("aegean-lightbox-open");
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onGoTo(index - 1);
      if (e.key === "ArrowRight") onGoTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, onGoTo]);

  if (!current || !mounted) return null;

  const counter = labels.counter
    .replace("{current}", String(index + 1))
    .replace("{total}", String(total));

  const dialog = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={current.caption ?? current.alt}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      style={{ zIndex: Z.sheet }}
      className="aegean-lightbox fixed inset-0 flex flex-col"
    >
      <button
        type="button"
        data-sfx-skip
        className="aegean-lightbox__scrim"
        aria-label={labels.close}
        onClick={onClose}
      />

      <header className="aegean-lightbox__toolbar">
        <button
          type="button"
          data-sfx-skip
          onClick={onClose}
          className="aegean-lightbox__back tap-target"
        >
          <ChevronLeft className="size-5 shrink-0" aria-hidden />
          <span>{labels.back}</span>
        </button>
        <span className="aegean-lightbox__counter">{counter}</span>
        <button
          type="button"
          data-sfx-skip
          onClick={onClose}
          className="aegean-lightbox__close tap-target"
          aria-label={labels.close}
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="aegean-lightbox__body">
        {total > 1 && (
          <button
            type="button"
            data-sfx-skip
            onClick={() => onGoTo(index - 1)}
            disabled={index === 0}
            className="aegean-lightbox__nav aegean-lightbox__nav--prev tap-target"
            aria-label={labels.prev}
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        <div key={current.id} className="aegean-lightbox__media aegean-lightbox__media--video">
          <SmartVideo
            ref={videoRef}
            src={current.src}
            aspect={current.aspect}
            poster={current.poster}
            alt={current.alt}
            theater
          />
        </div>

        {total > 1 && (
          <button
            type="button"
            data-sfx-skip
            onClick={() => onGoTo(index + 1)}
            disabled={index >= total - 1}
            className="aegean-lightbox__nav aegean-lightbox__nav--next tap-target"
            aria-label={labels.next}
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {(current.caption || current.alt) && (
        <footer className="aegean-lightbox__caption">
          <p className="aegean-lightbox__caption-title">
            <Play className="mr-1.5 inline size-3.5 shrink-0" aria-hidden />
            {current.caption ?? current.alt}
          </p>
          {current.caption && (
            <p className="aegean-lightbox__caption-sub">{current.alt}</p>
          )}
        </footer>
      )}
    </motion.div>
  );

  return createPortal(dialog, document.body);
}

export function HomeMomentsMarquee({ items }: { items: GalleryItem[] }) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const g = t.gallery ?? t.showcase;
  const visuals = items.filter((item) => item.type === "video" || item.poster || item.src);
  const videoItems = visuals.filter((item) => item.type === "video");
  /* Was videos-only, which showed 7 tiles and left the 8 photos unused — half
     the gallery never reached the visitor. Everything goes in the belt; the
     video tiles still carry the play affordance and open the lightbox, the
     photos are just scenery. */
  const marqueeItems = visuals;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeInView = useInView(sectionRef, { margin: "120px 0px" });

  const openVideo = useCallback(
    (item: GalleryItem) => {
      const idx = videoItems.findIndex((v) => v.id === item.id);
      setLightboxIndex(idx >= 0 ? idx : 0);
    },
    [videoItems],
  );

  const closeLightbox = useCallback(() => {
    playFeedback("dismiss", "light");
    setLightboxIndex(null);
  }, []);

  const goToVideo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(videoItems.length - 1, next));
      if (clamped !== lightboxIndex) {
        playFeedback("select", "light");
      }
      setLightboxIndex(clamped);
    },
    [videoItems.length, lightboxIndex],
  );

  if (marqueeItems.length < 4) return null;

  const pauseMarquee = lightboxIndex !== null || !marqueeInView;


  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-moments-heading"
      className={`home-moments-marquee relative w-full min-w-0 overflow-hidden${pauseMarquee ? " home-moments-marquee--paused" : ""}`}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={homeScrollViewport}
        variants={reduceMotion ? scrollRevealReduced : scrollReveal}
        className="home-section-inset mb-6 sm:mb-8"
      >
        <SectionHeader
          titleId="home-moments-heading"
          eyebrow={g.eyebrow}
          title={g.title}
          subtitle={g.subtitle}
          align="center"
          icon="gallery"
        />
      </motion.div>

      <motion.div
        className="home-moments-marquee__rows space-y-3 sm:space-y-4"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={homeScrollViewport}
        transition={{ ...appleSpringSoft, delay: 0.08 }}
      >
        {/* Was two belts sliding in opposite directions with the items split
            between them. Nothing could hold your eye — whichever tile you
            looked at, the row underneath was moving the other way, and each
            video only got half the width. One row, every item, one direction. */}
        <MarqueeRow items={marqueeItems} onPlayVideo={openVideo} />
      </motion.div>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={homeScrollViewport}
        transition={appleSpringSoft}
        className="home-section-inset mt-4 text-center text-xs text-ds-text-muted sm:text-sm"
      >
        {g.swipeHint}{" "}
        <Link href="/experiences" className="font-medium text-ds-brand hover:underline">
          {t.nav.experiences}
        </Link>
      </motion.p>

      <AnimatePresence>
        {lightboxIndex !== null && videoItems.length > 0 && (
          <MomentsVideoLightbox
            items={videoItems}
            index={lightboxIndex}
            onClose={closeLightbox}
            onGoTo={goToVideo}
            labels={{
              back: g.back ?? "Back",
              close: g.close ?? "Close gallery",
              prev: g.prev ?? "Previous",
              next: g.next ?? "Next",
              counter: g.counter ?? "{current} of {total}",
            }}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
