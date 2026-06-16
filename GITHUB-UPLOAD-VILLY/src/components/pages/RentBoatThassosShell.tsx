"use client";

import { FaqAnswerText } from "@/components/faq/FaqAnswerText";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { playFeedback } from "@/lib/feedback";
import type { SeoHomeSection, SeoHomeLink } from "@/lib/i18n/types";
import { appleSpringSoft, staggerStep } from "@/lib/motion";
import { useI18n } from "@/providers/LanguageProvider";

export interface RentBoatPillarContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: string;
  sections: SeoHomeSection[];
  ctaPrimary: string;
  ctaSecondary: string;
  linksTitle: string;
  linksAria: string;
  links: SeoHomeLink[];
}

function SectionBlock({
  section,
  index,
}: {
  section: SeoHomeSection;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ ...appleSpringSoft, delay: index * staggerStep }}
      className="ui-2026-card glass-card layout-safe min-w-0 rounded-2xl border-ds-border/60 p-5 sm:p-6"
    >
      <h2 className="text-base font-semibold text-ds-text sm:text-lg">{section.title}</h2>
      <div className="mt-3 space-y-3">
        {section.items?.map((item) => (
          <p key={item} className="text-sm leading-relaxed text-ds-text-secondary">
            • <FaqAnswerText text={item} />
          </p>
        ))}
        {section.paragraphs?.map((p) => (
          <p key={p} className="text-sm leading-relaxed text-ds-text-secondary">
            <FaqAnswerText text={p} />
          </p>
        ))}
      </div>
    </motion.section>
  );
}

export function RentBoatThassosShell({
  content,
}: {
  content: RentBoatPillarContent;
}) {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  return (
    <PageShell
      accent="cyan"
      eyebrow={content.eyebrow}
      title={content.title}
      subtitle={content.subtitle}
    >
      <div className="ui-2026-stagger mx-auto w-full max-w-3xl min-w-0 space-y-6">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={appleSpringSoft}
          className="body-fit text-base leading-relaxed text-ds-text-secondary sm:text-lg"
        >
          {content.lead}
        </motion.p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/booking"
            onClick={() => playFeedback("navigate", "medium")}
            className="btn-app-primary ui-btn-label inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold"
          >
            {content.ctaPrimary}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/fleet"
            onClick={() => playFeedback("select", "light")}
            className="btn-glass ui-btn-label inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            {content.ctaSecondary}
          </Link>
        </div>

        {content.sections.map((section, i) => (
          <SectionBlock key={section.title} section={section} index={i} />
        ))}

        <nav
          aria-label={content.linksAria}
          className="glass-panel layout-safe min-w-0 rounded-2xl border-ds-border/60 p-5 sm:p-6"
        >
          <h2 className="text-sm font-semibold tracking-wide text-ds-text uppercase">
            {content.linksTitle}
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {content.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => playFeedback("select", "light")}
                  className="seo-home__link tap-target group flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm"
                >
                  <SiteIcon name="explore" size={14} className="shrink-0 text-ds-brand" />
                  <span className="min-w-0 text-ds-text-secondary group-hover:text-ds-text">
                    {link.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-center text-xs text-ds-text-muted">
          {t.footer.locationLine ?? "New Port of Limenaria · Thassos · Greece"}
        </p>
      </div>
    </PageShell>
  );
}
