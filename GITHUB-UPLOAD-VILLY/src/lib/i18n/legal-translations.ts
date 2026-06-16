import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { getLegal } from "@/lib/data";
import type { LegalData, LegalDocument } from "@/types";
import type { Locale } from "./types";

export type LegalDocumentType = "privacy" | "cookies" | "terms" | "gdpr";

interface LegalTranslationBundle {
  privacy: LegalDocument;
  cookies: LegalDocument;
  terms: LegalDocument;
  gdpr: LegalDocument;
}

const cache = new Map<Locale, LegalTranslationBundle>();

function loadLocaleTranslations(locale: Locale): LegalTranslationBundle | null {
  if (locale === "en") return null;

  const cached = cache.get(locale);
  if (cached) return cached;

  const path = join(
    process.cwd(),
    "data",
    "legal",
    "translations",
    `${locale}.json`,
  );
  if (!existsSync(path)) return null;

  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as LegalTranslationBundle;
    cache.set(locale, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function getLocalizedLegalDocument(
  type: LegalDocumentType,
  locale: Locale,
): LegalDocument {
  const legal = getLegal();
  if (locale === "en") return legal[type];

  const translations = loadLocaleTranslations(locale);
  return translations?.[type] ?? legal[type];
}

/** Apply locale-specific legal documents when static translations exist. */
export function localizeLegalData(legal: LegalData, locale: Locale): LegalData {
  if (locale === "en") return legal;

  const translations = loadLocaleTranslations(locale);
  if (!translations) return legal;

  return {
    ...legal,
    privacy: translations.privacy ?? legal.privacy,
    cookies: translations.cookies ?? legal.cookies,
    terms: translations.terms ?? legal.terms,
    gdpr: translations.gdpr ?? legal.gdpr,
  };
}

export function getLocalizedLegal(locale: Locale): LegalData {
  return localizeLegalData(getLegal(), locale);
}
