"use client";

import { Lock, MapPin, Receipt } from "lucide-react";
import { useI18n } from "@/providers/LanguageProvider";

const ICONS = [Lock, MapPin, Receipt] as const;

export function BookingTrustBadges({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const badges = t.conversion?.bookingBadges ?? {};
  const items = [badges.secure, badges.local, badges.transparent].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <ul
      className={`grid w-full max-w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 ${className}`}
      aria-label={badges.ariaLabel ?? "Booking trust badges"}
    >
      {items.map((label, i) => {
        const Icon = ICONS[i] ?? Lock;
        return (
          <li
            key={label}
            className="booking-trust-badge flex min-w-0 items-center gap-2 text-xs text-ds-text-secondary"
          >
            <Icon className="size-4 shrink-0 text-ds-brand" aria-hidden />
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
