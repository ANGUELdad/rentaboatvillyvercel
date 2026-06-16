"use client";

import { useEffect, useState } from "react";
import { readConsentFromDocument } from "@/lib/cookie-utils";

/** True once the visitor has accepted or rejected cookies. */
export function useConsentResolved() {
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    setResolved(!!readConsentFromDocument());

    const onUpdate = () => setResolved(true);
    window.addEventListener("tbc-consent-update", onUpdate);
    return () => window.removeEventListener("tbc-consent-update", onUpdate);
  }, []);

  return resolved;
}
