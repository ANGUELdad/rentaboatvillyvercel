#!/usr/bin/env node
/**
 * Rename Limenaria Marina → New Port of Limenaria (and locale equivalents).
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const files = [
  "data/locales/en.json",
  "data/locales/el.json",
  "data/locales/de.json",
  "data/locales/ro.json",
  "data/locales/bg.json",
  "data/locales/sr.json",
  "data/faq.json",
  "data/chat.json",
  "data/boats.json",
  "data/gallery.json",
  "data/legal.json",
  "data/routes.json",
  "data/testimonials.json",
  "data/blog/en.json",
  "data/blog/translations/el.json",
  "data/blog/translations/de.json",
  "data/blog/translations/ro.json",
  "data/blog/translations/bg.json",
  "data/blog/translations/sr.json",
  "data/legal/translations/el.json",
  "data/legal/translations/de.json",
  "data/legal/translations/ro.json",
  "data/legal/translations/bg.json",
  "data/legal/translations/sr.json",
  "src/lib/chat/concierge-brain.ts",
  "src/lib/chat/concierge-menu-messages.ts",
  "src/lib/seo/schemas.ts",
  "src/lib/seo/config.ts",
  "src/lib/data.ts",
  "src/lib/site.ts",
  "src/components/home/WhyChooseSection.tsx",
  "src/components/FAQSection.tsx",
  "src/components/faq/FaqPageExperience.tsx",
  "src/components/ConciergeChat.tsx",
  "src/components/ConciergeChatWrapper.tsx",
  "src/components/package/PackageBuilder.tsx",
  "src/components/pages/BoatDetailShell.tsx",
  "src/components/pages/BlogPageShell.tsx",
  "src/components/pages/RentBoatThassosShell.tsx",
  "src/components/blog/BlogArticleView.tsx",
  "src/components/map/MapPageClient.tsx",
  "src/components/guide/GuidePageExperience.tsx",
  "src/components/yacht/YachtSearchCard.tsx",
  "src/app/layout.tsx",
  "src/app/manifest.ts",
  "src/app/opengraph-image.tsx",
  "src/app/(site)/blog/page.tsx",
  "src/components/Hero.tsx",
  "src/components/hero/HeroBookingMini.tsx",
  "src/components/layout/Footer.tsx",
];

const en = [
  ["Limenaria Marina", "New Port of Limenaria"],
  ["Limenaria marina", "New Port of Limenaria"],
];

const el = [
  ["Βάση Μαρίνα Λιμενάρια", "Βάση Νέο Λιμάνι Λιμεναρίων"],
  ["Πού είναι η Μαρίνα Λιμενάρια", "Πού είναι το Νέο Λιμάνι Λιμεναρίων"],
  ["Πώς φτάνω στη Μαρίνα Λιμενάρια", "Πώς φτάνω στο Νέο Λιμάνι Λιμεναρίων"],
  ["Γιατί από τη Μαρίνα Λιμενάρια", "Γιατί από το Νέο Λιμάνι Λιμεναρίων"],
  ["Από Μαρίνα Λιμενάρια", "Από το Νέο Λιμάνι Λιμεναρίων"],
  ["από Μαρίνα Λιμενάρια", "από το Νέο Λιμάνι Λιμεναρίων"],
  ["στη Μαρίνα Λιμενάρια", "στο Νέο Λιμάνι Λιμεναρίων"],
  ["Συνάντηση στη Μαρίνα Λιμενάρια", "Συνάντηση στο Νέο Λιμάνι Λιμεναρίων"],
  ["Έλα στη Μαρίνα Λιμενάρια", "Έλα στο Νέο Λιμάνι Λιμεναρίων"],
  ["ελάτε στη Μαρίνα Λιμενάρια", "ελάτε στο Νέο Λιμάνι Λιμεναρίων"],
  ["Αναχώρηση από τη Μαρίνα Λιμενάρια", "Αναχώρηση από το Νέο Λιμάνι Λιμεναρίων"],
  ["Αναχωρούμε από Μαρίνα Λιμενάρια", "Αναχωρούμε από το Νέο Λιμάνι Λιμεναρίων"],
  ["από τη Μαρίνα Λιμενάρια", "από το Νέο Λιμάνι Λιμεναρίων"],
  ["Μαρίνα Λιμενάρια", "Νέο Λιμάνι Λιμεναρίων"],
  ["μαρίνα Λιμενάρια", "Νέο Λιμάνι Λιμεναρίων"],
  ["μαρίνα λιμενάρια", "νέο λιμάνι λιμεναρίων"],
];

const de = [
  ["in der Marina Limenaria", "im Neuen Hafen von Limenaria"],
  ["in der Limenaria Marina", "im Neuen Hafen von Limenaria"],
  ["der Marina Limenaria", "des Neuen Hafens von Limenaria"],
  ["Die Limenaria Marina", "Der neue Hafen von Limenaria"],
  ["Limenaria Marina", "Neuer Hafen von Limenaria"],
  ["Marina Limenaria", "Neuer Hafen von Limenaria"],
];

const ro = [
  ["din Marina Limenaria", "din Noul Port Limenaria"],
  ["în Marina Limenaria", "în Noul Port Limenaria"],
  ["Marina Limenaria", "Noul Port Limenaria"],
  ["Limenaria Marina", "Noul Port Limenaria"],
];

const sr = [
  ["Marina Limenaria", "Novi port Limenarija"],
  ["Limenaria Marina", "Novi port Limenarija"],
];

const bg = [
  ["Марина Лименария", "Новото пристанище Лименария"],
  ["Limenaria Marina", "Новото пристанище Лименария"],
];

function applyReplacements(content, pairs) {
  let out = content;
  for (const [from, to] of pairs) {
    out = out.split(from).join(to);
  }
  return out;
}

let changed = 0;
for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) continue;
  const original = fs.readFileSync(filePath, "utf8");
  let next = original;
  next = applyReplacements(next, en);
  if (rel.includes("/el.") || rel.endsWith("el.json")) next = applyReplacements(next, el);
  if (rel.includes("/de.") || rel.endsWith("de.json")) next = applyReplacements(next, de);
  if (rel.includes("/ro.") || rel.endsWith("ro.json")) next = applyReplacements(next, ro);
  if (rel.includes("/sr.") || rel.endsWith("sr.json")) next = applyReplacements(next, sr);
  if (rel.includes("/bg.") || rel.endsWith("bg.json")) next = applyReplacements(next, bg);
  if (next !== original) {
    fs.writeFileSync(filePath, next);
    changed++;
    console.log("updated:", rel);
  }
}

console.log(`Done. ${changed} files updated.`);
