"use client";

import { FaqPageExperience } from "@/components/faq/FaqPageExperience";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";

export function FaqPageShell() {
  const { t } = useI18n();
  return (
    <PageShell
      accent="emerald"
      eyebrow={t.faq.eyebrow}
      title={t.faq.title}
      subtitle={t.faq.subtitle}
    >
      <FaqPageExperience />
    </PageShell>
  );
}
