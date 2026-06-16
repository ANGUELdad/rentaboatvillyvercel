#!/usr/bin/env node
/**
 * Complete all locale JSON files from en.json source of truth.
 * Preserves existing curated translations; fills gaps via MyMemory API.
 * Applies brand rules: boat rental only, no prices, fuel not included, etc.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");
const PHONE = "+30 698 131 8393";
const LANGS = ["el", "de", "ro", "bg", "sr"];
const LANGPAIR = { el: "en|el", de: "en|de", ro: "en|ro", bg: "en|bg", sr: "en|sr" };

const KEEP_ENGLISH = new Set([
  "Blog", "FAQ", "GDPR", "HP", "Villy", "Rent A Boat Villy", "Villy Boats Thassos",
  "Google", "Email", "Blog", "Marketing", "Analytics", "Cookies", "Cookie Policy",
  "John Smith", "you@email.com", "+30 690 000 0000", "+30 698 131 8393",
  "Limenaria", "Thassos", "Kima", "Nikos", "Niki", "Metalia", "Tripiti", "Pefkari",
  "Potos", "Aliki", "Marble Beach", "Golden Beach", "Chrisi Akti", "Saliara",
  "Metalia Beach", "Tripiti Cave", "Pefkari Beach", "Potos Harbor",
  "Aliki Ancient Quarry", "Vathi Bay", "Limenaria Marina",
]);

function shouldSkipTranslation(text) {
  if (!text || typeof text !== "string") return true;
  if (KEEP_ENGLISH.has(text)) return true;
  if (/^[\d\s,.:+\-/{}%|@]+$/.test(text)) return true;
  if (/^https?:\/\//.test(text)) return true;
  if (/^\/[\w/-]+$/.test(text)) return true;
  if (text.length <= 3) return true;
  return false;
}

function applyBrandRules(text, lang) {
  if (!text || typeof text !== "string") return text;
  let t = text;
  // Remove price patterns
  t = t.replace(/€\d+([./]\d+)?(\/hour|\/hr|\/Std|\/oră|\/час)?/gi, "");
  t = t.replace(/\$\d+([./]\d+)?/g, "");
  t = t.replace(/from €\d+/gi, "");
  t = t.replace(/ab €\d+/gi, "");
  t = t.replace(/de la €\d+/gi, "");
  t = t.replace(/от €\d+/gi, "");
  t = t.replace(/od €\d+/gi, "");
  // Brand term replacements per language
  const rules = BRAND_RULES[lang] ?? [];
  for (const [pattern, replacement] of rules) {
    t = t.replace(pattern, replacement);
  }
  // Collapse whitespace
  t = t.replace(/\s{2,}/g, " ").trim();
  return t;
}

const BRAND_RULES = {
  el: [
    [/charter/gi, "ενοικίαση"],
    [/yacht/gi, "σκάφος"],
    [/matchmaker/gi, "βοηθός επιλογής"],
    [/fuel included|combustibil inclus|Kraftstoff inklusive|gorivo uključeno|гориво включено/gi, "τα καύσιμα δεν συμπεριλαμβάνονται"],
    [/Fuel included/gi, "Τα καύσιμα δεν συμπεριλαμβάνονται"],
  ],
  de: [
    [/charter/gi, "Bootsvermietung"],
    [/yacht/gi, "Boot"],
    [/matchmaker/gi, "Bootsfinder"],
    [/Fuel included|Kraftstoff inklusive/gi, "Kraftstoff nicht inklusive"],
    [/fuel included/gi, "Kraftstoff nicht inklusive"],
    [/Ab \/Stunde/g, "Früh buchen — beste Verfügbarkeit"],
    [/Preise auf Anfrage/gi, "Kontaktieren Sie uns für Preise"],
  ],
  ro: [
    [/charter/gi, "închiriere"],
    [/yacht/gi, "barcă"],
    [/matchmaker/gi, "asistent barcă"],
    [/combustibil inclus|Fuel included/gi, "Combustibilul nu este inclus"],
  ],
  bg: [
    [/charter/gi, "наем"],
    [/yacht/gi, "лодка"],
    [/matchmaker/gi, "асistent за лодка"],
    [/гориво включено|Fuel included/gi, "Горивото не е включено"],
  ],
  sr: [
    [/charter/gi, "iznajmljivanje"],
    [/yacht/gi, "čamac"],
    [/matchmaker/gi, "asistent za izbor"],
    [/gorivo uključeno|Fuel included/gi, "Gorivo nije uključeno"],
  ],
};

const cache = new Map();
let apiCalls = 0;
const DELAY_MS = 350;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateText(text, lang) {
  if (shouldSkipTranslation(text)) return text;
  const key = `${lang}:${text}`;
  if (cache.has(key)) return cache.get(key);

  const langpair = LANGPAIR[lang];
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 450));
  url.searchParams.set("langpair", langpair);

  try {
    apiCalls++;
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let translated = data?.responseData?.translatedText?.trim() ?? text;
    if (translated.toUpperCase() === text.toUpperCase()) translated = text;
    translated = applyBrandRules(translated, lang);
    // Preserve placeholders
    for (const ph of text.match(/\{[^}]+\}/g) ?? []) {
      if (!translated.includes(ph)) {
        translated = translated.replace(/\{[^}]+\}/, ph);
      }
    }
    cache.set(key, translated);
    await sleep(DELAY_MS);
    return translated;
  } catch (err) {
    console.warn(`  ⚠ translate failed (${lang}): ${text.slice(0, 60)}… — ${err.message}`);
    cache.set(key, text);
    return text;
  }
}

async function fillTree(enNode, localeNode, lang, path = "") {
  if (typeof enNode === "string") {
    const existing = typeof localeNode === "string" ? localeNode : undefined;
    if (existing && existing !== enNode && existing.trim()) {
      return applyBrandRules(existing, lang);
    }
    if (existing === enNode && !shouldSkipTranslation(enNode)) {
      return applyBrandRules(await translateText(enNode, lang), lang);
    }
    if (!existing || !existing.trim()) {
      if (shouldSkipTranslation(enNode)) return enNode;
      return applyBrandRules(await translateText(enNode, lang), lang);
    }
    return applyBrandRules(existing, lang);
  }

  if (Array.isArray(enNode)) {
    const locArr = Array.isArray(localeNode) ? localeNode : [];
    const result = [];
    for (let i = 0; i < enNode.length; i++) {
      result.push(await fillTree(enNode[i], locArr[i], lang, `${path}[${i}]`));
    }
    return result;
  }

  if (enNode && typeof enNode === "object") {
    const locObj = localeNode && typeof localeNode === "object" && !Array.isArray(localeNode) ? localeNode : {};
    const result = {};
    for (const [key, value] of Object.entries(enNode)) {
      const childPath = path ? `${path}.${key}` : key;
      result[key] = await fillTree(value, locObj[key], lang, childPath);
    }
    return result;
  }

  return enNode;
}

function countKeys(obj) {
  let n = 0;
  const walk = (v) => {
    if (typeof v === "string") { n++; return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(obj);
  return n;
}

async function main() {
  const en = JSON.parse(readFileSync(join(LOCALES_DIR, "en.json"), "utf8"));
  const enKeyCount = countKeys(en);
  console.log(`Source en.json: ${enKeyCount} string keys\n`);

  for (const lang of LANGS) {
    console.log(`\n━━━ ${lang.toUpperCase()} ━━━`);
    const existingPath = join(LOCALES_DIR, `${lang}.json`);
    let existing = {};
    try {
      existing = JSON.parse(readFileSync(existingPath, "utf8"));
    } catch { /* fresh */ }

    const before = countKeys(existing);
    console.log(`Existing keys: ${before}`);

    const filled = await fillTree(en, existing, lang);
    const after = countKeys(filled);
    console.log(`Filled keys: ${after} (API calls so far: ${apiCalls})`);

    writeFileSync(existingPath, JSON.stringify(filled, null, 2) + "\n");
    console.log(`✓ Wrote ${lang}.json`);
  }

  console.log(`\nDone. Total API calls: ${apiCalls}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
