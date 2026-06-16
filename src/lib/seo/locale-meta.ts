import { HREFLANG_LOCALES, SITE_URL } from "./config";
import type { Locale } from "@/lib/i18n/types";

/** BCP 47 tags for Open Graph locale fields. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_GB",
  el: "el_GR",
  de: "de_DE",
  ro: "ro_RO",
  bg: "bg_BG",
  sr: "sr_RS",
};

export function localizedPageUrl(path: string, locale: Locale): string {
  const base = `${SITE_URL}${path}`;
  if (locale === "en") return base;
  const sep = path.includes("?") ? "&" : "?";
  return `${base}${sep}lang=${locale}`;
}

export function hreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": localizedPageUrl(path, "en"),
  };
  for (const code of HREFLANG_LOCALES) {
    languages[code] = localizedPageUrl(path, code as Locale);
  }
  return languages;
}

export function ogAlternateLocales(locale: Locale): string[] {
  return HREFLANG_LOCALES.filter((code) => code !== locale).map(
    (code) => OG_LOCALE[code as Locale],
  );
}
