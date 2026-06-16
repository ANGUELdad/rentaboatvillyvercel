"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/providers/LanguageProvider";
import type { TextBudgetSlot } from "@/lib/i18n/text-budgets";

const sessionCache = new Map<string, Record<string, string>>();

function cacheKey(
  locale: string,
  sourceHash: string,
  slot: string,
  fields: Record<string, string>,
): string {
  const fieldKey = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `tbc-t-${locale}-${slot}-${sourceHash}-${fieldKey}`;
}

export function useTranslatedContent<T extends Record<string, string>>(
  fields: T,
  slot: TextBudgetSlot,
): T {
  const { locale, sourceHash } = useI18n();
  const stableKey = useMemo(
    () =>
      Object.entries(fields)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("&"),
    [fields],
  );
  const [translated, setTranslated] = useState<T>(fields);

  useEffect(() => {
    if (locale === "en") {
      setTranslated(fields);
      return;
    }

    const key = cacheKey(locale, sourceHash, slot, fields);
    const mem = sessionCache.get(key);
    if (mem) {
      setTranslated(mem as T);
      return;
    }

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as T;
          sessionCache.set(key, parsed);
          setTranslated(parsed);
          return;
        } catch {
          /* refetch */
        }
      }
    }

    let cancelled = false;
    void fetch("/api/i18n/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, slot, fields }),
    })
      .then((r) => r.json())
      .then((data: { fields?: T }) => {
        if (cancelled) return;
        const next = data.fields ?? fields;
        sessionCache.set(key, next);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(key, JSON.stringify(next));
        }
        setTranslated(next);
      })
      .catch(() => {
        if (!cancelled) setTranslated(fields);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, sourceHash, slot, stableKey]);

  return translated;
}
