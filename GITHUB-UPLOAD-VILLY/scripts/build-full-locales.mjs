#!/usr/bin/env node
/**
 * Build complete locale files from en.json + existing translations + curated overrides.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { EL_OVERRIDES } from "./locale-el-overrides.mjs";
import { DE_OVERRIDES } from "./locale-translations/de.mjs";
import { BG_OVERRIDES } from "./locale-translations/bg.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");

const OVERRIDES_BY_LANG = {
  el: EL_OVERRIDES,
  de: DE_OVERRIDES,
  bg: BG_OVERRIDES,
};

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const arrMatch = p.match(/^(.+)\[(\d+)\]$/);
    if (arrMatch) {
      const [, key, idx] = arrMatch;
      if (!cur[key]) cur[key] = [];
      if (!cur[key][Number(idx)]) cur[key][Number(idx)] = {};
      cur = cur[key][Number(idx)];
    } else {
      if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
      cur = cur[p];
    }
  }
  const last = parts[parts.length - 1];
  const arrMatch = last.match(/^(.+)\[(\d+)\]$/);
  if (arrMatch) {
    const [, key, idx] = arrMatch;
    if (!cur[key]) cur[key] = [];
    cur[key][Number(idx)] = value;
  } else {
    cur[last] = value;
  }
}

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

function deepMerge(base, overlay) {
  if (Array.isArray(base)) {
    if (!Array.isArray(overlay)) return base;
    return base.map((item, i) =>
      typeof item === "object" && item !== null && !Array.isArray(item)
        ? deepMerge(item, overlay[i] ?? {})
        : overlay[i] ?? item,
    );
  }
  if (typeof base === "object" && base !== null) {
    const result = { ...base };
    for (const [k, v] of Object.entries(overlay ?? {})) {
      if (v === undefined) continue;
      if (
        typeof v === "object" &&
        v !== null &&
        !Array.isArray(v) &&
        typeof result[k] === "object" &&
        result[k] !== null &&
        !Array.isArray(result[k])
      ) {
        result[k] = deepMerge(result[k], v);
      } else {
        result[k] = v;
      }
    }
    return result;
  }
  return overlay ?? base;
}

function applyFlatOverrides(tree, flatOverrides, enFlat) {
  const result = JSON.parse(JSON.stringify(tree));
  for (const [path, value] of Object.entries(flatOverrides)) {
    // Skip overrides that are still identical to English (bad placeholder translations)
    if (enFlat && enFlat[path] === value && typeof value === "string" && value.length > 4) {
      continue;
    }
    setByPath(result, path, value);
  }
  return result;
}

function countKeys(obj) {
  return Object.keys(flatten(obj)).length;
}

async function loadOptional(path) {
  try {
    const mod = await import(path);
    return mod.RO_OVERRIDES ?? mod.SR_OVERRIDES ?? {};
  } catch {
    return {};
  }
}

async function main() {
  const en = JSON.parse(readFileSync(join(LOCALES_DIR, "en.json"), "utf8"));
  const enFlat = flatten(en);
  const enKeyCount = Object.keys(enFlat).length;

  const roOverrides = await loadOptional("./locale-translations/ro.mjs");
  const srOverrides = await loadOptional("./locale-translations/sr.mjs");
  OVERRIDES_BY_LANG.ro = roOverrides;
  OVERRIDES_BY_LANG.sr = srOverrides;

  for (const lang of ["el", "de", "ro", "bg", "sr"]) {
    const existingPath = join(LOCALES_DIR, `${lang}.json`);
    let existing = {};
    try {
      existing = JSON.parse(readFileSync(existingPath, "utf8"));
    } catch (err) {
      console.warn(`${lang}.json parse error — rebuilding from en + overrides: ${err.message}`);
    }

    const overrides = OVERRIDES_BY_LANG[lang] ?? {};
    // Structure from en, preserve existing curated translations, apply overrides last
    let merged = deepMerge(en, existing);
    merged = applyFlatOverrides(merged, overrides, enFlat);

    const outFlat = flatten(merged);
    const missing = Object.keys(enFlat).filter((k) => !(k in outFlat));
    const extra = Object.keys(outFlat).filter((k) => !(k in enFlat));

    writeFileSync(existingPath, JSON.stringify(merged, null, 2) + "\n");
    console.log(
      `${lang}: ${countKeys(merged)} keys (en=${enKeyCount}, missing=${missing.length}, extra=${extra.length}, overrides=${Object.keys(overrides).length})`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
