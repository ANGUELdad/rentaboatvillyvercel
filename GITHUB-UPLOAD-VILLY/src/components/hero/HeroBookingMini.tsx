"use client";

import { ArrowRight, Calendar, MapPin, Minus, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { playFeedback } from "@/lib/feedback";
import { maxBookingDateInSiteTz, todayInSiteTz } from "@/lib/security/timezone";
import { MARINA_LOCATION } from "@/lib/site";
import { useI18n } from "@/providers/LanguageProvider";

const MIN_GUESTS = 1;
const MAX_GUESTS = 10;

export function HeroBookingMini({
  onDateChange,
  variant = "default",
}: {
  animated?: boolean;
  onDateChange?: (date: string) => void;
  variant?: "default" | "mobile";
}) {
  const { t } = useI18n();
  const f = t.booking.form ?? {};
  const pb = (t as { packageBuilder?: Record<string, string> }).packageBuilder ?? {};
  const hb = t.hero as typeof t.hero & {
    bookingTitle?: string;
    bookingPreviewDateHint?: string;
    marinaMapsLabel?: string;
    marinaMapsAria?: string;
  };

  const isMobile = variant === "mobile";

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);

  const bookHref = useMemo(() => {
    const qs = new URLSearchParams();
    if (date) qs.set("date", date);
    if (guests !== 2) qs.set("guests", String(guests));
    const query = qs.toString();
    return query ? `/booking?${query}` : "/booking";
  }, [date, guests]);

  const minDate = todayInSiteTz();
  const maxDate = maxBookingDateInSiteTz();
  const guestLabel =
    guests === 1 ? (f.guestCount ?? "guest") : (f.guestCountPlural ?? "guests");
  const title = hb.bookingTitle ?? "Check availability";
  const cta = t.conversion?.booking?.checkAvailability ?? t.hero.cta ?? "Book now";
  const marina = hb.pillMarina ?? MARINA_LOCATION.shortName;
  const mapsLabel = hb.marinaMapsLabel ?? "Get directions";
  const mapsAria =
    hb.marinaMapsAria ?? `Open ${MARINA_LOCATION.shortName} on Google Maps`;

  return (
    <div
      className={cn(
        "hero-booking-mini hero-booking-mini--refined layout-safe w-full min-w-0 max-w-full",
        isMobile && "hero-booking-mini--mobile",
      )}
    >
      <header className="hero-booking-mini__header">
        {!isMobile ? <h2 className="hero-booking-mini__title">{title}</h2> : null}
        <a
          href={MARINA_LOCATION.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hero-booking-mini__marina hero-booking-mini__marina--link tap-target"
          aria-label={mapsAria}
        >
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span>{marina}</span>
          <span className="hero-booking-mini__maps-cta">{mapsLabel}</span>
        </a>
      </header>

      <div className="hero-booking-mini__form">
        <div
          className={cn(
            "hero-booking-mini__row--wide",
            isMobile && "hero-booking-mini__row--mobile",
          )}
        >
          <label className="hero-booking-mini__field">
            <span className="hero-booking-mini__label">
              {!isMobile ? <Calendar className="size-3.5 shrink-0" aria-hidden /> : null}
              {f.date ?? "Date"}
            </span>
            <input
              type="date"
              value={date}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                const nextDate = e.target.value;
                setDate(nextDate);
                onDateChange?.(nextDate);
                if (nextDate) playFeedback("select", "light");
              }}
              className="hero-booking-mini__input tap-target w-full"
              aria-label={f.date ?? "Date"}
            />
          </label>

          <div className="hero-booking-mini__field">
            <span className="hero-booking-mini__label">
              {!isMobile ? <Users className="size-3.5 shrink-0" aria-hidden /> : null}
              {f.guests ?? "Guests"}
            </span>
            <div
              className="hero-booking-mini__stepper"
              role="group"
              aria-label={f.guests ?? "Guests"}
            >
              <button
                type="button"
                className="hero-booking-mini__stepper-btn tap-target"
                aria-label={pb.decreaseGuests ?? "Decrease guests"}
                disabled={guests <= MIN_GUESTS}
                onClick={() => {
                  setGuests((g) => Math.max(MIN_GUESTS, g - 1));
                  playFeedback("select", "light");
                }}
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <output
                className="hero-booking-mini__stepper-value"
                aria-label={`${guests} ${guestLabel}`}
              >
                {guests}
              </output>
              <button
                type="button"
                className="hero-booking-mini__stepper-btn tap-target"
                aria-label={pb.increaseGuests ?? "Increase guests"}
                disabled={guests >= MAX_GUESTS}
                onClick={() => {
                  setGuests((g) => Math.min(MAX_GUESTS, g + 1));
                  playFeedback("select", "light");
                }}
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <Link
          href={bookHref}
          data-sfx-skip
          onClick={() => playFeedback("navigate", "medium")}
          className="hero-cta-shimmer btn-app-primary ui-btn-label hero-booking-mini__cta tap-target"
        >
          {cta}
          <ArrowRight className="size-4 shrink-0 hero-booking-mini__cta-icon" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
