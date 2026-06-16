import { getDb } from "@/lib/db";
import { cacheKey } from "./hash";

export interface CachedTranslation {
  translatedText: string;
}

function ensureTable() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS translation_cache (
      cache_key TEXT PRIMARY KEY,
      locale TEXT NOT NULL,
      slot TEXT NOT NULL,
      source_text TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_translation_locale ON translation_cache(locale);

    CREATE TABLE IF NOT EXISTS locale_snapshots (
      locale TEXT NOT NULL,
      source_hash TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (locale, source_hash)
    );
  `);
}

export function getCachedTranslation(
  sourceText: string,
  locale: string,
  slot: string,
): string | null {
  ensureTable();
  const key = cacheKey(sourceText, locale, slot);
  const row = getDb()
    .prepare("SELECT translated_text FROM translation_cache WHERE cache_key = ?")
    .get(key) as { translated_text: string } | undefined;
  return row?.translated_text ?? null;
}

export function setCachedTranslation(
  sourceText: string,
  locale: string,
  slot: string,
  translatedText: string,
): void {
  ensureTable();
  const key = cacheKey(sourceText, locale, slot);
  getDb()
    .prepare(
      `INSERT INTO translation_cache (cache_key, locale, slot, source_text, translated_text, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(cache_key) DO UPDATE SET
         translated_text = excluded.translated_text,
         created_at = excluded.created_at`,
    )
    .run(key, locale, slot, sourceText, translatedText, new Date().toISOString());
}

export function getLocaleSnapshot(
  locale: string,
  sourceHash: string,
): string | null {
  ensureTable();
  const row = getDb()
    .prepare(
      "SELECT payload FROM locale_snapshots WHERE locale = ? AND source_hash = ?",
    )
    .get(locale, sourceHash) as { payload: string } | undefined;
  return row?.payload ?? null;
}

export function setLocaleSnapshot(
  locale: string,
  sourceHash: string,
  payload: string,
): void {
  ensureTable();
  getDb()
    .prepare(
      `INSERT INTO locale_snapshots (locale, source_hash, payload, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(locale, source_hash) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
    )
    .run(locale, sourceHash, payload, new Date().toISOString());
}

/** Drop snapshot rows for a locale when en.json changes (optional cleanup). */
export function invalidateLocaleSnapshots(sourceHash: string): void {
  ensureTable();
  getDb()
    .prepare("DELETE FROM locale_snapshots WHERE source_hash != ?")
    .run(sourceHash);
}
