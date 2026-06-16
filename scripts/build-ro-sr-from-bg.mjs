#!/usr/bin/env node
/** Build RO/SR overrides using BG translations as intermediate where available. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BG_OVERRIDES } from "./locale-translations/bg.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");
const TARGET = process.argv[2];
if (!["ro", "sr"].includes(TARGET)) {
  console.error("Usage: node build-ro-sr-from-bg.mjs ro|sr");
  process.exit(1);
}

const LANGPAIR = { ro: "bg|ro", sr: "bg|sr" };
const DELAY = 2000;

function flatten(obj, p = "") {
  const r = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(r, flatten(v, key));
    else r[key] = v;
  }
  return r;
}

const KEEP = /^(Blog|FAQ|GDPR|HP|Email|Marketing|Analytics|Cookies|John Smith|you@email|Rent A Boat Villy|Villy|Limenaria Marina|Limenaria|Thassos|Google|Kima|Nikos|Metalia|Tripiti|Marble Beach|Golden Beach|\+30)/;

function needTranslate(text) {
  return typeof text === "string" && text.length > 5 && !KEEP.test(text) && !/^https?:|^\/|^[\d\s,.:+\-{}%|@]+$/.test(text);
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translate(text, pair, attempt = 0) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 480));
  url.searchParams.set("langpair", pair);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
  if (res.status === 429 && attempt < 4) {
    await sleep(6000 * (attempt + 1));
    return translate(text, pair, attempt + 1);
  }
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  return data?.responseData?.translatedText?.trim() ?? text;
}

async function main() {
  const en = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, "en.json"), "utf8")));
  const loc = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, `${TARGET}.json`), "utf8")));
  const keys = Object.keys(en).filter((k) => needTranslate(en[k]) && en[k] === loc[k]);
  console.log(`${TARGET}: ${keys.length} keys`);

  const overrides = {};
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const src = BG_OVERRIDES[k] && BG_OVERRIDES[k] !== en[k] ? BG_OVERRIDES[k] : en[k];
    const pair = BG_OVERRIDES[k] && BG_OVERRIDES[k] !== en[k] ? LANGPAIR[TARGET] : `en|${TARGET}`;
    process.stdout.write(`[${i + 1}/${keys.length}] ${k.slice(0, 48)} (${pair})… `);
    try {
      let out = await translate(src, pair);
      if (out.toUpperCase() === en[k].toUpperCase() && pair.startsWith("en")) {
        out = await translate(en[k], `en|${TARGET}`);
      }
      for (const ph of en[k].match(/\{[^}]+\}/g) ?? []) {
        if (!out.includes(ph)) out = out.replace(/\{[^}]+\}/, ph);
      }
      overrides[k] = out.replace(/charter/gi, TARGET === "ro" ? "închiriere" : "iznajmljivanje").replace(/yacht/gi, TARGET === "ro" ? "barcă" : "čamac");
      console.log("ok");
    } catch (e) {
      overrides[k] = src;
      console.log("fail", e.message);
    }
    await sleep(DELAY);
  }

  const constName = `${TARGET.toUpperCase()}_OVERRIDES`;
  const body = Object.entries(overrides).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
  writeFileSync(join(__dirname, `locale-translations/${TARGET}.mjs`), `export const ${constName} = {\n${body}\n};\n`);
  console.log(`Wrote ${TARGET}.mjs (${Object.keys(overrides).length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
