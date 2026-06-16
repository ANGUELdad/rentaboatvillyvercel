/**
 * Pre-warm translation cache for all locales from en.json.
 * Run: npx tsx scripts/sync-locales.ts
 */
import { warmAllLocales, getSourceHash } from "../src/lib/i18n/server";

async function main() {
  console.log("Source hash:", getSourceHash());
  console.log("Warming translation cache for ro, el, de, sr, bg…");
  await warmAllLocales();
  console.log("Done — translations cached in SQLite.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
