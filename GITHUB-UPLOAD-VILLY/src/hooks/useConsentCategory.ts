"use client";

import { useEffect, useState } from "react";
import { POLICY_VERSION } from "@/lib/consent";
import { readConsentFromDocument } from "@/lib/cookie-utils";
import type { ConsentPreferences } from "@/types";

interface ConsentCategoryState {
  analytics: boolean;
  marketing: boolean;
  resolved: boolean;
  policyVersion: string;
}

function readState(): ConsentCategoryState {
  const prefs = readConsentFromDocument();
  if (!prefs) {
    return {
      analytics: false,
      marketing: false,
      resolved: false,
      policyVersion: POLICY_VERSION,
    };
  }
  return {
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    resolved: true,
    policyVersion: prefs.policyVersion ?? POLICY_VERSION,
  };
}

export function useConsentCategory(): ConsentCategoryState {
  const [state, setState] = useState<ConsentCategoryState>(readState);

  useEffect(() => {
    setState(readState());

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<ConsentPreferences>).detail;
      if (detail) {
        setState({
          analytics: detail.analytics,
          marketing: detail.marketing,
          resolved: true,
          policyVersion: detail.policyVersion ?? POLICY_VERSION,
        });
      } else {
        setState(readState());
      }
    };

    window.addEventListener("tbc-consent-update", onUpdate);
    return () => window.removeEventListener("tbc-consent-update", onUpdate);
  }, []);

  return state;
}
