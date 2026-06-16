import { CONSENT_COOKIE, parseConsentCookie } from "@/lib/consent";
import type { ConsentPreferences } from "@/types";

const STORAGE_KEY = "tbc-consent-prefs";
const MARKER_COOKIE = "tbc-consent-ok";

function readFromStorage(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ConsentPreferences;
      if (parsed.consentId && typeof parsed.analytics === "boolean") {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function readFromCookie(): ConsentPreferences | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  const raw = match.slice(CONSENT_COOKIE.length + 1);
  try {
    return parseConsentCookie(decodeURIComponent(raw));
  } catch {
    return parseConsentCookie(raw);
  }
}

export function readConsentFromDocument(): ConsentPreferences | null {
  return readFromStorage() ?? readFromCookie();
}

export function writeConsentToDocument(prefs: ConsentPreferences) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode — cookie fallback only */
  }

  const value = encodeURIComponent(JSON.stringify(prefs));
  const maxAge = 60 * 60 * 24 * 365;
  const secure = window.location.protocol === "https:" ? ";Secure" : "";

  document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${maxAge};SameSite=Lax${secure}`;
  document.cookie = `${MARKER_COOKIE}=1;path=/;max-age=${maxAge};SameSite=Lax${secure}`;

  window.dispatchEvent(new CustomEvent("tbc-consent-update", { detail: prefs }));
}
