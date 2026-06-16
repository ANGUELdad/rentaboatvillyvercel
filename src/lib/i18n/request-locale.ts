import { cookies } from "next/headers";
import { LANG_COOKIE, parseLocale, type Locale } from "./types";

export { parseLocale } from "./types";

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
