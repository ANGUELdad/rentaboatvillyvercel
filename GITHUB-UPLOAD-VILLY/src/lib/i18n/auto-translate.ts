import { readFileSync } from "fs";
import { join } from "path";
import { getEnglishDictionary } from "./dictionary";
import { hashString } from "./hash";
import {
  getLocaleSnapshot,
  setLocaleSnapshot,
} from "./translation-cache";
import { resolveBudgetSlot, type TextBudgetSlot } from "./text-budgets";
import { translateString } from "./translator";
import {
  LOCALE_SNAPSHOT_CACHE_VERSION,
  type Locale,
  type LocaleStrings,
} from "./types";

let sourceHashMemo: string | null = null;

/** Hash of en.json — invalidates locale snapshots when content changes. */
export function getSourceHash(): string {
  if (sourceHashMemo && process.env.NODE_ENV === "production") {
    return sourceHashMemo;
  }
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "locales", "en.json"),
      "utf8",
    );
    const hash = hashString(raw);
    if (process.env.NODE_ENV === "production") sourceHashMemo = hash;
    return hash;
  } catch {
    const hash = hashString(JSON.stringify(getEnglishDictionary()));
    if (process.env.NODE_ENV === "production") sourceHashMemo = hash;
    return hash;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Curated overrides from data/locales/{locale}.json — wins over API translation. */
function loadLocaleOverrides(locale: Locale): Record<string, unknown> | null {
  if (locale === "en") return null;
  try {
    const raw = readFileSync(
      join(process.cwd(), "data", "locales", `${locale}.json`),
      "utf8",
    );
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mergeLocaleOverrides<T>(base: T, override: Record<string, unknown>): T {
  if (Array.isArray(base) || Array.isArray(override)) {
    return (override as T) ?? base;
  }
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override as T) ?? base;
  }

  const merged = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override)) {
    const existing = merged[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      merged[key] = mergeLocaleOverrides(existing, value);
    } else {
      merged[key] = value;
    }
  }
  return merged as T;
}

async function translateTree(
  source: unknown,
  locale: Locale,
  basePath = "",
): Promise<unknown> {
  if (typeof source === "string") {
    const slot = resolveBudgetSlot(basePath);
    return translateString(source, locale, slot);
  }
  if (Array.isArray(source)) {
    return Promise.all(
      source.map((item, i) =>
        translateTree(item, locale, `${basePath}[${i}]`),
      ),
    );
  }
  if (isPlainObject(source)) {
    const entries = await Promise.all(
      Object.entries(source).map(async ([key, value]) => {
        const path = basePath ? `${basePath}.${key}` : key;
        return [key, await translateTree(value, locale, path)] as const;
      }),
    );
    return Object.fromEntries(entries);
  }
  return source;
}

/** Server-only: full dictionary — uses bundled locale JSON (reliable on Vercel). */
export async function getTranslatedDictionary(
  locale: Locale,
): Promise<LocaleStrings> {
  const { getLocaleDictionary, hasStaticLocaleDictionary } = await import(
    "./static-locales"
  );
  if (hasStaticLocaleDictionary(locale)) {
    return getLocaleDictionary(locale);
  }

  const sourceHash = getSourceHash();
  const snapshotKey = `${LOCALE_SNAPSHOT_CACHE_VERSION}:${sourceHash}`;
  const cached = getLocaleSnapshot(locale, snapshotKey);
  if (cached) {
    return JSON.parse(cached) as LocaleStrings;
  }

  const translated = (await translateTree(
    getEnglishDictionary(),
    locale,
  )) as LocaleStrings;

  const overrides = loadLocaleOverrides(locale);
  const dictionary = overrides
    ? mergeLocaleOverrides(translated, overrides)
    : translated;

  setLocaleSnapshot(locale, snapshotKey, JSON.stringify(dictionary));
  return dictionary;
}

/** Translate dynamic content fields (blog, boats, etc.) with per-string cache. */
export async function translateFields<T extends Record<string, string>>(
  fields: T,
  locale: Locale,
  slot: TextBudgetSlot,
): Promise<T> {
  if (locale === "en") return fields;
  const entries = await Promise.all(
    Object.entries(fields).map(async ([key, value]) => [
      key,
      await translateString(value, locale, slot),
    ]),
  );
  return Object.fromEntries(entries) as T;
}

export async function warmAllLocales(): Promise<void> {
  const locales: Locale[] = ["ro", "el", "de", "sr", "bg"];
  for (const locale of locales) {
    await getTranslatedDictionary(locale);
  }
}
