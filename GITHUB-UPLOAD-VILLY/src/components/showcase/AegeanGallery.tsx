"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageIcon,
  Play,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import {
  SmartVideo,
  type SmartVideoHandle,
} from "@/components/showcase/SmartVideo";
import { ScrollImageRow } from "@/components/ui/ScrollImageRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { playFeedback } from "@/lib/feedback";
import { scrollReveal, scrollRevealReduced } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { cn } from "@/lib/utils";
import { useI18n } from "@/providers/LanguageProvider";
import type { GalleryData, GalleryItem } from "@/types";

interface AegeanGalleryProps {
  gallery: GalleryData;
}

function GalleryTile({
  item,
  index,
  active,
  onSelect,
  onExpand,
  className,
  priority = false,
  expandLabel = "Expand",
  layout = "grid",
}: {
  item: GalleryItem;
  index: number;
  active: boolean;
  onSelect: (i: number) => void;
  onExpand: () => void;
  className?: string;
  priority?: boolean;
  expandLabel?: string;
  layout?: "stage" | "grid";
}) {
  const isStage = layout === "stage";

  const open = () => {
    onSelect(index);
    playFeedback("open", "medium");
    onExpand();
  };

  const select = () => {
    onSelect(index);
    playFeedback("select", "light");
  };

  return (
    <div
      role="group"
      aria-label={item.alt}
      className={cn(
        "group relative min-h-0 min-w-0 overflow-hidden rounded-2xl bg-ds-elevated text-left",
        active && !isStage && "ring-2 ring-ds-brand/70 ring-offset-2 ring-offset-ds-base",
        className,
      )}
    >
      {item.type === "video" ? (
        <SmartVideo
          src={item.src}
          poster={item.poster}
          aspect={item.aspect}
          alt={item.alt}
          preview
          fill
          onPreviewClick={open}
          className="absolute inset-0 z-[1] rounded-2xl"
        />
      ) : (
        <>
          <button
            type="button"
            data-sfx-skip
            onClick={isStage ? open : select}
            onDoubleClick={isStage ? undefined : onExpand}
            aria-label={item.alt}
            aria-current={active ? "true" : undefined}
            className="absolute inset-0 z-0"
          />
          <SafeImage
            src={item.src}
            alt={item.alt}
            fill
            sizes={
              isStage
                ? "92vw"
                : "(max-width: 768px) 92vw, (max-width: 1024px) 33vw, 25vw"
            }
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
            priority={priority}
          />
        </>
      )}

      {!isStage && (
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-ds-base/65 via-transparent to-transparent opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100 md:opacity-0" />
      )}

      {!isStage && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] hidden p-3 md:block md:opacity-0 md:transition-opacity md:duration-300 md:motion-safe:group-hover:opacity-100">
          <p className="line-clamp-2 text-xs font-medium text-ds-text">
            {item.caption ?? item.alt}
          </p>
        </div>
      )}

      {item.type === "video" && isStage && (
        <span className="pointer-events-none absolute top-3 left-3 z-[4] inline-flex items-center gap-1 rounded-full border border-ds-border-strong bg-ds-surface/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ds-text-secondary">
          <Play className="size-3" />
          Video
        </span>
      )}

      {!isStage && (
        <button
          type="button"
          data-sfx-skip
          onClick={onExpand}
          className="absolute top-2.5 right-2.5 z-10 hidden size-8 items-center justify-center rounded-lg border border-ds-border-strong bg-ds-surface/90 text-ds-text-secondary opacity-0 transition-opacity hover:text-ds-text motion-safe:group-hover:opacity-100 md:flex"
          aria-label={expandLabel}
        >
          <Expand className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function GalleryThumb({
  item,
  index,
  active,
  onSelect,
}: {
  item: GalleryItem;
  index: number;
  active: boolean;
  onSelect: (i: number) => void;
}) {
  const thumbSrc =
    item.type === "video"
      ? (item.poster ?? item.src)
      : (item.thumb ?? item.src);

  return (
    <button
      type="button"
      data-sfx-skip
      role="tab"
      aria-selected={active}
      aria-label={item.alt}
      onClick={() => {
        onSelect(index);
        playFeedback("select", "light");
      }}
      className={cn(
        "aegean-gallery__thumb",
        active && "aegean-gallery__thumb--active",
      )}
    >
      <span className="absolute inset-0" aria-hidden>
        <SafeImage
          key={`${item.id}-${thumbSrc}`}
          src={thumbSrc}
          alt=""
          fill
          sizes="72px"
          className="object-cover"
        />
      </span>
      {item.type === "video" && (
        <span className="aegean-gallery__thumb-play" aria-hidden>
          <Play className="size-3" />
        </span>
      )}
    </button>
  );
}

export function AegeanGallery({ gallery }: AegeanGalleryProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const g = t.gallery ?? t.showcase;
  const items = gallery.items;
  const thumbsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<SmartVideoHandle>(null);
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const current = items[index];
  const total = items.length;

  const scrollThumbTo = useCallback(
    (i: number) => {
      const row = thumbsRef.current;
      const thumb = row?.children[i] as HTMLElement | undefined;
      thumb?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    },
    [reduceMotion],
  );

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      if (clamped !== index) {
        videoRef.current?.pause();
        playFeedback("select", "light");
      }
      setIndex(clamped);
      scrollThumbTo(clamped);
    },
    [total, index, scrollThumbTo],
  );

  const openLightbox = useCallback(() => {
    playFeedback("open", "light");
    setLightbox(true);
  }, []);

  const closeLightbox = useCallback(() => {
    videoRef.current?.pause();
    playFeedback("dismiss", "light");
    setLightbox(false);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, index, goTo, closeLightbox]);

  if (!current || total === 0) return null;

  const counter = (g.counter ?? "{current} of {total}")
    .replace("{current}", String(index + 1))
    .replace("{total}", String(total));

  return (
    <section className="aegean-gallery panel-fit relative w-full min-w-0">
      <div className="w-full min-w-0">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-48px" }}
          variants={reduceMotion ? scrollRevealReduced : scrollReveal}
        >
          <SectionHeader
            eyebrow={g.eyebrow}
            title={g.title}
            subtitle={g.subtitle}
            align="center"
            icon="gallery"
            className="aegean-gallery__head mb-6 sm:mb-8 lg:!text-left lg:[&_.section-eyebrow]:!justify-start lg:[&_.section-subtitle]:!mx-0"
          />
        </motion.div>

        {/* Mobile — one stage + thumb strip (no duplicate grid) */}
        <div className="aegean-gallery__mobile md:hidden">
          <div className="aegean-gallery__stage-wrap">
            <GalleryTile
              item={current}
              index={index}
              active
              onSelect={setIndex}
              onExpand={openLightbox}
              layout="stage"
              className="aegean-gallery__stage aspect-[16/10] w-full"
              priority
              expandLabel={g.expand ?? "Expand"}
            />
            {total > 1 && (
              <>
                <button
                  type="button"
                  data-sfx-skip
                  className="aegean-gallery__stage-arrow aegean-gallery__stage-arrow--prev tap-target"
                  aria-label={g.prev ?? "Previous"}
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  data-sfx-skip
                  className="aegean-gallery__stage-arrow aegean-gallery__stage-arrow--next tap-target"
                  aria-label={g.next ?? "Next"}
                  onClick={() => goTo(index + 1)}
                  disabled={index >= total - 1}
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {total > 1 && (
            <>
              <div
                className="aegean-gallery__dots"
                role="tablist"
                aria-label={g.filmstripHint ?? g.swipeHint}
              >
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    data-sfx-skip
                    role="tab"
                    aria-selected={i === index}
                    aria-label={item.alt}
                    onClick={() => goTo(i)}
                    className={cn(
                      "aegean-gallery__dot",
                      i === index && "aegean-gallery__dot--active",
                    )}
                  />
                ))}
              </div>

              <ScrollImageRow
                ref={thumbsRef}
                className="aegean-gallery__thumbs-row gap-2.5"
                fadeEdges={false}
              >
                {items.map((item, i) => (
                  <GalleryThumb
                    key={item.id}
                    item={item}
                    index={i}
                    active={i === index}
                    onSelect={goTo}
                  />
                ))}
              </ScrollImageRow>
            </>
          )}
        </div>

        {/* Desktop — balanced grid */}
        <div className="aegean-gallery__grid hidden md:grid">
          {items.map((item, i) => (
            <GalleryTile
              key={item.id}
              item={item}
              index={i}
              active={i === index}
              onSelect={setIndex}
              onExpand={openLightbox}
              expandLabel={g.expand ?? "Expand"}
              priority={i < 4}
              className="aegean-gallery__grid-tile aspect-[4/3] w-full"
            />
          ))}
        </div>

        {/* Caption bar */}
        <div className="aegean-gallery__caption glass-panel layout-safe mt-5 flex items-start justify-between gap-4 rounded-2xl sm:mt-6">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-ds-brand">
              {current.type === "video" ? (
                <Play className="size-4 shrink-0" />
              ) : (
                <ImageIcon className="size-4 shrink-0" />
              )}
              <span className="text-pretty">
                {current.caption ?? current.alt}
              </span>
            </p>
            {current.caption && (
              <p className="mt-1.5 text-sm leading-relaxed text-ds-text-muted text-pretty">
                {current.alt}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-md bg-ds-surface/90 px-2.5 py-1 text-xs text-ds-text-secondary">
            {counter}
          </span>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
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
            <header className="aegean-lightbox__toolbar">
              <button
                type="button"
                data-sfx-skip
                onClick={closeLightbox}
                className="aegean-lightbox__back tap-target"
              >
                <ChevronLeft className="size-5 shrink-0" aria-hidden />
                <span>{g.back ?? "Back"}</span>
              </button>
              <span className="aegean-lightbox__counter">{counter}</span>
              <button
                type="button"
                data-sfx-skip
                onClick={closeLightbox}
                className="aegean-lightbox__close tap-target"
                aria-label={g.close ?? "Close"}
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="aegean-lightbox__body">
              {total > 1 && (
                <button
                  type="button"
                  data-sfx-skip
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                  className="aegean-lightbox__nav aegean-lightbox__nav--prev tap-target"
                  aria-label={g.prev ?? "Previous"}
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}

              <div
                key={current.id}
                className={cn(
                  "aegean-lightbox__media",
                  current.type === "video" && "aegean-lightbox__media--video",
                )}
              >
                {current.type === "image" ? (
                  <div className="aegean-lightbox__image-wrap">
                    <SafeImage
                      src={current.src}
                      alt={current.alt}
                      fill
                      sizes="90vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <SmartVideo
                    ref={videoRef}
                    src={current.src}
                    aspect={current.aspect}
                    poster={current.poster}
                    alt={current.alt}
                    theater
                  />
                )}
              </div>

              {total > 1 && (
                <button
                  type="button"
                  data-sfx-skip
                  onClick={() => goTo(index + 1)}
                  disabled={index >= total - 1}
                  className="aegean-lightbox__nav aegean-lightbox__nav--next tap-target"
                  aria-label={g.next ?? "Next"}
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
            </div>

            {(current.caption || current.alt) && (
              <footer className="aegean-lightbox__caption">
                <p className="aegean-lightbox__caption-title">
                  {current.type === "video" && (
                    <Play className="mr-1.5 inline size-3.5 shrink-0" aria-hidden />
                  )}
                  {current.caption ?? current.alt}
                </p>
                {current.caption && (
                  <p className="aegean-lightbox__caption-sub">{current.alt}</p>
                )}
              </footer>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
