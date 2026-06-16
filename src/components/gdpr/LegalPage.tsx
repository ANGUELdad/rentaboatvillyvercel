"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocalizedLegalDocument } from "@/hooks/useLocalizedLegalDocument";
import type { LegalDocumentType } from "@/lib/i18n/legal-translations";
import type { LegalDocument } from "@/types";
import { useI18n } from "@/providers/LanguageProvider";
import { ui2026Reveal, ui2026RevealChild, ui2026Stagger } from "@/lib/motion";
import { GdprRequestForm } from "./GdprRequestForm";

interface LegalPageProps {
  type: LegalDocumentType;
  document: LegalDocument;
  showGdprForm?: boolean;
}

export function LegalPage({ type, document: initialDocument, showGdprForm }: LegalPageProps) {
  const { t } = useI18n();
  const document = useLocalizedLegalDocument(type, initialDocument);

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
        <h1 className="legal-page__title">{document.title}</h1>
        <p className="legal-page__meta">
          {t.legal.lastUpdated}: {document.lastUpdated}
        </p>
      </motion.header>

      <motion.div
        variants={ui2026Stagger}
        initial="hidden"
        animate="visible"
        className="legal-page__sections"
      >
        {document.sections.map((section) => (
          <motion.section
            key={section.heading}
            variants={ui2026RevealChild}
            className="legal-page__section"
          >
            <h2 className="legal-page__section-title">{section.heading}</h2>
            <p className="legal-page__section-body">{section.body}</p>
          </motion.section>
        ))}
      </motion.div>

      {showGdprForm && (
        <motion.div
          initial={ui2026Reveal.initial}
          animate={ui2026Reveal.animate}
          transition={{ ...ui2026Reveal.transition, delay: 0.12 }}
          className="legal-page__form"
        >
          <GdprRequestForm />
        </motion.div>
      )}
    </article>
  );
}
