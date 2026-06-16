import { cookies } from "next/headers";
import { LANG_COOKIE, LOCALES, type Locale } from "./types";

const VALID_LOCALES = new Set<string>(LOCALES.map((l) => l.code));

export function parseLocale(value: string | null | undefined): Locale | null {
  if (!value || !VALID_LOCALES.has(value)) return null;
  return value as Locale;
}

/** Server-side locale: ?lang= param, then cookie, default English. */
export async function getRequestLocale(
  langParam?: string | null,
): Promise<Locale> {
  const fromParam = parseLocale(langParam);
  if (fromParam) return fromParam;

  const cookieStore = await cookies();
  const fromCookie = parseLocale(cookieStore.get(LANG_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  return "en";
}
