"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { appleSpringSoft, homeScrollViewport } from "@/lib/motion";
import { GOOGLE_REVIEWS } from "@/lib/site";
import { useI18n } from "@/providers/LanguageProvider";

interface GuestRatingsScoreProps {
  reviewCount: number;
  recentBookings?: number;
  className?: string;
}

export function GuestRatingsScore({
  reviewCount,
  recentBookings = 0,
  className = "",
}: GuestRatingsScoreProps) {
  const { t } = useI18n();
  const r = t.reviews;
  const c = t.conversion?.social ?? {};
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={homeScrollViewport}
      transition={appleSpringSoft}
      className={`guest-ratings-score ${className}`.trim()}
      aria-label={`${GOOGLE_REVIEWS.rating.toFixed(1)} out of 5 — ${reviewCount}+ ${
        r.googleRated ?? "confirmed reviews"
      }`}
    >
      <div className="guest-ratings-score__body">
        <p className="guest-ratings-score__score">
          <span className="guest-ratings-score__score-value font-semibold text-ds-text">
            {GOOGLE_REVIEWS.rating.toFixed(1)}
          </span>
          <span className="guest-ratings-score__stars" aria-hidden>
            ★★★★★
          </span>
        </p>
        <p className="guest-ratings-score__count">
          <CountUp
            value={reviewCount}
            suffix="+"
            className="font-semibold text-ds-text"
          />{" "}
          {r.googleRated ?? "Confirmed reviews"}
        </p>
        <p className="guest-ratings-score__trust">
          {r.trustLine ?? r.verifiedGuests ?? "Verified guest boat rentals"}
        </p>
      </div>

      <div className="guest-ratings-score__actions">
        {GOOGLE_REVIEWS.url && (
          <a
            href={GOOGLE_REVIEWS.url}
            target="_blank"
            rel="noopener noreferrer"
            className="guest-ratings-score__google tap-target"
          >
            <span className="guest-ratings-score__google-mark" aria-hidden>
              G
            </span>
            <span>{r.viewOnGoogle ?? "View on Google"}</span>
            <ExternalLink className="size-3.5 opacity-60" aria-hidden />
          </a>
        )}
        {recentBookings > 0 && (
          <p className="guest-ratings-score__pulse">
            <SiteIcon name="booking" size={14} className="text-ds-brand" aria-hidden />
            {(() => {
              const tpl = c.bookedThisWeek ?? "{count} guests booked this week";
              const parts = tpl.split("{count}");
              if (parts.length !== 2) return tpl.replace("{count}", String(recentBookings));
              return (
                <>
                  {parts[0]}
                  <CountUp
                    value={recentBookings}
                    startOnView
                    duration={0.75}
                    className="font-semibold"
                  />
                  {parts[1]}
                </>
              );
            })()}
          </p>
        )}
      </div>
    </motion.article>
  );
}
