"use client";

import { motion, useReducedMotion } from "framer-motion";
import { appleSpringSnappy, starPopStagger, starStagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-3",
  md: "size-4",
  lg: "size-6",
  xl: "size-7",
  "2xl": "size-8",
} as const;

type StarRatingSize = keyof typeof SIZES;

interface StarRatingProps {
  /** Rating value 0–5 (supports halves). */
  value: number;
  size?: StarRatingSize;
  className?: string;
  /** Accessible label override. */
  label?: string;
  /** Show numeric value beside stars. */
  showValue?: boolean;
  /** Staggered fill-in + subtle glow on filled stars. */
  animated?: boolean;
  /** Big pop-in per star, one at a time, shine burst, then settle. */
  popEntrance?: boolean;
  /** Gold/amber shimmer sweep on filled stars (CSS-only). Defaults to true when animated. */
  shimmer?: boolean;
  /** Stronger pulsing glow on filled stars. */
  glow?: boolean;
  /** Delay before star animation starts (seconds). */
  delay?: number;
  /** Change to re-trigger fill animation (e.g. slide id). */
  animationKey?: string | number;
}

function StarSvg({
  fill,
  index,
  className,
  shimmer = false,
  glow = false,
  gradId,
}: {
  fill: "empty" | "half" | "full";
  index: number;
  className?: string;
  shimmer?: boolean;
  glow?: boolean;
  gradId: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={cn(
        "shrink-0",
        className,
        glow && fill !== "empty" && "star-svg-glow",
        shimmer && fill === "full" && "star-svg-shimmer",
      )}
    >
      {fill === "half" && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        fill={
          fill === "empty"
            ? "none"
            : fill === "half"
              ? `url(#${gradId})`
              : "currentColor"
        }
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className={cn(fill === "half" && shimmer && "star-half-shimmer")}
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.77l-4.94 2.94.94-5.5-4-3.9 5.53-.8L10 1.5z"
      />
    </svg>
  );
}

function starFillAt(index: number, value: number): "empty" | "half" | "full" {
  const clamped = Math.max(0, Math.min(5, value));
  const star = index + 1;
  if (clamped >= star) return "full";
  if (clamped >= star - 0.5) return "half";
  return "empty";
}

function StarContent({
  fill,
  index,
  sizeClass,
  shimmer,
  glow,
  motionKey,
  withMotion,
}: {
  fill: "empty" | "half" | "full";
  index: number;
  sizeClass: string;
  shimmer: boolean;
  glow: boolean;
  motionKey: string | number;
  withMotion: boolean;
}) {
  const svg = (
    <StarSvg
      fill={fill}
      index={index}
      className={sizeClass}
      shimmer={shimmer}
      glow={glow}
      gradId={`star-half-${motionKey}-${index}`}
    />
  );

  if (withMotion) {
    return (
      <motion.span className="inline-flex" initial={false} animate={{ opacity: 1 }}>
        {svg}
      </motion.span>
    );
  }

  return (
    <span
      className="inline-flex"
      data-star-index={
        (shimmer && fill === "full") || (glow && fill !== "empty") ? index : undefined
      }
    >
      {svg}
    </span>
  );
}

function AnimatedStar({
  fill,
  index,
  sizeClass,
  delay,
  animate,
  shimmer,
  glow,
  motionKey,
  popEntrance,
}: {
  fill: "empty" | "half" | "full";
  index: number;
  sizeClass: string;
  delay: number;
  animate: boolean;
  shimmer: boolean;
  glow: boolean;
  motionKey: string | number;
  popEntrance: boolean;
}) {
  const stagger = popEntrance ? starPopStagger : starStagger;
  const starDelay = delay + index * stagger;
  const isFilled = fill !== "empty";

  if (popEntrance && animate) {
    const peakScale = isFilled ? 2.65 : 1.35;

    return (
      <motion.span
        key={`${motionKey}-pop-${index}`}
        className="star-entrance-wrap inline-flex origin-center"
        data-star-index={glow && isFilled ? index : undefined}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, peakScale, 0.88, 1],
          opacity: [0, 1, 1, 1],
        }}
        transition={{
          delay: starDelay,
          duration: 0.68,
          times: [0, 0.3, 0.65, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {isFilled && (
          <span
            className="star-entrance-burst"
            aria-hidden
            style={{ animationDelay: `${starDelay + 0.08}s` }}
          />
        )}
        <motion.span
          className="star-entrance-star inline-flex"
          animate={{
            filter: isFilled
              ? [
                  "brightness(1) drop-shadow(0 0 0 transparent)",
                  "brightness(2.4) drop-shadow(0 0 14px rgba(255, 220, 100, 0.95))",
                  "brightness(1.1) drop-shadow(0 0 4px rgba(255, 190, 60, 0.45))",
                  "brightness(1) drop-shadow(0 0 2px rgba(255, 200, 80, 0.25))",
                ]
              : undefined,
          }}
          transition={{
            delay: starDelay,
            duration: 0.68,
            times: [0, 0.28, 0.58, 1],
          }}
        >
          <StarSvg
            fill={fill}
            index={index}
            className={sizeClass}
            shimmer={shimmer && isFilled}
            glow={glow && isFilled}
            gradId={`star-half-${motionKey}-${index}`}
          />
        </motion.span>
      </motion.span>
    );
  }

  return (
    <motion.span
      className="inline-flex origin-center"
      data-star-index={glow && isFilled ? index : undefined}
      initial={animate ? { scale: 0, opacity: 0, rotate: -18 } : false}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{
        ...appleSpringSnappy,
        delay: starDelay,
      }}
    >
      <StarContent
        fill={fill}
        index={index}
        sizeClass={sizeClass}
        shimmer={shimmer}
        glow={glow}
        motionKey={motionKey}
        withMotion
      />
    </motion.span>
  );
}

export function StarRating({
  value,
  size = "md",
  className,
  label,
  showValue = false,
  animated = false,
  popEntrance = false,
  shimmer,
  glow = false,
  delay = 0,
  animationKey = "static",
}: StarRatingProps) {
  const reducedMotion = useReducedMotion();
  const sizeClass = SIZES[size];
  const display = Number.isFinite(value) ? value.toFixed(1) : "—";
  const shouldAnimate = animated && !reducedMotion;
  const shouldPop = popEntrance && shouldAnimate;
  const shouldShimmer = (shimmer ?? animated) && !reducedMotion;
  const shouldGlow = (glow ?? animated) && !reducedMotion;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        shouldPop && "star-rating-pop",
        className,
      )}
      role="img"
      aria-label={label ?? `${display} out of 5 stars`}
    >
      <span className="inline-flex gap-0.5 text-summer-gold">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = starFillAt(i, value);
          if (shouldAnimate) {
            return (
              <AnimatedStar
                key={`${animationKey}-${i}`}
                fill={fill}
                index={i}
                sizeClass={sizeClass}
                delay={delay}
                animate={shouldAnimate}
                shimmer={shouldShimmer}
                glow={shouldGlow}
                motionKey={animationKey}
                popEntrance={shouldPop}
              />
            );
          }
          if (shouldShimmer || shouldGlow) {
            return (
              <StarContent
                key={`${animationKey}-${i}`}
                fill={fill}
                index={i}
                sizeClass={sizeClass}
                shimmer={shouldShimmer}
                glow={shouldGlow}
                motionKey={animationKey}
                withMotion={false}
              />
            );
          }
          return (
            <StarSvg
              key={i}
              index={i}
              fill={fill}
              className={sizeClass}
              glow={false}
              gradId={`star-half-static-${i}`}
            />
          );
        })}
      </span>
      {showValue && (
        <span className="text-sm font-semibold tabular-nums text-ds-text">{display}</span>
      )}
    </span>
  );
}
