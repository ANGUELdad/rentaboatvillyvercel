"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/providers/LanguageProvider";
import type { LegalDocumentType } from "@/lib/i18n/legal-translations";
import type { LegalDocument } from "@/types";

export function useLocalizedLegalDocument(
  type: LegalDocumentType,
  initial: LegalDocument,
): LegalDocument {
  const { locale } = useI18n();
  const [document, setDocument] = useState(initial);

  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/i18n/legal?type=${type}&locale=${locale}`)
      .then((r) => r.json())
      .then((data: { document?: LegalDocument }) => {
        if (!cancelled && data.document) setDocument(data.document);
      })
      .catch(() => {
        if (!cancelled) setDocument(initial);
      });

    return () => {
      cancelled = true;
    };
  }, [type, locale]);

  return document;
}
