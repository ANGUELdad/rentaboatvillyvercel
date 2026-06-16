"use client";

import { ExternalLink } from "lucide-react";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { GOOGLE_REVIEWS } from "@/lib/site";
import { useI18n } from "@/providers/LanguageProvider";

interface SocialProofStripProps {
  reviewCount?: number;
  recentBookings?: number;
  showGoogle?: boolean;
  className?: string;
}

export function SocialProofStrip({
  reviewCount = 0,
  recentBookings = 0,
  showGoogle = false,
  className = "",
}: SocialProofStripProps) {
  const { t } = useI18n();
  const c = t.conversion?.social ?? {};
  const r = t.reviews;

  const hasReviews = reviewCount > 0;
  const hasBookings = recentBookings > 0;

  if (!hasReviews && !hasBookings) return null;

  const googleLabel = r.googleLabel ?? "Google Reviews";

  return (
    <div
      className={`flex w-full max-w-full min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ds-text-secondary sm:justify-start ${className}`}
      role="status"
    >
      {hasReviews && (
        <span className="text-ds-text-secondary">
          {reviewCount}+{" "}
          {showGoogle ? (r.googleRated ?? googleLabel) : (c.verified ?? "verified reviews")}
        </span>
      )}
      {showGoogle && GOOGLE_REVIEWS.url && (
        <a
          href={GOOGLE_REVIEWS.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-ds-text-muted transition-colors hover:text-ds-text"
        >
          <span className="font-medium text-[#FBBC04]">G</span>
          <span>{googleLabel}</span>
          <ExternalLink className="size-3 opacity-60" aria-hidden />
        </a>
      )}
      {hasBookings && (
        <span className="inline-flex items-center gap-1.5">
          <SiteIcon name="booking" size={14} className="text-ds-brand" aria-hidden />
          {c.bookedThisWeek?.replace("{count}", String(recentBookings)) ??
            `${recentBookings} guests booked this week`}
        </span>
      )}
    </div>
  );
}
