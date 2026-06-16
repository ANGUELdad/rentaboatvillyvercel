"use client";

import { Suspense } from "react";
import { BookingSection } from "@/components/BookingSection";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

export function BookingPageShell({ boats }: { boats: PublicBoat[] }) {
  const { t } = useI18n();

  return (
    <PageShell
      accent="emerald"
      eyebrow={t.booking.eyebrow}
      title={t.booking.title}
    >
      <div className="booking-page">
        <Suspense
          fallback={
            <p className="booking-page__loading py-16 text-center text-sm text-ds-text-muted">
              Loading booking form…
            </p>
          }
        >
          <BookingSection boats={boats} hideHeader />
        </Suspense>
      </div>
    </PageShell>
  );
}
