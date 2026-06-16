"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShipWheel, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getLocalizedPublicTestimonials, sortFeaturedTestimonials } from "@/lib/testimonials";
import { useI18n } from "@/providers/LanguageProvider";
import type { Testimonial } from "@/types";

interface HomeBentoTrustProps {
  testimonials: Testimonial[];
}

export function HomeBentoTrust({ testimonials }: HomeBentoTrustProps) {
  const { t, locale } = useI18n();
  const b = t.home.bento ?? {
    ariaLabel: "Why book today",
    captainTitle: "Be your own captain",
    captainBody: "Zero experience needed. Free safety briefing before every departure.",
    reviewsTitle: "What guests say",
  };
  const reduceMotion = useReducedMotion();

  const localized = useMemo(
    () => sortFeaturedTestimonials(getLocalizedPublicTestimonials(testimonials, locale)).slice(0, 6),
    [testimonials, locale],
  );
  const tickerItems = useMemo(
    () =>
      localized.length > 0
        ? localized.map((item) => item.text)
        : [b.captainBody],
    [localized, b.captainBody],
  );

  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || tickerItems.length <= 1) return;
    const id = window.setInterval(() => {
      setReviewIndex((i) => (i + 1) % tickerItems.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [reduceMotion, tickerItems.length]);

  useEffect(() => {
    setReviewIndex(0);
  }, [locale, tickerItems.length]);

  const Wrap = reduceMotion ? "section" : motion.section;

  return (
    <Wrap
      className="home-bento-trust"
      aria-label={b.ariaLabel}
      {...(reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 24 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-8%" },
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          })}
    >
      <div className="home-bento-trust__grid">
        <article className="home-bento-trust__card home-bento-trust__card--captain bento-card glass-2026-panel">
          <div className="home-bento-trust__captain-icon center-container" aria-hidden>
            <ShipWheel className="size-7 shrink-0" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="home-bento-trust__card-title card-text">{b.captainTitle}</h2>
            <p className="home-bento-trust__card-body card-text">{b.captainBody}</p>
          </div>
        </article>

        <article className="home-bento-trust__card home-bento-trust__card--reviews bento-card glass-2026-panel">
          <div className="home-bento-trust__reviews-head card-text">
            <Star className="size-4 shrink-0 text-brand-green" aria-hidden />
            <span className="home-bento-trust__reviews-label">{b.reviewsTitle}</span>
          </div>
          <div className="home-bento-trust__quote-slot" aria-live="polite">
            {reduceMotion ? (
              <blockquote className="home-bento-trust__quote card-text">
                “{tickerItems[0]}”
              </blockquote>
            ) : (
              <motion.blockquote
                key={reviewIndex}
                className="home-bento-trust__quote card-text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                “{tickerItems[reviewIndex]}”
              </motion.blockquote>
            )}
          </div>
        </article>
      </div>
    </Wrap>
  );
}
