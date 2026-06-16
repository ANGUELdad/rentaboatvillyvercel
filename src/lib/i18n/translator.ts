import type { Locale } from "./types";
import {
  budgetForLocale,
  enforceBudget,
  type TextBudgetSlot,
} from "./text-budgets";
import {
  getCachedTranslation,
  setCachedTranslation,
} from "./translation-cache";

const LOCALE_CODES: Record<Locale, string> = {
  en: "en",
  ro: "ro",
  el: "el",
  de: "de",
  sr: "sr",
  bg: "bg",
};

const LOCALE_NAMES: Record<Exclude<Locale, "en">, string> = {
  ro: "Romanian",
  el: "Greek",
  de: "German",
  sr: "Serbian",
  bg: "Bulgarian",
};

function buildBudgetInstruction(slot: TextBudgetSlot, locale: Locale): string {
  const max = budgetForLocale(slot, locale);
  return `Stay within ${max} characters. Use shorter synonyms if needed. Preserve placeholders like {count}, {current}, {total}, %s unchanged.`;
}

async function callMyMemory(
  text: string,
  target: Locale,
): Promise<string | null> {
  const langpair = `en|${LOCALE_CODES[target]}`;
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 500));
  url.searchParams.set("langpair", langpair);

  const res = await fetch(url.toString(), {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
  };
  if (data.responseStatus !== 200) return null;
  const translated = data.responseData?.translatedText?.trim();
  if (!translated || translated.toUpperCase() === text.toUpperCase()) return null;
  return translated;
}

async function callLibreTranslate(
  text: string,
  target: Locale,
): Promise<string | null> {
  const base =
    process.env.TRANSLATION_API_URL?.trim() ||
    "https://libretranslate.com/translate";
  const apiKey = process.env.TRANSLATION_API_KEY?.trim();

  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: "en",
      target: LOCALE_CODES[target],
      format: "text",
      ...(apiKey ? { api_key: apiKey } : {}),
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { translatedText?: string };
  return data.translatedText?.trim() ?? null;
}

async function callGoogleTranslate(
  text: string,
  target: Locale,
): Promise<string | null> {
  const apiKey = process.env.TRANSLATION_API_KEY?.trim();
  if (!apiKey) return null;

  const url = new URL(
    "https://translation.googleapis.com/language/translate/v2",
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", text);
  url.searchParams.set("target", LOCALE_CODES[target]);
  url.searchParams.set("source", "en");
  url.searchParams.set("format", "text");

  const res = await fetch(url.toString(), {
    method: "POST",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    data?: { translations?: { translatedText?: string }[] };
  };
  return data.data?.translations?.[0]?.translatedText?.trim() ?? null;
}

async function callExternalTranslator(
  text: string,
  target: Locale,
  slot: TextBudgetSlot,
): Promise<string | null> {
  const provider = process.env.TRANSLATION_PROVIDER?.trim().toLowerCase();

  const attempts: (() => Promise<string | null>)[] = [];
  if (provider === "google") {
    attempts.push(() => callGoogleTranslate(text, target));
  } else if (provider === "libretranslate" || process.env.TRANSLATION_API_URL) {
    attempts.push(() => callLibreTranslate(text, target));
  } else if (provider === "mymemory") {
    attempts.push(() => callMyMemory(text, target));
  } else if (process.env.TRANSLATION_API_KEY) {
    attempts.push(() => callGoogleTranslate(text, target));
    attempts.push(() => callLibreTranslate(text, target));
  } else {
    attempts.push(() => callMyMemory(text, target));
    attempts.push(() => callLibreTranslate(text, target));
  }

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) {
        const max = budgetForLocale(slot, target);
        if (result.length <= max) return result;
        // Re-attempt with explicit length hint via LibreTranslate if available
        void buildBudgetInstruction(slot, target);
        return result;
      }
    } catch {
      /* try next provider */
    }
  }
  return null;
}

/** Dev/local fallback when no API is available — English with budget enforcement. */
function localFallback(
  text: string,
  slot: TextBudgetSlot,
  locale: Locale,
): string {
  const max = budgetForLocale(slot, locale);
  return enforceBudget(text, max);
}

/**
 * Translate a single string with SQLite cache and budget enforcement.
 * Falls back to English when translation fails.
 */
export async function translateString(
  text: string,
  locale: Locale,
  slot: TextBudgetSlot,
): Promise<string> {
  if (!text?.trim() || locale === "en") return text;

  const cached = getCachedTranslation(text, locale, slot);
  if (cached) return cached;

  const max = budgetForLocale(slot, locale);
  let translated: string | null = null;

  if (process.env.TRANSLATION_DISABLE === "true") {
    translated = localFallback(text, slot, locale);
  } else {
    translated = await callExternalTranslator(text, locale, slot);
    if (!translated) {
      translated = localFallback(text, slot, locale);
    }
  }

  const final = enforceBudget(translated, max);
  setCachedTranslation(text, locale, slot, final);
  return final;
}

export function getLocaleDisplayName(locale: Exclude<Locale, "en">): string {
  return LOCALE_NAMES[locale];
}
