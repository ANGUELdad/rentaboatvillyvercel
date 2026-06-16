"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/providers/LanguageProvider";
import { SITE_CONTACT } from "@/lib/site";
import { ui2026Reveal, ui2026RevealChild, ui2026Stagger } from "@/lib/motion";

export function TermsPageShell() {
  const { t } = useI18n();
  const page = t.termsPage;

  return (
    <article className="legal-page mx-auto max-w-3xl px-4 sm:px-6">
      <div
        aria-hidden
        className="ui-2026-orb-drift pointer-events-none absolute -left-16 top-24 size-56 rounded-full bg-ds-focus/10 blur-[80px]"
      />

      <motion.div
        initial={ui2026Reveal.initial}
        animate={ui2026Reveal.animate}
        transition={ui2026Reveal.transition}
      >
        <Link href="/" className="legal-page__back">
          ← {t.legal.backHome}
        </Link>
      </motion.div>

      <motion.header
        initial={ui2026Reveal.initial}
        animate={ui2026Reveal.animate}
        transition={{ ...ui2026Reveal.transition, delay: 0.04 }}
        className="legal-page__header"
      >
        <h1 className="legal-page__title">{page.title}</h1>
        <p className="legal-page__section-body mt-4">{page.intro}</p>
      </motion.header>

      <motion.div
        variants={ui2026Stagger}
        initial="hidden"
        animate="visible"
        className="legal-page__sections"
      >
        <motion.section variants={ui2026RevealChild} className="legal-page__section">
          <h2 className="legal-page__section-title">{page.phoneLabel}</h2>
          <div className="flex flex-col gap-3">
            <a
              href={`tel:${SITE_CONTACT.phoneTel}`}
              className="inline-flex items-center gap-2 text-base font-semibold text-ds-brand transition-colors hover:text-ds-text"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              {SITE_CONTACT.phone}
            </a>
            <a
              href={`tel:${SITE_CONTACT.phone2Tel}`}
              className="inline-flex items-center gap-2 text-base font-semibold text-ds-brand transition-colors hover:text-ds-text"
            >
              <Phone className="size-4 shrink-0" aria-hidden />
              {SITE_CONTACT.phone2}
            </a>
          </div>
        </motion.section>

        <motion.section variants={ui2026RevealChild} className="legal-page__section">
          <h2 className="legal-page__section-title">{t.common.email ?? "Email"}</h2>
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="inline-flex items-center gap-2 text-base font-semibold text-ds-brand transition-colors hover:text-ds-text"
          >
            <Mail className="size-4 shrink-0" aria-hidden />
            {SITE_CONTACT.email}
          </a>
        </motion.section>

        <motion.section variants={ui2026RevealChild} className="legal-page__section">
          <h2 className="legal-page__section-title">{page.officeLabel}</h2>
          <p className="legal-page__section-body inline-flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-ds-brand" aria-hidden />
            <span>{page.office}</span>
          </p>
        </motion.section>

        <motion.section variants={ui2026RevealChild} className="legal-page__section">
          <ul className="legal-page__section-body list-disc space-y-2 pl-5">
            {page.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </motion.section>

        <motion.section variants={ui2026RevealChild} className="legal-page__section">
          <p className="legal-page__section-body">{page.bookingNote}</p>
          <Link
            href="/booking"
            className="btn-app-primary ui-btn-label mt-5 inline-flex min-h-12 items-center gap-2 px-6"
          >
            {page.bookingCta}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </motion.section>
      </motion.div>
    </article>
  );
}
