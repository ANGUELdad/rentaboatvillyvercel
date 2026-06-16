#!/usr/bin/env node
/** Generate RO/SR override files for keys still identical to English. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");
const LANGPAIR = { ro: "en|ro", sr: "en|sr" };
const DELAY_MS = 2500;

function flatten(obj, prefix = "") {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = v;
    }
  }
  return result;
}

const SKIP = /^(Blog|FAQ|GDPR|HP|Email|Marketing|Analytics|Cookies|John Smith|you@email|Rent A Boat|Villy Boats|Villy|Limenaria|Thassos|Google|Kima|Nikos|Niki|Metalia|Tripiti|Pefkari|Potos|Aliki|Marble Beach|Golden Beach|Chrisi Akti|Saliara|Vathi Bay|Dashboard|\+30)/i;

function shouldTranslate(text) {
  if (!text || typeof text !== "string" || text.length < 6) return false;
  if (SKIP.test(text)) return false;
  if (/^https?:|^\/|^[\d\s,.:+\-{}%|@]+$/.test(text)) return false;
  return true;
}

function applyBrand(text, lang) {
  let t = text;
  t = t.replace(/charter/gi, lang === "ro" ? "închiriere" : "iznajmljivanje");
  t = t.replace(/yacht/gi, lang === "ro" ? "barcă" : "čamac");
  t = t.replace(/Fuel included/gi, lang === "ro" ? "Combustibilul nu este inclus" : "Gorivo nije uključeno");
  t = t.replace(/fuel included/gi, lang === "ro" ? "combustibilul nu este inclus" : "gorivo nije uključeno");
  return t.replace(/\s{2,}/g, " ").trim();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translate(text, lang, attempt = 0) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 450));
  url.searchParams.set("langpair", LANGPAIR[lang]);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  if (res.status === 429 && attempt < 5) {
    await sleep(8000 * (attempt + 1));
    return translate(text, lang, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  let out = data?.responseData?.translatedText?.trim() ?? text;
  if (out.toUpperCase() === text.toUpperCase()) return text;
  return applyBrand(out, lang);
}

async function buildOverrides(lang) {
  const en = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, "en.json"), "utf8")));
  const loc = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, `${lang}.json`), "utf8")));
  const keys = Object.keys(en).filter((k) => {
    if (!(k in loc)) return shouldTranslate(en[k]);
    return shouldTranslate(en[k]) && en[k] === loc[k];
  });
  console.log(`${lang}: ${keys.length} keys to translate`);
  const overrides = {};
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const src = en[k];
    process.stdout.write(`  [${i + 1}/${keys.length}] ${k.slice(0, 50)}… `);
    try {
      overrides[k] = await translate(src, lang);
      console.log("ok");
    } catch (e) {
      overrides[k] = src;
      console.log(`fail (${e.message})`);
    }
    await sleep(DELAY_MS);
  }
  const outPath = join(__dirname, `locale-translations/${lang}.mjs`);
  const body = Object.entries(overrides)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join("\n");
  writeFileSync(
    outPath,
    `export const ${lang.toUpperCase()}_OVERRIDES = {\n${body}\n};\n`,
  );
  console.log(`Wrote ${outPath} (${Object.keys(overrides).length} entries)`);
}

const lang = process.argv[2];
if (!lang || !["ro", "sr"].includes(lang)) {
  console.error("Usage: node generate-ro-sr-overrides.mjs ro|sr");
  process.exit(1);
}
buildOverrides(lang).catch((e) => {
  console.error(e);
  process.exit(1);
});
