#!/usr/bin/env node
/**
 * Repair de/ro/bg/sr locale strings broken by over-aggressive price-stripping.
 * Uses en.json semantics as reference.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, "../data/locales");
const PHONE = "+30 698 131 8393";

const EXACT = {
  de: {
    "fleet.stat2": "Kontaktieren Sie uns für Preise",
    "package.eyebrow": "Bootsmiete",
    "package.title": "Mietanfrage",
    "package.subtitle":
      "Boot und Dauer wählen — Verfügbarkeit und Preise bestätigen wir telefonisch oder im Büro.",
    "package.loading": "Buchungsformular wird geladen…",
    "yachtUi.specs.perHourShort": "Preise auf Anfrage",
    "boatDetail.startingAt": "Preise",
    "conversion.bookingBadges.transparent": "Sicherheitsbriefing bei jeder Abfahrt",
    "chat.placeholder": "Fragen zu Booten, Stränden, Verfügbarkeit, Buchung…",
    "seoHome.categoryRentalDesc":
      "Preise, Scheine, Wetter & Buchungstipps für stündliche Vermietung in Limenaria.",
  },
  ro: {
    "package.eyebrow": "Închiriere barcă",
    "package.title": "Cerere de închiriere",
    "package.subtitle":
      "Alege barca și durata — confirmăm disponibilitatea și tarifele telefonic sau la birou.",
    "package.loading": "Se încarcă formularul de rezervare…",
    "conversion.bookingBadges.transparent": "Briefing de siguranță la fiecare plecare",
    "chat.placeholder": "Întreabă despre bărci, plaje, disponibilitate, rezervare…",
    "seoHome.categoryRentalDesc":
      "Tarife, permise, vreme & sfaturi rezervare pentru închiriere pe oră în Limenaria.",
    "chat.quickActions.1": "Tarife la cerere",
  },
  bg: {
    "package.eyebrow": "Наем на лодка",
    "package.subtitle":
      "Изберете лодка и продължителност — потвърждаваме наличност и цени по телефона или в офиса.",
    "package.loading": "Зареждане на формуляра за резервация…",
    "yachtUi.specs.perHourShort": "Цени при запитване",
    "boatDetail.startingAt": "Цени",
    "conversion.bookingBadges.transparent": "Инструктаж за безопасност при всяко отплаване",
    "chat.placeholder": "Питай за лодки, плажове, наличност, резервация…",
    "seoHome.categoryRentalDesc":
      "Цени, лицензи, време & съвети за резервация при почасов наем в Лименария.",
    "chat.quickActions.1": "Цени при запитване",
    "concierge.fleet-cta.message":
      "Сравни снимки, характеристики и цени при запитване за всяко плавателно средство.",
  },
  sr: {
    "yachtUi.specs.perHourShort": "Cene na upit",
    "package.subtitle":
      "Izaberite čamac i trajanje — potvrđujemo dostupnost i cene telefonom ili u kancelariji.",
    "package.loading": "Učitavanje formulara za rezervaciju…",
  },
};

const REPAIRS = {
  de: [
    [/Kontaktieren Sie uns für Kontaktieren Sie uns für Preise/g, "Kontaktieren Sie uns für Preise"],
    [/BootsmietKontaktieren Sie uns für Preise/g, "Bootsmiete"],
    [/MietKontaktieren Sie uns für Preise/g, "Buchungsformular"],
    [/Kontaktieren Sie uns für Preise auf Anfrage/g, "Preise auf Anfrage"],
  ],
  ro: [
    [/tarife la cerereuri orare transparente/g, "Briefing de siguranță la fiecare plecare"],
    [/tarife la cerereuri închiriere barcă/g, "Închiriere barcă"],
    [/Se încarcă tarife la cerereurile/g, "Se încarcă formularul de rezervare"],
    [/tarife la cerereuri orare/g, "Tarife la cerere"],
    [/tarife la cerereuri/g, "tarife"],
    [/Bărci, plaje, tarife…/g, "Întreabă despre bărci, plaje, disponibilitate, rezervare…"],
  ],
  bg: [
    [/цени при запитване при запитване/g, "цени при запитване"],
    [/Цени при запитване при запитване/g, "Цени при запитване"],
    [/Прозрачни цени при запитване при запитване/g, "Инструктаж за безопасност при всяко отплаване"],
  ],
  sr: [[/cene na upit na upit/gi, "Cene na upit"]],
};

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null) return false;
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (cur[last] === undefined) return false;
  cur[last] = value;
  return true;
}

function repairString(s, locale) {
  if (typeof s !== "string") return s;
  let out = s;
  for (const [pattern, replacement] of REPAIRS[locale] ?? []) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

function walk(obj, locale) {
  if (Array.isArray(obj)) return obj.map((v) => walk(v, locale));
  if (obj && typeof obj === "object") {
    const next = {};
    for (const [k, v] of Object.entries(obj)) {
      next[k] = walk(v, locale);
    }
    return next;
  }
  return repairString(obj, locale);
}

for (const locale of ["de", "ro", "bg", "sr"]) {
  const path = join(LOCALES_DIR, `${locale}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  let data = walk(raw, locale);
  let applied = 0;
  for (const [p, value] of Object.entries(EXACT[locale] ?? {})) {
    if (setByPath(data, p, value)) applied++;
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Fixed ${locale}.json — ${applied} exact overrides + global repair pass`);
}
