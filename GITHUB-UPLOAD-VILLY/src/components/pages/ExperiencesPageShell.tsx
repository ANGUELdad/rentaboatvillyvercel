"use client";

import { Sparkles } from "lucide-react";
import { ExperiencesShowcase } from "@/components/experiences/ExperiencesShowcase";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/providers/LanguageProvider";

export function ExperiencesPageShell() {
  const { t } = useI18n();
  const exp = t.experiences;

  return (
    <PageShell
      accent="coral"
      eyebrow={exp.eyebrow}
      title={exp.title}
      subtitle={exp.subtitle}
      eyebrowIcon={Sparkles}
    >
      <ExperiencesShowcase />
    </PageShell>
  );
}
