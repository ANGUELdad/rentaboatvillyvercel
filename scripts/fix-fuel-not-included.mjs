#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const LOCALE_REPLACERS = {
  en: [
    [/fuel included on every departure/gi, "safety briefing on every departure"],
    [/fuel & safety gear included/gi, "safety gear included"],
    [/Fuel & safety gear included/gi, "Safety gear included"],
    [/fuel & safety briefing included/gi, "safety briefing included"],
    [/Fuel & safety briefing included/gi, "Safety briefing included"],
    [/fuel and safety briefing included/gi, "safety briefing included"],
    [/Fuel and safety briefing included/gi, "Safety briefing included"],
    [/fuel and safety gear included/gi, "safety gear included"],
    [/Fuel and safety gear included/gi, "Safety gear included"],
    [/fuel and safety gear/gi, "safety gear"],
    [/Fuel and safety gear/gi, "Safety gear"],
    [/fuel included on standard Thassos cruising/gi, "safety briefing included"],
    [/fuel included from Limenaria/gi, "safety briefing from Limenaria"],
    [/fuel included, Marble Beach/gi, "safety briefing, Marble Beach"],
    [/fuel included, no licence/gi, "safety briefing, no licence"],
    [/fuel included\. Book/gi, "safety briefing included. Book"],
    [/fuel included\. Stay/gi, "safety briefing included. Stay"],
    [/fuel included\. Request/gi, "safety briefing included. Request"],
    [/fuel included\. Self-drive/gi, "safety briefing included. Self-drive"],
    [/fuel included\. Κλείστε/gi, "safety briefing included. Κλείστε"],
    [/fuel included/gi, "safety briefing included"],
    [/Fuel included/gi, "Safety briefing included"],
    [/Transparent pricing, fuel included/gi, "Transparent hourly pricing"],
    [/Fuel for Thassos routes/gi, "Safety gear for Thassos routes"],
    [/Fuel for standard cruising around Thassos/gi, "Safety gear for standard cruising around Thassos"],
    [/Fuel for Thassos cruising/gi, "Safety gear for Thassos cruising"],
    [/Is fuel included in the boat rental price\?/g, "Is fuel included in the boat rental price?"],
    [/Yes\. All hourly rates include fuel for standard cruising around Thassos\. Extended offshore trips may incur a small surcharge, always confirmed before departure\./g,
      "No. Fuel is charged separately based on usage. We explain typical consumption at briefing so there are no surprises at return."],
    [/Fuel included\?/g, "Is fuel included?"],
    [/trustFuel": "Fuel included"/g, 'trustFuel": "Safety briefing"'],
    [/"title": "Fuel included"/g, '"title": "Safety briefing"'],
    [/"desc": "No surprise fuel charges, included in your hourly rental"/g,
      '"desc": "Fuel is charged separately — we explain typical usage at briefing"'],
    [/fuel included boat hire Thassos/gi, "boat hire Thassos fuel policy"],
    [/licence rules, fuel included/gi, "licence rules, fuel policy"],
    [/you steer, fuel included/gi, "you steer, safety briefing included"],
    [/Fuel is included, and guests/gi, "Safety briefing is included, and guests"],
    [/Every rental includes fuel and safety gear/gi, "Every rental includes safety gear and briefing"],
    [/includes safety briefings, fuel, and optional/gi, "includes safety briefings and optional"],
    [/Fuel and life jackets included/gi, "Life jackets and briefing included"],
    [/All rates include fuel, safety equipment/gi, "All rates include safety equipment"],
    [/Hourly rates include fuel and safety gear/gi, "Hourly rates include safety gear and briefing"],
    [/Fuel and safety briefing incl/gi, "Safety briefing incl"],
    [/Fuel & safety incl/gi, "Safety briefing incl"],
    [/Combustibil incl/gi, "Briefing siguranță incl"],
  ],
  el: [
    [/καύσιμα σε κάθε απόπλου/gi, "οδηγίες ασφαλείας σε κάθε απόπλου"],
    [/καύσιμα included/gi, "οδηγίες ασφαλείας"],
    [/Καύσιμα included/gi, "Οδηγίες ασφαλείας"],
    [/καύσιμα στο ενοίκιο/gi, "οδηγίες ασφαλείας"],
    [/Καύσιμα στο ενοίκιο/gi, "Οδηγίες ασφαλείας"],
    [/Καύσιμα περιλαμβάνονται/gi, "Οδηγίες ασφαλείας"],
    [/Τιμή με καύσιμα/gi, "Διαφανείς ωριαίες τιμές"],
    [/Καύσιμα για διαδρομές Θάσου/gi, "Εξοπλισμός ασφαλείας για διαδρομές Θάσο"],
    [/Καύσιμα για συνήθη πλεύση/gi, "Εξοπλισμός ασφαλείας για συνήθη πλεύση"],
    [/Καύσιμα σε Κάθε ενοικίαση/gi, "Οδηγίες ασφαλείας σε κάθε ενοικίαση"],
    [/Το καύσιμο περιλαμβάνεται στην τιμή;/g, "Το καύσιμο περιλαμβάνεται στην τιμή;"],
    [/Ναι\. Όλες οι ωριαίες τιμές περιλαμβάνουν καύσιμο για κρουαζιέρα γύρω από τη Θάσο\./g,
      "Όχι. Το καύσιμο χρεώνεται ξεχωριστά ανάλογα με τη χρήση. Εξηγούμε την τυπική κατανάλωση στο briefing."],
    [/περιλαμβάνουν καύσιμα και εξοπλισμό ασφαλείας/gi, "περιλαμβάνουν εξοπλισμό ασφαλείας και briefing"],
    [/περιλαμβάνει καύσιμα, εξοπλισμό ασφαλείας/gi, "περιλαμβάνει εξοπλισμό ασφαλείας και briefing"],
    [/Καύσιμα, σωσίβια/gi, "Σωσίβια"],
    [/Καύσιμα και safety briefing included/gi, "Safety briefing included"],
    [/καύσιμα included/gi, "briefing ασφαλείας"],
  ],
  de: [
    [/Kraftstoff inklusive/gi, "Sicherheitsbriefing inklusive"],
    [/Kraftstoff & Sicherheitsausrüstung inklusive/gi, "Sicherheitsausrüstung inklusive"],
    [/Kraftstoff und Sicherheitsausrüstung/gi, "Sicherheitsausrüstung"],
    [/Kraftstoff inkl\./gi, "Briefing inkl."],
    [/Benzin inklusive/gi, "Sicherheitsbriefing inklusive"],
    [/Treibstoff inklusive/gi, "Sicherheitsbriefing inklusive"],
    [/inkl\. Kraftstoff/gi, "inkl. Briefing"],
  ],
  ro: [
    [/combustibil incluse/gi, "briefing de siguranță inclus"],
    [/Combustibil incluse/gi, "Briefing de siguranță inclus"],
    [/combustibil inclus/gi, "briefing de siguranță inclus"],
    [/Combustibil inclus/gi, "Briefing de siguranță inclus"],
    [/combustibil incl\./gi, "briefing incl."],
    [/Combustibil incl\./gi, "Briefing incl."],
    [/Preț cu combustibil/gi, "Prețuri orare transparente"],
    [/Fără costuri surpriză la combustibil, inclus în preț/gi, "Combustibilul se plătește separat — explicăm consumul tipic la briefing"],
    [/Combustibil și briefing/gi, "Briefing de siguranță"],
  ],
  bg: [
    [/гориво включени/gi, "инструктаж за безопасност включен"],
    [/гориво включено/gi, "инструктаж за безопасност включен"],
    [/Гориво включено/gi, "Инструктаж за безопасност включен"],
    [/Без неочаквани разходи за гориво, включено в цената/gi, "Горивото се заплаща отделно — обясняваме типичния разход при инструктажа"],
    [/Цена с гориво/gi, "Прозрачни почасови цени"],
    [/гориво включено от Лименария/gi, "инструктаж от Лименария"],
  ],
  sr: [
    [/gorivo uključeno/gi, "sigurnosni brifing uključen"],
    [/Gorivo uključeno/gi, "Sigurnosni brifing uključen"],
    [/gorivo u cenu/gi, "sigurnosni brifing"],
    [/Gorivo u cenu/gi, "Sigurnosni brifing"],
  ],
};

function applyReplacers(text, replacers) {
  let out = text;
  for (const [pattern, replacement] of replacers) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function patchJson(filePath, locale) {
  const raw = fs.readFileSync(filePath, "utf8");
  const replacers = LOCALE_REPLACERS[locale];
  if (!replacers) return false;
  const next = applyReplacers(raw, replacers);
  if (next === raw) return false;
  fs.writeFileSync(filePath, next);
  return true;
}

// Locales
for (const locale of Object.keys(LOCALE_REPLACERS)) {
  const file = path.join(ROOT, "data/locales", `${locale}.json`);
  if (fs.existsSync(file)) {
    const changed = patchJson(file, locale);
    console.log(`${changed ? "updated" : "unchanged"}: data/locales/${locale}.json`);
  }
}

// boats.json — remove fuel-included amenities
const boatsPath = path.join(ROOT, "data/boats.json");
const boats = JSON.parse(fs.readFileSync(boatsPath, "utf8"));
let boatsChanged = false;
for (const boat of boats) {
  if (Array.isArray(boat.amenities)) {
    const before = boat.amenities.length;
    boat.amenities = boat.amenities.filter((a) => a.id !== "fuel-included");
    if (boat.amenities.length !== before) boatsChanged = true;
  }
}
if (boatsChanged) {
  fs.writeFileSync(boatsPath, JSON.stringify(boats, null, 2) + "\n");
  console.log("updated: data/boats.json");
}

// faq.json
const faqPath = path.join(ROOT, "data/faq.json");
if (fs.existsSync(faqPath)) {
  const faq = JSON.parse(fs.readFileSync(faqPath, "utf8"));
  let faqChanged = false;
  for (const item of faq.items ?? faq) {
    if (item.id === "fuel" || /fuel included/i.test(item.question ?? "")) {
      item.answer =
        "No. Fuel is charged separately based on usage. We explain typical consumption at briefing so there are no surprises at return.";
      faqChanged = true;
    }
  }
  if (faqChanged) {
    fs.writeFileSync(faqPath, JSON.stringify(faq, null, 2) + "\n");
    console.log("updated: data/faq.json");
  }
}

// chat.json
const chatPath = path.join(ROOT, "data/chat.json");
if (fs.existsSync(chatPath)) {
  const changed = patchJson(chatPath, "en");
  if (changed) console.log("updated: data/chat.json");
}

console.log("done");
