import { randomUUID } from "@/lib/security/ids";
import type { ConsentPreferences } from "@/types";

export const CONSENT_COOKIE = "tbc-consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;
export const POLICY_VERSION = "2026-06-08";

export function parseConsentCookie(
  value: string | undefined
): ConsentPreferences | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as ConsentPreferences;
    if (parsed.consentId && typeof parsed.analytics === "boolean") {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function buildConsentCookie(prefs: {
  analytics: boolean;
  marketing: boolean;
  consentId?: string;
  policyVersion?: string;
}): ConsentPreferences {
  return {
    consentId: prefs.consentId ?? `c-${randomUUID()}`,
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    policyVersion: prefs.policyVersion ?? POLICY_VERSION,
    timestamp: new Date().toISOString(),
  };
}
