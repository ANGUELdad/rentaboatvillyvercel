#!/usr/bin/env node
/**
 * Repair Greek locale strings broken by over-aggressive price-stripping
 * (τιμή/τιμόνι/προτιμώμενη etc. were partially replaced).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EL_PATH = join(__dirname, "../data/locales/el.json");
const PHONE = "+30 698 131 8393";

const EXACT = {
  "hero.pillSelfDrive": "Εσύ στο τιμόνι",
  "home.seasonDock.highlight3": "Πρόγραμμα κράτησης — καλύτερη διαθεσιμότητα",
  "home.whyChoose.items.earlyBooking.desc":
    "Κλείστε νωρίς για πρώτη επιλογή σκάφους και ημερομηνίας.",
  "home.exploreSubtitle":
    "Η Rent A Boat Villy είναι οικογενειακός πάροχος ενοικίασης σκαφών στη Μαρίνα Λιμενάρια — οδηγείτε εσείς το σκάφος. Οδηγίες ασφαλείας σε κάθε απόπλου, με συμβουλές διαδρομών αν θέλετε.",
  "fleet.stat2": `Επικοινωνήστε για τιμές — ${PHONE}`,
  "packageBuilder.storyDayHint":
    "Όρισε διάρκεια και επιβάτες. Πρόσθεσε προτιμώμενη ημερομηνία αν έχεις.",
  "packageBuilder.preferredDate": "Προτιμώμενη ημερομηνία",
  "package.eyebrow": "Ενοικίαση σκάφους",
  "package.title": "Αίτημα ενοικίασης",
  "package.loading": "Φόρτωση φόρμας κράτησης…",
  "package.stepConfigureHint":
    "Διάλεξε σκάφος, ώρες και άτομα — μετά στείλε το αίτημά σου.",
  "conversion.bookingBadges.transparent": "Οδηγίες ασφαλείας σε κάθε απόπλου",
  "boatDetail.startingAt": "Τιμές",
  "boatDetail.contactForRates": `Επικοινωνήστε για τιμές — καλέστε ${PHONE} ή επισκεφθείτε το γραφείο μας στη Μαρίνα Λιμενάρια.`,
  "booking.form.vessel": "Προτιμώμενο σκάφος",
  "faq.items.0.a":
    "Όχι, στέλνετε αίτημα με τα στοιχεία και τις προτιμήσεις σας. Ελέγχουμε ποιο σκάφος είναι διαθέσιμο και σας καλούμε ή στέλνουμε μήνυμα. Τίποτα δεν είναι οριστικό μέχρι να επικοινωνήσουμε.",
  "faq.items.1.a": `Οι τιμές εξαρτώνται από σκάφος και εποχή. Καλέστε ${PHONE} ή στείλτε αίτημα κράτησης (/booking).`,
  "faq.items.2.q": "Το καύσιμο περιλαμβάνεται στην ενοικίαση;",
  "seoHome.categoryRentalDesc":
    "Άδειες, καιρός & συμβουλές κράτησης για ωριαία ενοικίαση στη Λιμενάρια.",
  "chat.placeholder": "Σκάφη, παραλίες, κράτηση…",
  "chat.suggestions.0": "Κράτηση",
  "chat.suggestions.1": "Στόλος",
  "chat.suggestions.2": "Καύσιμα",
  "concierge.welcome.message":
    "Γεια! Είμαι η Villy, η concierge σου στη Μαρίνα Λιμενάρια. Σκάφη, παραλίες ή κράτηση — διάλεξε θέμα και θα σε βοηθήσω να οργανώσεις μια υπέροχη μέρα στο νερό.",
  "concierge.topics.pricing.label": "Τιμές & διαθεσιμότητα",
  "concierge.topics.pricing.message": `Οι τιμές εξαρτώνται από σκάφος και εποχή. Καλέστε ${PHONE} ή δείτε τον στόλο (/fleet).`,
  "concierge.topics.booking.message":
    "Οι ωριαίες ενοικιάσεις περιλαμβάνουν εξοπλισμό ασφαλείας και briefing. Κράτα νωρίς στην αιχμή.",
  "concierge.topics.booking.actions.0.label": "Αίτημα κράτησης",
  "concierge.topics.fleet.message":
    "Σύγκρινε φωτογραφίες, χαρακτηριστικά και χωρητικότητα των σκαφών μας.",
  "seo.boat.description":
    "Ενοικίαση σκάφους στη Θάσο: {name} στη Μαρίνα Λιμενάρια. {hp}HP, {pax} άτομα. {desc} Οδηγίες ασφαλείας. Επικοινωνήστε για τιμές.",
  "seo.pages.home.description":
    "Ενοικίαση σκάφους στη Θάσο, ταχύπλοα & day cruisers στη Μαρίνα Λιμενάρια. Τιμές κατόπιν συνεννόησης, οδηγίες ασφαλείας, χωρίς άδεια έως 30HP.",
  "seo.pages.package.title": "Αίτημα Ενοικίασης Σκάφους Θάσος",
  "seo.pages.package.description":
    "Στείλτε αίτημα ενοικίασης σκάφους στη Θάσο — επιλέξτε σκάφος και διάρκεια από Μαρίνα Λιμενάρια.",
  "seo.pages.package.keywords":
    "ενοικίαση σκάφους Θάσος, κόστος ενοικίασης Θάσος, μαρίνα Λιμενάρια",
  "seo.pages.faq.title": "FAQ Ενοικίασης Σκάφους Θάσος | Άδεια, Καύσιμα & Τιμές",
  "seoHome.blocks.0.paragraphs.0":
    "Οι τιμές εξαρτώνται από τύπο σκάφους και εποχή — ταχύπλοα και day cruisers από τη Μαρίνα Λιμενάρια. Κάθε ενοικίαση περιλαμβάνει εξοπλισμό ασφαλείας, briefing και προτεινόμενες GPS διαδρομές.",
  "seoHome.blocks.2.list.2":
    "Επίλεξε ημερομηνία και επιβάτες στη φόρμα κράτησης",
  "seoHome.blocks.3.paragraphs.0":
    `Οι τιμές εξαρτώνται από σκάφος και εποχή. Καλέστε ${PHONE} ή στείλτε αίτημα κράτησης πριν την άφιξή σας.`,
  "yachtUi.specs.perHourShort": `Επικοινωνήστε — ${PHONE}`,
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

function repairString(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/τιμές κατόπιν συνεννόησηςόνι/g, "τιμόνι")
    .replace(/προτιμές κατόπιν συνεννόησηςώμενη/g, "προτιμώμενη")
    .replace(/προτιμές κατόπιν συνεννόησηςώμενο/g, "προτιμώμενο")
    .replace(/προτιμές κατόπιν συνεννόησηςσεις/g, "προτιμήσεις")
    .replace(/τιμές κατόπιν συνεννόησηςών/g, "τιμών")
    .replace(/υπολογιστή τιμές κατόπιν συνεννόησηςς/g, "φόρμα κράτησης")
    .replace(/τιμές κατόπιν συνεννόησηςς/g, "κόστους")
    .replace(/τιμές κατόπιν συνεννόησης κατόπιν συνεννόησης/g, "τιμές κατόπιν συνεννόησης")
    .replace(/κατόπιν συνεννόησης ανάλογα/g, "ανάλογα")
    .replace(/τιμές κατόπιν συνεννόησης/g, "τιμές")
    .replace(/τιμές\s+τιμές/g, "τιμές")
    .replace(/\s{2,}/g, " ")
    .trim();
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
  return repairString(obj);
}

const raw = JSON.parse(readFileSync(EL_PATH, "utf8"));
let data = walk(raw);
let applied = 0;
for (const [path, value] of Object.entries(EXACT)) {
  if (setByPath(data, path, value)) applied++;
}
writeFileSync(EL_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Fixed el.json — ${applied} exact overrides + global repair pass`);
