"use client";

import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { ScrollReveal, ScrollRevealItem } from "@/components/ui/ScrollReveal";
import {
  EXPERIENCE_PRESETS,
  experiencePackageHref,
} from "@/lib/experience-presets";
import { useI18n } from "@/providers/LanguageProvider";

const TAG_LABELS: Record<string, string> = {
  sunset: "4h · Sunset hours",
  snorkel: "4h · Cove hopping",
  fullday: "8h · Full day rental",
  celebration: "6h · Your own boat",
};

export function ExperiencesShowcase() {
  const { t } = useI18n();
  const exp = t.experiences;
  const items = exp.items ?? [];

  return (
    <div className="experiences-showcase panel-fit min-w-0">
      <div className="even-grid panel-fit min-w-0 gap-5 overflow-hidden lg:gap-6">
        {items.map((item, index) => {
          const preset = EXPERIENCE_PRESETS[index];
          if (!preset) return null;
          const href = experiencePackageHref(preset);

          return (
            <ScrollRevealItem key={item.title} index={index}>
              <article className="ui-2026-card glass-card experience-card group overflow-hidden rounded-2xl border border-ds-border">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <SafeImage
                    src={preset.image}
                    alt={item.title}
                    fill
                    sizes="(max-width:640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3 py-1 text-[11px] font-medium text-ds-text shadow-sm">
                    {TAG_LABELS[preset.tagKey] ?? `${preset.hours}h`}
                  </span>
                </div>

                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-ds-text sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ds-text-secondary">
                      {item.desc}
                    </p>
                  </div>

                  <Link
                    href={href}
                    className="btn-app-primary ui-btn-label inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold sm:w-auto sm:px-6"
                  >
                    {exp.estimateCta ?? exp.buildCta ?? "Estimate rental"}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            </ScrollRevealItem>
          );
        })}

        <ScrollReveal delay={0.08}>
          <div className="experience-custom-cta ui-2026-card glass-card col-span-2 rounded-2xl border border-ds-border p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="icon-badge flex size-12 shrink-0 items-center justify-center">
                <Compass className="size-5 text-ds-brand" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ds-text">
                  {exp.customTitle ?? "Design your own day"}
                </h3>
                <p className="mt-1 text-sm text-ds-text-secondary">
                  {exp.customDesc ??
                    "Pick any boat, route, and duration. We'll shape your perfect Aegean boat day."}
                </p>
              </div>
            </div>
            <Link
              href="/booking"
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-ds-brand/30 bg-ds-brand-subtle px-6 text-sm font-semibold text-ds-brand transition-colors hover:bg-ds-brand-subtle/80 sm:mt-0 sm:w-auto"
            >
              {exp.customCta ?? "Book a boat"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
