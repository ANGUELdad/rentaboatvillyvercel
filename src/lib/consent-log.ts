import { POLICY_VERSION } from "@/lib/consent";

export async function logConsentToServer(prefs: {
  consentId: string;
  analytics: boolean;
  marketing: boolean;
  policyVersion?: string;
}): Promise<void> {
  try {
    await fetch("/api/gdpr/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...prefs,
        policyVersion: prefs.policyVersion ?? POLICY_VERSION,
      }),
    });
  } catch {
    /* offline OK */
  }
}
