#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const REPLACERS = {
  en: [
    [/crewed charters/gi, "crewed boat rentals"],
    [/crewed charter/gi, "crewed boat rental"],
    [/boat charters/gi, "boat rentals"],
    [/boat charter/gi, "boat rental"],
    [/charter ratings/gi, "boat rental ratings"],
    [/charter conditions/gi, "boat rental conditions"],
    [/charter rules/gi, "boat rental rules"],
    [/charter bookings/gi, "boat rental bookings"],
    [/charter boat/gi, "rental boat"],
    [/find charter boat/gi, "find rental boat"],
    [/charter-related/gi, "boat rental"],
    [/day charters/gi, "day boat rentals"],
    [/day charter/gi, "day boat rental"],
    [/hourly boat charters/gi, "hourly boat rentals"],
    [/hourly charters/gi, "hourly boat rentals"],
    [/Private Charter/gi, "Private Boat Rental"],
    [/private charters/gi, "private boat rentals"],
    [/private charter/gi, "private boat rental"],
    [/day-cruiser charters/gi, "day-cruiser rentals"],
    [/Thassos charter/gi, "Thassos boat rental"],
    [/first Thassos charter/gi, "first Thassos boat trip"],
    [/every charter/gi, "every rental"],
    [/standard day charters/gi, "standard day rentals"],
    [/All charters/gi, "All boats"],
    [/large yachts or crewed/gi, "large boats or crewed"],
    [/large yachts/gi, "large boats"],
    [/no yachts/gi, "no large boats"],
    [/yachts/gi, "boats"],
    [/yacht/gi, "boat"],
    [/charters/gi, "boat rentals"],
    [/charter/gi, "boat rental"],
    [/Verified guest charters/gi, "Verified guest boat rentals"],
    [/Aegean charter/gi, "Aegean boat rental"],
    [/perfect Aegean charter/gi, "perfect Aegean boat day"],
    [/charter departure/gi, "boat departure"],
    [/\bvessels\b/gi, "boats"],
    [/\bVessels\b/g, "Boats"],
    [/\bvessel\b/gi, "boat"],
    [/\bVessel\b/g, "Boat"],
  ],
  el: [
    [/crewed charters/gi, "σκάφη με κυβερνήτη"],
    [/μεγάλα γιοτ/gi, "μεγάλα σκάφη"],
    [/γιοτ/gi, "μεγάλα σκάφη"],
    [/χωρίς γιοτ/gi, "χωρίς μεγάλα σκάφη"],
    [/Charter boarding pass/gi, "Κάρτα επιβίβασης"],
    [/Παραλίες με Charter/gi, "Παραλίες με ενοικίαση σκάφους"],
    [/συμβουλές charter/gi, "συμβουλές ενοικίασης"],
    [/κόστος charter/gi, "κόστος ενοικίασης"],
    [/σκάφος charter/gi, "σκάφος προς ενοικίαση"],
    [/εύρεση σκάφους charter/gi, "εύρεση σκάφους"],
    [/κανόνες charter/gi, "κανόνες ενοικίας"],
    [/Οδηγός charter/gi, "Οδηγός ενοικίασης"],
    [/χειριστής charter/gi, "πάροχος ενοικίασης σκαφών"],
    [/ομάδα charter/gi, "ομάδα ενοικίασης σκαφών"],
    [/ημέρα του charter/gi, "ημέρα ενοικίασης"],
    [/Ωριαία charter/gi, "Ωριαία ενοικίαση"],
    [/Κάθε charter/gi, "Κάθε ενοικίαση"],
    [/το charter σας/gi, "την ενοικίασή σας"],
    [/σελίδες charter/gi, "σελίδες ενοικίασης"],
    [/Πακέτο charter/gi, "Πακέτο ενοικίασης"],
    [/FAQ charter/gi, "FAQ ενοικίασης"],
    [/Αίτημα charter/gi, "Αίτημα ενοικίασης"],
    [/αυτό το charter/gi, "αυτή την ενοικίαση"],
    [/ιδανικό σας charter/gi, "ιδανική ενοικίαση"],
    [/ολοήμερο charter/gi, "ολοήμερη ενοικίαση"],
    [/σε κάθε charter/gi, "σε κάθε ενοικίαση"],
    [/charter/gi, "ενοικίαση"],
    [/ναύλωση/gi, "ενοικίαση"],
  ],
  de: [
    [/Bootscharter/gi, "Bootsvermietung"],
    [/Charterboot/gi, "Mietboot"],
    [/Charterregeln/gi, "Mietregeln"],
    [/Charterbedingungen/gi, "Mietbedingungen"],
    [/Charter mit Crew/gi, "Boot mit Crew"],
    [/Charter-Team/gi, "Bootsverleih-Team"],
    [/familiengeführter Charter/gi, "familiengeführter Bootsverleih"],
    [/Charterpreis/gi, "Mietpreis"],
    [/Ägäis Charter/gi, "Ägäis Bootsverleih"],
    [/Premium Charter/gi, "Premium Bootsverleih"],
    [/echte Charter/gi, "echte Bootsvermietung"],
    [/Charter bauen/gi, "Paket zusammenstellen"],
    [/Charter anfragen/gi, "Boot anfragen"],
    [/große Yachten/gi, "große Boote"],
    [/keine Yachten/gi, "keine großen Boote"],
    [/Yachten/gi, "Boote"],
    [/Limenaria Charter/gi, "Limenaria Bootsverleih"],
    [/Chartertag/gi, "Miettag"],
    [/charter/gi, "Bootsverleih"],
    [/\bSchiffe\b/gi, "Boote"],
    [/\bSchiff\b/gi, "Boot"],
    [/\bFahrzeuge\b/gi, "Boote"],
    [/\bFahrzeug\b/gi, "Boot"],
  ],
  ro: [
    [/charter cu echipaj/gi, "barcă cu echipaj"],
    [/charter de bărci/gi, "închiriere bărci"],
    [/barca de charter/gi, "barca de închiriat"],
    [/barcă charter/gi, "barcă de închiriat"],
    [/găsiți barcă charter/gi, "găsiți barcă de închiriat"],
    [/evaluări charter/gi, "evaluări închiriere bărci"],
    [/condiții charter/gi, "condiții închiriere bărci"],
    [/reguli de charter/gi, "reguli de închiriere"],
    [/charter de familie/gi, "închiriere de familie"],
    [/echipa ta de charter/gi, "echipa ta de închiriere bărci"],
    [/chartere reale/gi, "închirieri reale"],
    [/Creează charter/gi, "Creează pachet"],
    [/Solicită charter/gi, "Solicită închiriere"],
    [/Charter premium/gi, "Închiriere premium"],
    [/iahturi mari/gi, "bărci mari"],
    [/fără iahturi/gi, "fără bărci mari"],
    [/iahturi/gi, "bărci mari"],
    [/charter/gi, "închiriere bărci"],
    [/Ambarcațiunea anterioară/g, "Barca anterioară"],
    [/Ambarcațiunea următoare/g, "Barca următoare"],
    [/Ambarcațiune preferată/g, "Barcă preferată"],
    [/ambarcațiuni/gi, "bărci"],
    [/ambarcațiune/gi, "barcă"],
    [/Ambarcațiune/g, "Barcă"],
  ],
  bg: [
    [/Заяви charter/gi, "Заяви наем на лодка"],
    [/charter/gi, "наем на лодка"],
    [/яхта/gi, "лодка"],
    [/яхти/gi, "лодки"],
  ],
  sr: [
    [/pravi charteri/gi, "pravo iznajmljivanje brodova"],
    [/Napravi charter/gi, "Napravi paket"],
    [/Zatraži charter/gi, "Zatraži iznajmljivanje broda"],
    [/Premium charter/gi, "Premium iznajmljivanje brodova"],
    [/jahti/gi, "brodovi"],
    [/jahta/gi, "brod"],
    [/charter/gi, "iznajmljivanje broda"],
    [/Sva plovila/gi, "Svi brodovi"],
    [/Preferirano plovilo/gi, "Preferirani brod"],
    [/slobodnih plovila/gi, "slobodnih brodova"],
    [/za svako plovilo/gi, "za svaki brod"],
    [/plovila/gi, "brodovi"],
    [/plovilo/gi, "brod"],
    [/Plovilo/g, "Brod"],
  ],
};

function transformString(value, locale) {
  if (typeof value !== "string" || !value) return value;
  let out = value;
  const rules = REPLACERS[locale] ?? REPLACERS.en;
  for (const [pattern, replacement] of rules) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function walk(value, locale) {
  if (typeof value === "string") return transformString(value, locale);
  if (Array.isArray(value)) return value.map((item) => walk(item, locale));
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = walk(child, locale);
    }
    return next;
  }
  return value;
}

function localeFromFilename(file) {
  const base = path.basename(file, ".json");
  if (REPLACERS[base]) return base;
  const m = file.match(/translations\/([a-z]{2})\.json$/);
  if (m) return m[1];
  return "en";
}

function collectJsonFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsonFiles(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

const targets = [
  ...collectJsonFiles(path.join(ROOT, "data", "locales")),
  ...collectJsonFiles(path.join(ROOT, "data", "blog")),
  ...collectJsonFiles(path.join(ROOT, "data", "legal")),
  ...collectJsonFiles(path.join(ROOT, "data", "locations")),
  path.join(ROOT, "data", "boats.json"),
  path.join(ROOT, "data", "chat.json"),
  path.join(ROOT, "data", "offers.json"),
  path.join(ROOT, "data", "testimonials.json"),
  path.join(ROOT, "data", "faq.json"),
  path.join(ROOT, "data", "legal.json"),
  path.join(ROOT, "data", "matchmaker.json"),
].filter((p) => fs.existsSync(p));

let changed = 0;
for (const file of targets) {
  const locale = localeFromFilename(file);
  const raw = fs.readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  const updated = walk(data, locale);
  const next = `${JSON.stringify(updated, null, 2)}\n`;
  if (next !== raw) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`updated: ${path.relative(ROOT, file)} (${locale})`);
  }
}

console.log(`Done. ${changed} file(s) updated.`);
