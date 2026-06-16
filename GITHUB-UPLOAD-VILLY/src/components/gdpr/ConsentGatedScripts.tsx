"use client";

import { useConsentCategory } from "@/hooks/useConsentCategory";

/**
 * Placeholder for analytics/marketing scripts gated by cookie consent.
 * Add Google Analytics or other providers here when analytics consent is granted.
 */
export function ConsentGatedScripts() {
  const { analytics } = useConsentCategory();

  if (!analytics) return null;

  return null;
}
