#!/usr/bin/env node
/**
 * Strip user-facing price strings from locale JSON files.
 * Keeps backend structure; replaces copy with contact-for-rates messaging.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");
const PHONE = "+30 698 131 8393";
const LOCALES = ["en", "el", "de", "ro", "bg", "sr"];

const EXACT = {
  en: {
    "nav.package": "Booking",
    "fleet.stat2": "Contact us for rates",
    "home.seasonDock.highlight3": "Early booking — best availability",
    "home.whyChoose.items.earlyBooking.desc":
      "Book ahead for first choice of boat and date.",
    "matchmaker.trustPriceDesc": "Safety briefing on every departure",
    "packageBuilder.title": "Plan your rental",
    "packageBuilder.heroHeadline": "Plan your rental",
    "packageBuilder.heroSubline":
      "Hourly boat rental from Limenaria Marina — pick your boat, set your hours, send a request. No tours, no skipper required up to 30HP.",
    "packageBuilder.storyReview": "Your rental request",
    "packageBuilder.boardingPassLabel": "Rental request",
    "packageBuilder.total": "Contact for rates",
    "packageBuilder.fromTotal": "Contact for rates",
    "packageBuilder.teaserTitle": "Request a rental",
    "packageBuilder.teaserDesc":
      "Pick a boat and hours — we'll confirm availability by phone.",
    "package.eyebrow": "Boat rental",
    "package.title": "Request a rental",
    "package.subtitle":
      "Pick a boat and duration — we'll confirm availability and rates by phone or at the office.",
    "package.loading": "Loading booking form…",
    "package.stepConfigureHint":
      "Pick a boat, set hours and guests — then send your request.",
    "package.stepSummaryHint":
      "Review your details, then send a booking request.",
    "package.total": "Contact for rates",
    "package.fromTotal": "Contact for rates",
    "package.mobileSummary": "Your request",
    "yachtUi.specs.perHourShort": "Contact for rates",
    "boatDetail.startingAt": "Rates",
    "boatDetail.contactForRates": `Contact us for rates — call ${PHONE} or visit our office at Limenaria Marina.`,
    "conversion.bookingBadges.transparent": "Safety briefing on every departure",
    "conversion.package.fromPrice": "Contact for rates",
    "conversion.package.includedTitle": "What's included",
    "conversion.boatDetail.includedTitle": "What's included",
    "faq.page.ctaPrices": "Contact for rates",
    "seo.description":
      "Rent a boat in Thassos at Limenaria Marina. Speedboats & day cruisers for Marble Beach & secret coves. No licence up to 30HP, safety briefing included. Request a booking today.",
    "seo.ogDescription":
      "Rent a boat in Thassos from Limenaria Marina. Speedboats & day cruisers, no licence up to 30HP, safety briefing, Marble Beach & secret cove routes.",
    "seo.boat.title": "Rent a Boat Thassos, {name}",
    "seo.boat.description":
      "Rent a boat in Thassos: {name} at Limenaria Marina. Up to {pax} passengers. {desc} Safety briefing included. Contact us for rates.",
  },
  el: {
    "fleet.stat2": "Επικοινωνήστε για τιμές",
    "yachtUi.specs.perHourShort": "Επικοινωνήστε για τιμές",
    "boatDetail.startingAt": "Τιμές",
    "boatDetail.contactForRates": `Επικοινωνήστε για τιμές — καλέστε ${PHONE} ή επισκεφθείτε το γραφείο μας στη Μαρίνα Λιμενάρια.`,
    "seo.boat.title": "Ενοικίαση Σκάφους Θάσος, {name}",
    "seo.boat.description":
      "Ενοικίαση σκάφους στη Θάσο: {name} στη Μαρίνα Λιμενάρια. {hp}HP, {pax} άτομα. {desc} Οδηγίες ασφαλείας. Επικοινωνήστε για τιμές.",
  },
  de: {
    "fleet.stat2": "Kontaktieren Sie uns für Preise",
    "yachtUi.specs.perHourShort": "Preise auf Anfrage",
    "boatDetail.startingAt": "Preise",
    "boatDetail.contactForRates": `Preise auf Anfrage — rufen Sie ${PHONE} an oder besuchen Sie unser Büro in Limenaria.`,
  },
  ro: {
    "fleet.stat2": "Contactați-ne pentru tarife",
    "yachtUi.specs.perHourShort": "Tarife la cerere",
    "boatDetail.startingAt": "Tarife",
    "boatDetail.contactForRates": `Tarife la cerere — sunați ${PHONE} sau vizitați biroul nostru din Limenaria.`,
  },
  bg: {
    "fleet.stat2": "Свържете се за цени",
    "yachtUi.specs.perHourShort": "Цени при запитване",
    "boatDetail.startingAt": "Цени",
    "boatDetail.contactForRates": `Цени при запитване — обадете се на ${PHONE} или посетете офиса ни в Лименария.`,
  },
  sr: {
    "fleet.stat2": "Kontaktirajte nas za cene",
    "yachtUi.specs.perHourShort": "Cene na upit",
    "boatDetail.startingAt": "Cene",
    "boatDetail.contactForRates": `Cene na upit — pozovite ${PHONE} ili posetite našu kancelariju u Limenariji.`,
  },
};

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) return;
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (cur[last] !== undefined) cur[last] = value;
}

function cleanString(s) {
  if (typeof s !== "string") return s;
  let out = s
    // Remove euro amounts and ranges
    .replace(/€\s?\d+[\d.,]*(?:\s*[–-]\s*€?\s?\d+[\d.,]*)?/gi, "")
    .replace(/\bfrom\s+€/gi, "contact us for rates —")
    .replace(/\bstarting at\s+€/gi, "contact us for rates —")
    .replace(/\b(ab|de la|от|od|από)\s+€/gi, "$1 ")
    .replace(/\{currency\}\{price\}\/?(hr|hour|h|ώρα|oră|час|Std)/gi, "contact for rates")
    .replace(/\{price\}€?\/?(hr|hour|h|ώρα|oră|час|Std)/gi, "contact for rates")
    .replace(/From\s+\{price\}/gi, "Contact for rates")
    .replace(/From\s+€\{price\}/gi, "Contact for rates")
    .replace(/\{currency\}\{price\}/g, "")
    .replace(/\{price\}/g, "")
    .replace(/\s*\/\s*(hr|hour|h|ώρα|oră|час|Std)\b/gi, "")
    .replace(/\b(hourly rates?|hourly pricing|live prices?|price estimate|rental prices?|boat rental prices?|pricing & availability|transparent hourly pricing|best prices)\b/gi, (m) => {
      const map = {
        "hourly rates": "rates on request",
        "hourly rate": "rates on request",
        "hourly pricing": "rates on request",
        "live prices": "contact for rates",
        "live price": "contact for rates",
        "price estimate": "booking request",
        "rental prices": "booking request",
        "rental price": "booking request",
        "boat rental prices": "boat rental",
        "pricing & availability": "Availability & rates",
        "transparent hourly pricing": "safety briefing on every departure",
        "best prices": "best availability",
      };
      return map[m.toLowerCase()] ?? "contact for rates";
    })
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\s+—\s+—/g, " —")
    .trim();
  return out;
}

function walk(obj) {
  if (Array.isArray(obj)) return obj.map(walk);
  if (obj && typeof obj === "object") {
    const next = {};
    for (const [k, v] of Object.entries(obj)) {
      next[k] = walk(v);
    }
    return next;
  }
  return cleanString(obj);
}

for (const locale of LOCALES) {
  const path = join(LOCALES_DIR, `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));
  const overrides = EXACT[locale] ?? {};
  for (const [p, v] of Object.entries(overrides)) {
    setByPath(data, p, v);
  }
  const cleaned = walk(data);
  writeFileSync(path, `${JSON.stringify(cleaned, null, 2)}\n`);
  console.log(`Updated ${locale}.json`);
}
