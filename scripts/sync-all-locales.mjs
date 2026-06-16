import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../data/locales");
const en = JSON.parse(readFileSync(join(dir, "en.json"), "utf-8"));

function deepMerge(a, b) {
  const r = { ...a };
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object" && !Array.isArray(a[k])) {
      r[k] = deepMerge(a[k], b[k]);
    } else if (b[k] !== undefined) {
      r[k] = b[k];
    }
  }
  return r;
}

const TR = {
  ro: {
    map: { subtitle: "Hartă interactivă a mării în jurul Thassos. Atinge marcajele pentru detalii.", loading: "Se încarcă harta...", departure: "Marina de plecare" },
    common: { language: "Limbă", backHome: "Înapoi acasă", lastUpdated: "Ultima actualizare", explore: "Explorează", later: "Mai târziu", viewAll: "Vezi tot", errorGeneric: "Ceva nu a mers bine. Încearcă din nou." },
    fleetGrid: { allVessels: "Toate vasele", fullFleet: "Flotă completă", moreVessels: "Mai multe vase", moreSubtitle: "Explorează întreaga colecție", viewFullFleet: "Vezi flota completă" },
    boatDetail: { gallery: "Galerie", features: "Dotări la bord", relatedTitle: "Ți-ar putea plăcea", relatedSubtitle: "Mai multe vase din flota noastră", guests: "Oaspeți", power: "Putere", length: "Lungime" },
    legal: { backHome: "Înapoi acasă", lastUpdated: "Ultima actualizare" },
    gdpr: { formTitle: "Trimite o cerere GDPR", email: "Email", requestType: "Tip cerere", access: "Acces la date", delete: "Ștergere date", portability: "Portabilitate date", details: "Detalii suplimentare", detailsPlaceholder: "Context opțional...", submit: "Trimite cererea", submitting: "Se trimite...", successTitle: "Cerere trimisă cu succes.", successDesc: "Răspundem în 30 de zile conform GDPR.", successAgain: "Altă cerere", error: "Trimitere eșuată. Încearcă din nou." },
    offers: { later: "Mai târziu" },
    nav: { bookNow: "Rezervă Acum" },
    chat: { peekAction: "Atinge pentru răspuns" },
    seo: {
      defaultTitle: "Închiriere Barci Thassos | Charter Privat & Croaziere de Zi din Limenaria",
      description: "Închiriază o barcă privată în Thassos, Grecia, de la €15/oră. Vapoare rapide, croaziere de zi și tururi lagună din Marina Limenaria. Combustibil inclus. Fără permis până la 30CP. Rezervă online.",
      keywords: "închiriere barci Thassos, barcă Thassos Grecia, marina Limenaria, charter privat Aegean, închiriere speedboat Grecia, croazieră Thassos, barcă fără permis Grecia",
      ogTitle: "Închiriere Barci Thassos — Evadarea Ta Privată în Egee",
      ogDescription: "Charter premium în Thassos. Golfuri secrete, plaje de marmură și croaziere la apus. Peste 5 vase de la €15/oră.",
      locale: "ro_RO"
    }
  },
  el: {
    map: { subtitle: "Διαδραστικός χάρτης θάλασσας γύρω από τη Θάσο. Πατήστε τους δείκτες.", loading: "Φόρτωση χάρτη...", departure: "Μαρίνα αναχώρησης" },
    common: { language: "Γλώσσα", backHome: "Αρχική", lastUpdated: "Τελευταία ενημέρωση", explore: "Εξερεύνηση", later: "Αργότερα", viewAll: "Δείτε όλα", errorGeneric: "Κάτι πήγε στραβά. Δοκιμάστε ξανά." },
    fleetGrid: { allVessels: "Όλα τα σκάφη", fullFleet: "Πλήρης στόλος", moreVessels: "Περισσότερα σκάφη", moreSubtitle: "Εξερευνήστε τη συλλογή", viewFullFleet: "Δείτε τον στόλο" },
    boatDetail: { gallery: "Γκαλερί", features: "Εξοπλισμός", relatedTitle: "Μπορεί να σας αρέσει", relatedSubtitle: "Περισσότερα σκάφη από τον στόλο μας", guests: "Επισκέπτες", power: "Ισχύς", length: "Μήκος" },
    legal: { backHome: "Αρχική", lastUpdated: "Τελευταία ενημέρωση" },
    gdpr: { formTitle: "Υποβολή αιτήματος GDPR", email: "Email", requestType: "Τύπος αιτήματος", access: "Πρόσβαση δεδομένων", delete: "Διαγραφή δεδομένων", portability: "Φορητότητα δεδομένων", details: "Επιπλέον λεπτομέρειες", detailsPlaceholder: "Προαιρετικό context...", submit: "Υποβολή", submitting: "Υποβολή...", successTitle: "Το αίτημα υποβλήθηκε.", successDesc: "Θα απαντήσουμε εντός 30 ημερών.", successAgain: "Νέο αίτημα", error: "Αποτυχία υποβολής." },
    offers: { later: "Αργότερα" },
    chat: { peekAction: "Πατήστε για απάντηση" },
    seo: {
      defaultTitle: "Ενοικίαση Σκάφους Θάσος | Ιδιωτικές Κρουαζιέρες από τη Λιμενάρια",
      description: "Ενοικιάστε ιδιωτικό σκάφος στη Θάσο από €15/ώρα. Ταχύπλοα, ημερήσιες κρουαζιέρες και εκδρομές σε λιμνοθάλασσες από τη Μαρίνα Λιμενάρια. Καύσιμα συμπεριλαμβάνονται. Χωρίς άδεια έως 30HP. Κράτηση online.",
      keywords: "ενοικίαση σκάφους Θάσος, ενοικίαση βάρκας Θάσος, μαρίνα Λιμενάρια, ιδιωτική κρουαζιέρα Αιγαίο, ταχύπλοο Ελλάδα, κρουαζιέρα Θάσος, σκάφος χωρίς άδεια",
      ogTitle: "Ενοικίαση Σκάφους Θάσος — Η Ιδιωτική σας Απόδραση στο Αιγαίο",
      ogDescription: "Premium charter στη Θάσο. Κρυφές λαγούδες, παραλίες μαρμάρου και ηλιοβασιλέματα. 5+ σκάφη από €15/ώρα.",
      locale: "el_GR"
    }
  },
  de: {
    map: { subtitle: "Interaktive Seekarte um Thassos. Marker für Details antippen.", loading: "Karte wird geladen...", departure: "Abfahrtsmarina" },
    common: { language: "Sprache", backHome: "Zur Startseite", lastUpdated: "Zuletzt aktualisiert", explore: "Entdecken", later: "Später", viewAll: "Alle anzeigen", errorGeneric: "Etwas ist schiefgelaufen. Bitte erneut versuchen." },
    fleetGrid: { allVessels: "Alle Boote", fullFleet: "Gesamte Flotte", moreVessels: "Weitere Boote", moreSubtitle: "Entdecken Sie unsere Sammlung", viewFullFleet: "Flotte ansehen" },
    boatDetail: { gallery: "Galerie", features: "Ausstattung", relatedTitle: "Das könnte Ihnen gefallen", relatedSubtitle: "Weitere Boote aus unserer Flotte", guests: "Gäste", power: "Leistung", length: "Länge" },
    legal: { backHome: "Zur Startseite", lastUpdated: "Zuletzt aktualisiert" },
    gdpr: { formTitle: "DSGVO-Anfrage senden", email: "E-Mail", requestType: "Anfragetyp", access: "Datenzugang", delete: "Datenlöschung", portability: "Datenportabilität", details: "Zusätzliche Details", detailsPlaceholder: "Optionaler Kontext...", submit: "Anfrage senden", submitting: "Wird gesendet...", successTitle: "Anfrage erfolgreich gesendet.", successDesc: "Antwort innerhalb von 30 Tagen.", successAgain: "Weitere Anfrage", error: "Senden fehlgeschlagen." },
    offers: { later: "Später" },
    chat: { peekAction: "Tippen zum Antworten" },
    seo: {
      defaultTitle: "Bootsvermietung Thassos | Private Charter & Tagesausflüge ab Limenaria",
      description: "Mieten Sie ein privates Boot auf Thassos, Griechenland, ab €15/Stunde. Speedboats, Tageskreuzer und Lagunentouren ab Marina Limenaria. Kraftstoff inklusive. Kein Führerschein bis 30 PS. Online buchen.",
      keywords: "Bootsvermietung Thassos, Boot mieten Thassos Griechenland, Marina Limenaria, Ägäis Charter, Speedboat Miete Griechenland, Tagesausflug Thassos, Boot ohne Führerschein Griechenland",
      ogTitle: "Bootsvermietung Thassos — Ihre private Ägäis-Auszeit",
      ogDescription: "Premium Charter auf Thassos. Geheime Buchten, Marmorstrände und Sonnenuntergangsfahrten. 5+ Boote ab €15/Std.",
      locale: "de_DE"
    }
  },
  sr: {
    map: { subtitle: "Interaktivna mapa mora oko Tasosa. Dodirnite markere.", loading: "Učitavanje mape...", departure: "Marina polaska" },
    common: { language: "Jezik", backHome: "Početna", lastUpdated: "Poslednje ažuriranje", explore: "Istraži", later: "Kasnije", viewAll: "Vidi sve", errorGeneric: "Nešto nije u redu. Pokušaj ponovo." },
    fleetGrid: { allVessels: "Sva plovila", fullFleet: "Cela flota", moreVessels: "Još plovila", moreSubtitle: "Istraži celu kolekciju", viewFullFleet: "Vidi flotu" },
    boatDetail: { gallery: "Galerija", features: "Oprema", relatedTitle: "Možda vam se svidi", relatedSubtitle: "Više plovila iz naše flote", guests: "Gosti", power: "Snaga", length: "Dužina" },
    legal: { backHome: "Početna", lastUpdated: "Poslednje ažuriranje" },
    gdpr: { formTitle: "Pošalji GDPR zahtev", email: "Email", requestType: "Tip zahteva", access: "Pristup podacima", delete: "Brisanje podataka", portability: "Prenosivost podataka", details: "Dodatni detalji", detailsPlaceholder: "Opcioni kontekst...", submit: "Pošalji", submitting: "Šalje se...", successTitle: "Zahtev poslat.", successDesc: "Odgovaramo u roku od 30 dana.", successAgain: "Novi zahtev", error: "Slanje nije uspelo." },
    offers: { later: "Kasnije" },
    chat: { peekAction: "Dodirni za odgovor" },
    seo: {
      defaultTitle: "Iznajmljivanje Čamaca Tasos | Privatni Izleti iz Limenarije",
      description: "Iznajmite privatni čamac na Tasosu, Grčka, od €15/sat. Gliseri, dnevne krstarenja i ture do laguna iz Marine Limenaria. Gorivo uključeno. Bez dozvole do 30KS. Rezervišite online.",
      keywords: "iznajmljivanje čamaca Tasos, čamac Tasos Grčka, marina Limenaria, privatni charter Egej, iznajmljivanje glisera Grčka, krstarenje Tasos, čamac bez dozvole",
      ogTitle: "Iznajmljivanje Čamaca Tasos — Vaše Privatno Egejsko Bekstvo",
      ogDescription: "Premium charter na Tasosu. Tajne uvala, mermerne plaže i zalaske sunca. 5+ plovila od €15/sat.",
      locale: "sr_RS"
    }
  },
  bg: {
    map: { subtitle: "Интерактивна морска карта около Тасос. Докоснете марерите.", loading: "Зареждане на картата...", departure: "Марина на тръгване" },
    common: { language: "Език", backHome: "Начало", lastUpdated: "Последна актуализация", explore: "Открий", later: "По-късно", viewAll: "Виж всички", errorGeneric: "Нещо се обърка. Опитайте отново." },
    fleetGrid: { allVessels: "Всички лодки", fullFleet: "Цялата флота", moreVessels: "Още лодки", moreSubtitle: "Разгледайте колекцията", viewFullFleet: "Виж флотата" },
    boatDetail: { gallery: "Галерия", features: "Оборудване", relatedTitle: "Може да харесате", relatedSubtitle: "Още лодки от флотата", guests: "Гости", power: "Мощност", length: "Дължина" },
    legal: { backHome: "Начало", lastUpdated: "Последна актуализация" },
    gdpr: { formTitle: "Изпрати GDPR заявка", email: "Имейл", requestType: "Тип заявка", access: "Достъп до данни", delete: "Изтриване на данни", portability: "Преносимост", details: "Допълнителни детайли", detailsPlaceholder: "По избор контекст...", submit: "Изпрати", submitting: "Изпращане...", successTitle: "Заявката е изпратена.", successDesc: "Отговаряме в рамките на 30 дни.", successAgain: "Нова заявка", error: "Изпращането не успя." },
    offers: { later: "По-късно" },
    chat: { peekAction: "Докоснете за отговор" },
    seo: {
      defaultTitle: "Наем на Лодка Тасос | Частни Круизи от Лименария",
      description: "Наемете частна лодка на Тасос, Гърция, от €15/час. Моторни лодки, дневни круизи и турове до лагуни от Марина Лименария. Гориво включено. Без лиценз до 30 к.с. Резервирайте онлайн.",
      keywords: "наем лодка Тасос, лодка под наем Тасос Гърция, марина Лименария, частен чартър Егейско море, моторна лодка Гърция, круиз Тасос, лодка без лиценз",
      ogTitle: "Наем на Лодка Тасос — Вашето Частно Бягство в Егейско Море",
      ogDescription: "Премиум чартър на Тасос. Тайни заливи, мраморни плажове и залези. 5+ лодки от €15/час.",
      locale: "bg_BG"
    }
  }
};

for (const lang of ["ro", "el", "de", "sr", "bg"]) {
  const existing = JSON.parse(readFileSync(join(dir, `${lang}.json`), "utf-8"));
  const merged = deepMerge(deepMerge(en, existing), TR[lang]);
  writeFileSync(join(dir, `${lang}.json`), JSON.stringify(merged, null, 2) + "\n");
  console.log(`Synced ${lang}.json (${Object.keys(merged).length} top-level keys)`);
}
