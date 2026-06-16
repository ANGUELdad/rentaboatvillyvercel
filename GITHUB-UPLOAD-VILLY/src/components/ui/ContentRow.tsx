"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { ContentRowItem, ContentRowSize } from "@/types/content-row";

const CARD_WIDTH: Record<ContentRowSize, string> = {
  compact: "w-[min(72vw,280px)]",
  default: "w-[min(78vw,320px)]",
  large: "w-[min(85vw,400px)]",
};

const SCROLL_STEP: Record<ContentRowSize, number> = {
  compact: 300,
  default: 340,
  large: 420,
};

interface ContentRowProps {
  title?: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  data: ContentRowItem[];
  size?: ContentRowSize;
  compact?: boolean;
  /** GSAP ScrollTrigger float/zoom — adds `.fleet-gsap-card` class */
  gsapReveal?: boolean;
  /** Hide title row — use when a parent section already provides the heading */
  hideHeader?: boolean;
  /** Transparent background when nested inside another section */
  embedded?: boolean;
  className?: string;
}

function ContentRowCard({
  item,
  size,
  gsapReveal,
}: {
  item: ContentRowItem;
  size: ContentRowSize;
  gsapReveal?: boolean;
}) {
  const width = CARD_WIDTH[size];

  const card = (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative z-[1] snap-start shrink-0 hover:z-20 ${width} ${
        gsapReveal ? "fleet-gsap-card" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ocean-800 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-[0_16px_48px_rgba(19,166,170,0.25)] group-hover:ring-app-teal/30">
        <SafeImage
          src={item.image}
          alt={item.title}
          fill
          sizes={
            size === "compact"
              ? "280px"
              : size === "large"
                ? "400px"
                : "320px"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {item.badge && (
          <span className="absolute top-3 left-3 rounded-lg bg-ocean-950/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            {item.badge}
          </span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/95 via-ocean-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">
              {item.title}
            </h3>
            {item.subtitle && (
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-white/70">
                <MapPin className="size-3 shrink-0 text-app-teal" />
                {item.subtitle}
              </p>
            )}
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-colors group-hover:border-app-teal/40 group-hover:bg-app-teal/20">
            <ArrowUpRight className="size-4 text-white" />
          </span>
        </div>
      </div>
    </motion.article>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

export function ContentRow({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  data,
  size = "default",
  compact = false,
  gsapReveal = false,
  hideHeader = false,
  embedded = false,
  className = "",
}: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const resolvedSize = compact ? "compact" : size;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_STEP[resolvedSize] : SCROLL_STEP[resolvedSize],
      behavior: "smooth",
    });
  };

  return (
    <section
      className={`relative ${embedded ? "" : "summer-section"} ${compact ? "py-6" : embedded ? "py-0" : "py-10"} ${className}`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-end justify-between gap-3 px-4 sm:gap-4 sm:px-6 ${
          hideHeader ? "mb-3 justify-end" : compact ? "mb-4" : "mb-6"
        }`}
      >
        {!hideHeader && (
          <div className="min-w-0 flex-1">
            {title && (
              <h2
                className={`section-title flex items-center gap-2 ${
                  compact ? "!text-lg sm:!text-xl" : ""
                }`}
              >
                <MapPin className="size-5 shrink-0 text-app-teal" />
                {title}
              </h2>
            )}
            {subtitle && !compact && (
              <p className="section-subtitle mt-2 hidden max-w-lg sm:block">
                {subtitle}
              </p>
            )}
            {href && compact && (
              <Link
                href={href}
                className="mt-1 inline-block text-xs font-medium text-app-teal sm:text-sm"
              >
                {linkLabel} →
              </Link>
            )}
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {href && !compact && !hideHeader && (
            <Link
              href={href}
              className="hidden text-sm font-medium text-app-teal transition-colors hover:text-app-teal/80 sm:inline"
            >
              {linkLabel} →
            </Link>
          )}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="tap-target flex size-11 items-center justify-center rounded-full border border-app-teal/25 bg-app-teal/10 text-app-teal transition-colors hover:bg-app-teal/20"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="tap-target flex size-11 items-center justify-center rounded-full border border-app-teal/25 bg-app-teal/10 text-app-teal transition-colors hover:bg-app-teal/20"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-3.5 sm:size-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        {!compact && (
          <>
            <div className="content-row-fade-left pointer-events-none absolute top-0 left-0 z-10 hidden h-full w-12 sm:block sm:w-16" />
            <div className="content-row-fade-right pointer-events-none absolute top-0 right-0 z-10 hidden h-full w-12 sm:block sm:w-16" />
          </>
        )}
        <div
          ref={scrollRef}
          className={`scrollbar-hide flex snap-x snap-mandatory scroll-smooth overflow-x-auto pb-2 ${
            compact ? "gap-3 px-4 sm:gap-4 sm:px-6" : "gap-4 px-4 pb-4 sm:px-6"
          }`}
        >
          {data.map((item) => (
            <ContentRowCard
              key={item.id}
              item={item}
              size={resolvedSize}
              gsapReveal={gsapReveal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
