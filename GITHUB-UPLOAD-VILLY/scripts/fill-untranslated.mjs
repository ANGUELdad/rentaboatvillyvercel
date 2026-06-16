#!/usr/bin/env node
/** Fill locale JSON keys that still match English, using MyMemory with backoff. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");
const LANGPAIR = { de: "en|de", ro: "en|ro", bg: "en|bg", sr: "en|sr", el: "en|el" };
const DELAY_MS = 2800;

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

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

const KEEP_EN = /^(Blog|FAQ|GDPR|HP|Email|Marketing|Analytics|Cookies|John Smith|you@email|Rent A Boat Villy|Villy Boats Thassos|Villy|Limenaria Marina|Limenaria|Thassos|Google|Kima|Nikos|Niki|Metalia|Tripiti|Pefkari|Potos|Aliki|Marble Beach|Golden Beach|Chrisi Akti|Saliara|Vathi Bay|Metalia Beach|Tripiti Cave|Pefkari Beach|Potos Harbor|Aliki Ancient Quarry|Dashboard|Concierge|\+30)/;

function shouldTranslate(text) {
  if (!text || typeof text !== "string" || text.length < 5) return false;
  if (KEEP_EN.test(text.trim())) return false;
  if (/^https?:|^\/[\w/-]+$|^[\d\s,.:+\-{}%|@]+$/.test(text)) return false;
  return true;
}

const BRAND = {
  de: [[/charter/gi, "Bootsvermietung"], [/yacht/gi, "Boot"], [/Fuel included/gi, "Kraftstoff nicht inklusive"], [/fuel included/gi, "Kraftstoff nicht inklusive"]],
  ro: [[/charter/gi, "închiriere"], [/yacht/gi, "barcă"], [/Fuel included/gi, "Combustibilul nu este inclus"]],
  bg: [[/charter/gi, "наем"], [/yacht/gi, "лодка"], [/Fuel included/gi, "Горивото не е включено"]],
  sr: [[/charter/gi, "iznajmljivanje"], [/yacht/gi, "čamac"], [/Fuel included/gi, "Gorivo nije uključeno"]],
  el: [[/charter/gi, "ενοικίαση"], [/yacht/gi, "σκάφος"], [/Fuel included/gi, "Τα καύσιμα δεν συμπεριλαμβάνονται"]],
};

function brandFix(text, lang) {
  let t = text.replace(/€\d+[^\s]*/gi, "").replace(/\s{2,}/g, " ").trim();
  for (const [re, rep] of BRAND[lang] ?? []) t = t.replace(re, rep);
  return t;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translate(text, lang, attempt = 0) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 480));
  url.searchParams.set("langpair", LANGPAIR[lang]);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15000) });
  if (res.status === 429 && attempt < 6) {
    await sleep(10000 * (attempt + 1));
    return translate(text, lang, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  let out = data?.responseData?.translatedText?.trim() ?? text;
  if (out.toUpperCase() === text.toUpperCase()) return text;
  for (const ph of text.match(/\{[^}]+\}/g) ?? []) {
    if (!out.includes(ph)) out = out.replace(/\{[^}]+\}/, ph);
  }
  return brandFix(out, lang);
}

async function main() {
  const lang = process.argv[2];
  if (!lang || !LANGPAIR[lang]) {
    console.error("Usage: node fill-untranslated.mjs <de|ro|bg|sr|el>");
    process.exit(1);
  }

  const enPath = join(LOCALES_DIR, "en.json");
  const locPath = join(LOCALES_DIR, `${lang}.json`);
  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const loc = JSON.parse(readFileSync(locPath, "utf8"));
  const enFlat = flatten(en);
  const locFlat = flatten(loc);

  const keys = Object.keys(enFlat).filter((k) => {
    if (!(k in locFlat)) return shouldTranslate(enFlat[k]);
    return shouldTranslate(enFlat[k]) && enFlat[k] === locFlat[k];
  });

  console.log(`${lang}: translating ${keys.length} keys…`);
  let done = 0;
  for (const k of keys) {
    const src = enFlat[k];
    process.stdout.write(`[${++done}/${keys.length}] ${k.slice(0, 55)}… `);
    try {
      const tr = await translate(src, lang);
      setByPath(loc, k, tr === src ? brandFix(src, lang) : tr);
      console.log(tr === src ? "kept" : "ok");
    } catch (e) {
      console.log(`fail (${e.message})`);
    }
    await sleep(DELAY_MS);
  }

  writeFileSync(locPath, JSON.stringify(loc, null, 2) + "\n");
  console.log(`Wrote ${locPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
