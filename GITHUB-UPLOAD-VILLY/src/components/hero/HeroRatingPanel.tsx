"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSoft } from "@/lib/motion";
import { GOOGLE_REVIEWS } from "@/lib/site";
import { useI18n } from "@/providers/LanguageProvider";

interface HeroRatingPanelProps {
  reviewCount: number;
  animate?: boolean;
}

export function HeroRatingPanel({
  reviewCount,
  animate = false,
}: HeroRatingPanelProps) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const rating = GOOGLE_REVIEWS.rating.toFixed(1);
  const reviewsWord = t.reviews?.googleRated ?? "Confirmed reviews";
  // Visible rating value backs the AggregateRating JSON-LD (Google requires the
  // marked-up rating to be shown to users).
  const label = `${rating} out of 5 — ${reviewCount}+ ${reviewsWord}`;

  const Wrap = animate && !reduceMotion ? motion.div : "div";
  const motionProps =
    animate && !reduceMotion
      ? {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { ...appleSpringSoft, delay: 0.48 },
        }
      : {};

  return (
    <Wrap
      {...motionProps}
      className="hero-rating-panel layout-safe min-w-0"
    >
      <Link
        href="/reviews"
        onClick={() => playFeedback("select", "light")}
        className="hero-rating-panel__link tap-target group"
        aria-label={label}
      >
        <span className="hero-rating-panel__meta min-w-0 truncate">
          <span className="hero-rating-panel__score font-semibold" aria-hidden>
            ★ {rating}
          </span>{" "}
          <CountUp value={reviewCount} startOnView={false} duration={0.7} />
          {" "}
          {reviewsWord}
        </span>
      </Link>
    </Wrap>
  );
}
