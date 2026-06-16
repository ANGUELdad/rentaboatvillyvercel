#!/usr/bin/env node
/**
 * Second pass: remove remaining price wording from all locale files.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), "../data/locales");
const PHONE = "+30 698 131 8393";
const LOCALES = ["en", "el", "de", "ro", "bg", "sr"];

const REPLACEMENTS = [
  [/rates on request start from depending on boat and season/gi, `Rates depend on boat and season. Call ${PHONE} or visit our office.`],
  [/per-boat rates/gi, "fleet details"],
  [/current price/gi, "guest capacity"],
  [/den aktuellen Preis/gi, "die Gästekapazität"],
  [/текущата цена/gi, "капацитета"],
  [/текущую цену/gi, "вместимость"],
  [/prețul actual/gi, "capacitatea"],
  [/trenutnu cenu/gi, "kapacitet"],
  [/Live-Preisschätzung/gi, "Mietanfrage"],
  [/Live price estimate/gi, "Booking request"],
  [/Procena cene uživo/gi, "Zahtev za rezervaciju"],
  [/Оценка на цената на живо/gi, "Заявка за резервация"],
  [/Estimare preț live/gi, "Cerere de rezervare"],
  [/sofortige Preisschätzung/gi, "Buchungsanfrage"],
  [/мигновена оценка на цената/gi, "заявка за резервация"],
  [/trenutna procena cene/gi, "zahtev za rezervaciju"],
  [/Зареждане на цени/gi, "Зареждане…"],
  [/Učitavanje cena/gi, "Učitavanje…"],
  [/Loading rental prices/gi, "Loading booking form"],
  [/Почасови цени/gi, "Цени при запитване"],
  [/Почасови тарифи/gi, "Тарифи при запитване"],
  [/Hourly prices/gi, "Contact for rates"],
  [/Preise/gi, "Preise auf Anfrage"],
  [/цени/gi, "цени при запитване"],
  [/cene/gi, "cene na upit"],
  [/preț/gi, "tarife la cerere"],
  [/τιμ/gi, "τιμές κατόπιν συνεννόησης"],
  [/Stundensätze ab je nach/gi, "Preise auf Anfrage — je nach"],
  [/Tarife orare de la/gi, "Tarife la cerere —"],
  [/Satnice od/gi, "Cene na upit —"],
  [/Почасови тарифи от/gi, "Цени при запитване —"],
  [/transparent hourly pricing/gi, "safety briefing on every departure"],
  [/Прозрачни почасови цени/gi, "Инструктаж за безопасност при всяко отплаване"],
  [/boat rental price/gi, "boat rental"],
  [/rental price/gi, "rental"],
  [/price estimate/gi, "booking request"],
  [/price calculator/gi, "booking form"],
  [/kalkulator cena/gi, "forma za rezervaciju"],
  [/\/ч\b/g, ""],
  [/ \/Std\b/g, ""],
  [/ \/oră\b/g, ""],
  [/ \/h\b/g, ""],
];

function walk(obj) {
  if (Array.isArray(obj)) return obj.map(walk);
  if (obj && typeof obj === "object") {
    const next = {};
    for (const [k, v] of Object.entries(obj)) next[k] = walk(v);
    return next;
  }
  if (typeof obj !== "string") return obj;
  let out = obj;
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  return out.replace(/\s{2,}/g, " ").trim();
}

for (const locale of LOCALES) {
  const path = join(LOCALES_DIR, `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  writeFileSync(path, `${JSON.stringify(walk(data), null, 2)}\n`);
  console.log(`Pass 2: ${locale}.json`);
}
