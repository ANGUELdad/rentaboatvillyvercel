"use client";

import { PageShell } from "@/components/layout/PageShell";
import { SocialProofCarousel } from "@/components/SocialProofCarousel";
import { useI18n } from "@/providers/LanguageProvider";
import type { Testimonial } from "@/types";

export function ReviewsPageShell({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useI18n();

  return (
    <PageShell
      accent="turquoise"
      eyebrow={t.reviews.eyebrow}
      title={t.reviews.title}
      subtitle={t.reviews.subtitle}
    >
      <SocialProofCarousel testimonials={testimonials} variant="page" hideHeader />
    </PageShell>
  );
}
