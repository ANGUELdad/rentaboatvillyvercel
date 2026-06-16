"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

interface NetflixRowProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  compact?: boolean;
  children: ReactNode;
}

export function NetflixRow({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  compact = false,
  children,
}: NetflixRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const amount = compact ? 260 : 380;
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className={`netflix-row relative ${compact ? "py-6" : "py-10"}`}>
      <div
        className={`mx-auto flex max-w-6xl items-end justify-between gap-3 px-4 sm:gap-4 sm:px-6 ${
          compact ? "mb-4" : "mb-6"
        }`}
      >
        <div className="min-w-0 flex-1">
          <motion.h2
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`section-title uppercase tracking-[0.12em] ${
              compact ? "!text-base sm:!text-lg" : ""
            }`}
          >
            {title}
          </motion.h2>
          {subtitle && !compact && (
            <p className="section-subtitle body-fit mt-1 hidden max-w-lg text-sm sm:block">
              {subtitle}
            </p>
          )}
          {href && compact && (
            <Link
              href={href}
              className="mt-1 inline-block text-[9px] tracking-[0.18em] text-summer-turquoise/70 uppercase sm:text-[10px]"
            >
              {linkLabel} →
            </Link>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {href && !compact && (
            <Link
              href={href}
              className="hidden text-[10px] tracking-[0.2em] text-summer-turquoise/70 uppercase transition-colors hover:text-summer-turquoise sm:inline"
            >
              {linkLabel} →
            </Link>
          )}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="tap-target flex size-8 items-center justify-center rounded-full border border-ds-border bg-ds-surface/60 text-ds-text-secondary hover:text-ds-text sm:size-9"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-3.5 sm:size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="tap-target flex size-8 items-center justify-center rounded-full border border-ds-border bg-ds-surface/60 text-ds-text-secondary hover:text-ds-text sm:size-9"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-3.5 sm:size-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        {!compact && (
          <>
            <div className="netflix-fade-left pointer-events-none absolute top-0 left-0 z-10 hidden h-full w-12 sm:block sm:w-16" />
            <div className="netflix-fade-right pointer-events-none absolute top-0 right-0 z-10 hidden h-full w-12 sm:block sm:w-16" />
          </>
        )}
        <div
          ref={scrollRef}
          className={`scrollbar-hide flex overflow-x-auto pb-2 ${
            compact ? "gap-3 px-4 sm:gap-4 sm:px-6" : "gap-4 px-4 pb-4 sm:px-6"
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
