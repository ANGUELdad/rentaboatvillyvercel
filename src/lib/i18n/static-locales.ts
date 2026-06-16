import bg from "../../../data/locales/bg.json";
import de from "../../../data/locales/de.json";
import el from "../../../data/locales/el.json";
import en from "../../../data/locales/en.json";
import ro from "../../../data/locales/ro.json";
import sr from "../../../data/locales/sr.json";
import { deepMerge } from "./merge";
import type { Locale, LocaleStrings } from "./types";

const english = en as LocaleStrings;

const bundles: Record<Locale, LocaleStrings> = {
  en: english,
  el: deepMerge(english, el as Partial<LocaleStrings>),
  de: deepMerge(english, de as Partial<LocaleStrings>),
  ro: deepMerge(english, ro as Partial<LocaleStrings>),
  sr: deepMerge(english, sr as Partial<LocaleStrings>),
  bg: deepMerge(english, bg as Partial<LocaleStrings>),
};

/** Pre-built UI dictionary — works on client + server (no runtime translation API). */
export function getLocaleDictionary(locale: Locale): LocaleStrings {
  return bundles[locale] ?? english;
}

export function hasStaticLocaleDictionary(locale: Locale): boolean {
  return locale === "en" || locale in bundles;
}
