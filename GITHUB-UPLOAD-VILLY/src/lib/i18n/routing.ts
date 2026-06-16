import type { Locale } from "./types";
import { LOCALES } from "./types";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_PREFIXES = LOCALES.map((l) => l.code);

export function isLocale(value: string): value is Locale {
  return LOCALE_PREFIXES.includes(value as Locale);
}

/** Strip leading /{locale} segment when present. */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0]!)) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname || "/";
}

/** Build a locale-prefixed path (future App Router segments). */
export function localePath(locale: Locale, path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/** Append ?lang= for non-English client navigation (cookie fallback exists, but URL stays in sync). */
export function localizedHref(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  const [base, query] = path.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set("lang", locale);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : `${base}?lang=${locale}`;
}
