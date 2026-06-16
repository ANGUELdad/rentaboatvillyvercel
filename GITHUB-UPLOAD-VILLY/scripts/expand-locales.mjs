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

const shared = {
  ro: {
    nav: { faq: "Întrebări" },
    hero: { scroll: "Derulează pentru a explora" },
    fleet: { subtitle: "De la bărci agile la iahturi de lux — companionul tău perfect în Aegean.", stat1: "5+ Vase", stat2: "De la 15€/oră", stat3: "Fără permis ≤30CP" },
    map: { subtitle: "Hartă interactivă gratuită cu OpenStreetMap. Atinge marcajele pentru detalii." },
    experiences: {
      subtitle: "Aventuri sub soare pentru cupluri, familii și sărbători.",
      items: [
        { title: "Croaziere la Apus", desc: "Ora de aur pe Aegean — șampanie opțional, amintiri garantate." },
        { title: "Lagune Secrete", desc: "Golfuri cunoscute doar de localnici. Rute GPS incluse." },
        { title: "Chartere de O Zi", desc: "De la răsărit la apus — explorează tot litoralul Thassos." },
        { title: "Călătorii de Sărbătoare", desc: "Zile de naștere, cereri în căsătorie, reuniuni — pregătim scena." }
      ]
    },
    booking: {
      expectTitle: "Ce să te aștepți", expect1: "Email de confirmare în 1 oră.", expect2: "Adu CI/pașaport la sosire.", expect3: "30% avans. Restul la marina Limenaria.",
      successTitle: "Cerere primită", successDesc: "Confirmăm în curând charterul. Verifică emailul.", successAgain: "Altă rezervare", submit: "Trimite rezervarea", submitting: "Se trimite...",
      form: { fullName: "Nume complet", email: "Email", phone: "Telefon", idNumber: "CI / Pașaport", date: "Data", time: "Ora preferată", vessel: "Vas", route: "Rută", guests: "Oaspeți", notes: "Cereri speciale", selectBoat: "Alege vasul", selectRoute: "Alege ruta", guestCount: "oaspete", guestCountPlural: "oaspeți" }
    },
    faq: {
      subtitle: "Tot ce trebuie să știi înainte de a pleca la apă.",
      items: [
        { q: "Am nevoie de permis de barcă?", a: "Pentru vase până la 30CP, nu este necesar. Oferim briefing de siguranță înainte de fiecare plecare." },
        { q: "Combustibilul este inclus?", a: "Da. Toate tarifele orare includ combustibil pentru croazieră standard în jurul Thassos." },
        { q: "Ce facem dacă vremea e rea?", a: "Reprogramăm fără cost sau oferim rambursare completă dacă condițiile sunt nesigure." },
        { q: "Este necesar un avans?", a: "Un avans de 30% asigură rezervarea. Restul la Marina Limenaria." },
        { q: "De unde plecăm?", a: "Toate charterele pleacă din marina Limenaria. GPS trimis la confirmare." }
      ]
    },
    cookies: { title: "Prețuim confidențialitatea", desc: "Cookie-urile necesare mențin site-ul. Analiza și marketingul sunt opționale.", policy: "Politica Cookie", acceptAll: "Acceptă tot", reject: "Doar esențiale", customize: "Personalizează", settingsTitle: "Preferințe Cookie", necessary: "Necesare", necessaryDesc: "Necesare pentru funcționare", alwaysOn: "Mereu active", analytics: "Analiză", analyticsDesc: "Statistici anonime", marketing: "Marketing", marketingDesc: "Remarketing", save: "Salvează", footerSettings: "Setări Cookie" },
    footer: { tagline: "Evadări în Aegean · Thassos, Grecia", fleet: "Flotă", map: "Hartă", guide: "Ghid", reviews: "Recenzii", book: "Rezervă", blog: "Blog", privacy: "Confidențialitate", cookies: "Cookie-uri", terms: "Termeni", gdpr: "GDPR" },
    blog: { eyebrow: "Jurnalul Insulei", title: "Blog Thassos", subtitle: "Ghiduri, rute și povești din Aegean.", back: "Toate articolele", backHome: "Înapoi acasă" },
    reviews: { allReviews: "Toate recenziile" },
    seo: { siteName: "Rent A Boat Villy", description: "Închirieri bărci de lux în Thassos, Grecia. Chartere private, golfuri secrete, croaziere la apus." }
  },
  el: {
    nav: { faq: "Συχνές Ερωτήσεις" },
    hero: { scroll: "Κύλιση για εξερεύνηση" },
    fleet: { subtitle: "Από ελαφρά σκάφη έως πολυτελείς κρουαζιέρες — ο τέλειος σύντροφος στο Αιγαίο.", stat1: "5+ Σκάφη", stat2: "Από 15€/ώρα", stat3: "Χωρίς άδεια ≤30HP" },
    map: { subtitle: "Δωρεάν διαδραστικός χάρτης με OpenStreetMap. Πατήστε τους δείκτες για λεπτομέρειες." },
    experiences: {
      subtitle: "Ηλιοβασιλεμένες περιπέτειες για ζευγάρια, οικογένειες και γιορτές.",
      items: [
        { title: "Κρουαζιέρες Ηλιοβασιλέματος", desc: "Η χρυσή ώρα στο Αιγαίο — σαμπάνια προαιρετικά, αναμνήσεις εγγυημένες." },
        { title: "Εκδρομές σε Λιμνοθάλασσες", desc: "Μυστικά κολπάκια που γνωρίζουν μόνο οι ντόπιοι. Διαδρομές GPS συμπεριλαμβάνονται." },
        { title: "Ολοήμερες Κρατήσεις", desc: "Από την αυγή μέχρι το σούρουπο — εξερευνήστε όλη την ακτογραμμή της Θάσου." },
        { title: "Ταξίδια Γιορτής", desc: "Γενέθλια, προτάσεις γάμου, reunions — ετοιμάζουμε τη σκηνή." }
      ]
    },
    booking: {
      expectTitle: "Τι να περιμένετε", expect1: "Email επιβεβαίωσης εντός 1 ώρας.", expect2: "Φέρτε ταυτότητα ή διαβατήριο.", expect3: "30% προκαταβολή. Υπόλοιπο στη Μαρίνα Λιμενάρια.",
      successTitle: "Αίτημα ελήφθη", successDesc: "Θα επιβεβαιώσουμε σύντομα. Ελέγξτε το email σας.", successAgain: "Νέα κράτηση", submit: "Υποβολή κράτησης", submitting: "Υποβολή...",
      form: { fullName: "Ονοματεπώνυμο", email: "Email", phone: "Τηλέφωνο", idNumber: "Ταυτότητα / Διαβατήριο", date: "Ημερομηνία", time: "Ώρα", vessel: "Σκάφος", route: "Διαδρομή", guests: "Επισκέπτες", notes: "Ειδικές αιτήσεις", selectBoat: "Επιλέξτε σκάφος", selectRoute: "Επιλέξτε διαδρομή", guestCount: "επισκέπτης", guestCountPlural: "επισκέπτες" }
    },
    faq: {
      subtitle: "Όλα όσα χρειάζεστε πριν αποπλεύσετε.",
      items: [
        { q: "Χρειάζομαι άδεια σκάφους;", a: "Για σκάφη έως 30HP, δεν απαιτείται. Παρέχουμε ενημέρωση ασφαλείας πριν από κάθε αναχώρηση." },
        { q: "Το καύσιμο περιλαμβάνεται;", a: "Ναι. Όλες οι ωριαίες τιμές περιλαμβάνουν καύσιμο για τυπική πλεύση γύρω από τη Θάσο." },
        { q: "Τι γίνεται αν ο καιρός είναι κακός;", a: "Επαναπρογραμματίζουμε χωρίς κόστος ή προσφέρουμε πλήρη επιστροφή." },
        { q: "Απαιτείται προκαταβολή;", a: "30% προκαταβολή εξασφαλίζει την κράτηση. Υπόλοιπο στη Μαρίνα Λιμενάρια." },
        { q: "Από πού αναχωρούμε;", a: "Όλες οι κρατήσεις αναχωρούν από τη Μαρίνα Λιμενάρια. GPS αποστέλλεται με την επιβεβαίωση." }
      ]
    },
    cookies: { title: "Σεβόμαστε την ιδιωτικότητά σας", desc: "Τα απαραίτητα cookies διατηρούν τη λειτουργία του site. Αναλυτικά και marketing είναι προαιρετικά.", policy: "Πολιτική Cookies", acceptAll: "Αποδοχή όλων", reject: "Μόνο απαραίτητα", customize: "Προσαρμογή", settingsTitle: "Προτιμήσεις Cookies", necessary: "Απαραίτητα", necessaryDesc: "Απαιτούνται για τη λειτουργία", alwaysOn: "Πάντα ενεργά", analytics: "Αναλυτικά", analyticsDesc: "Ανώνυμα στατιστικά", marketing: "Marketing", marketingDesc: "Remarketing", save: "Αποθήκευση", footerSettings: "Ρυθμίσεις Cookie" },
    footer: { tagline: "Αποδράσεις στο Αιγαίο · Θάσος, Ελλάδα", fleet: "Στόλος", map: "Χάρτης", guide: "Οδηγός", reviews: "Κριτικές", book: "Κράτηση", blog: "Blog", privacy: "Απόρρητο", cookies: "Cookies", terms: "Όροι", gdpr: "GDPR" },
    blog: { eyebrow: "Ημερολόγιο Νησιού", title: "Blog Θάσου", subtitle: "Οδηγοί, διαδρομές και ιστορίες από το Αιγαίο.", back: "Όλα τα άρθρα", backHome: "Αρχική" },
    reviews: { allReviews: "Όλες οι κριτικές" },
    seo: { siteName: "Rent A Boat Villy", description: "Ενοικιάσεις σκαφών πολυτελείας στη Θάσο. Ιδιωτικές κρουαζιέρες και μυστικά κολπάκια." }
  },
  de: {
    nav: { faq: "FAQ" },
    hero: { scroll: "Scrollen zum Entdecken" },
    fleet: { subtitle: "Kleine Speedboote & Tageskreuzer ab Limenaria — Ihr Begleiter auf der Ägäis.", stat1: "5+ Boote", stat2: "Ab 15€/Std", stat3: "Kein Führerschein ≤30PS" },
    map: { subtitle: "Kostenlose interaktive Karte mit OpenStreetMap. Marker für Details antippen." },
    experiences: {
      subtitle: "Sonnendurchflutete Abenteuer für Paare, Familien und Feiern.",
      items: [
        { title: "Sonnenuntergangsfahrten", desc: "Goldene Stunde auf der Ägäis — Champagner optional, Erinnerungen garantiert." },
        { title: "Lagunen-Hopping", desc: "Geheime Buchten nur für Einheimische. GPS-Routen inklusive." },
        { title: "Ganztages-Charter", desc: "Von der Morgendämmerung bis zum Abend — die gesamte Küste Thassos erkunden." },
        { title: "Feierfahrten", desc: "Geburtstage, Heiratsanträge, Wiedersehen — wir schaffen die Szenerie." }
      ]
    },
    booking: {
      expectTitle: "Was Sie erwartet", expect1: "Bestätigungs-E-Mail innerhalb 1 Stunde.", expect2: "Ausweis oder Reisepass mitbringen.", expect3: "30% Anzahlung. Rest in Marina Limenaria.",
      successTitle: "Anfrage erhalten", successDesc: "Wir bestätigen Ihren Charter in Kürze.", successAgain: "Weitere Buchung", submit: "Buchung absenden", submitting: "Wird gesendet...",
      form: { fullName: "Vollständiger Name", email: "E-Mail", phone: "Telefon", idNumber: "Ausweis / Reisepass", date: "Datum", time: "Uhrzeit", vessel: "Boot", route: "Route", guests: "Gäste", notes: "Besondere Wünsche", selectBoat: "Boot wählen", selectRoute: "Route wählen", guestCount: "Gast", guestCountPlural: "Gäste" }
    },
    faq: {
      subtitle: "Alles vor dem Ablegen.",
      items: [
        { q: "Brauche ich einen Bootsführerschein?", a: "Für Boote bis 30 PS nicht erforderlich. Sicherheitsbriefing vor jeder Abfahrt." },
        { q: "Ist Treibstoff inklusive?", a: "Ja. Alle Stundensätze beinhalten Treibstoff für Standardfahrten um Thassos." },
        { q: "Was bei schlechtem Wetter?", a: "Kostenlose Umbuchung oder volle Rückerstattung bei unsicheren Bedingungen." },
        { q: "Ist eine Anzahlung nötig?", a: "30% Anzahlung sichert Ihren Termin. Rest in Marina Limenaria." },
        { q: "Wo starten wir?", a: "Alle Charter starten in Marina Limenaria. GPS nach Bestätigung." }
      ]
    },
    cookies: { title: "Wir schützen Ihre Privatsphäre", desc: "Notwendige Cookies halten die Seite am Laufen. Analyse und Marketing optional.", policy: "Cookie-Richtlinie", acceptAll: "Alle akzeptieren", reject: "Nur essenziell", customize: "Anpassen", settingsTitle: "Cookie-Einstellungen", necessary: "Notwendig", necessaryDesc: "Für die Funktion erforderlich", alwaysOn: "Immer aktiv", analytics: "Analyse", analyticsDesc: "Anonyme Statistiken", marketing: "Marketing", marketingDesc: "Remarketing", save: "Speichern", footerSettings: "Cookie-Einstellungen" },
    footer: { tagline: "Ägäis-Abenteuer · Thassos, Griechenland", fleet: "Flotte", map: "Karte", guide: "Guide", reviews: "Bewertungen", book: "Buchen", blog: "Blog", privacy: "Datenschutz", cookies: "Cookies", terms: "AGB", gdpr: "DSGVO" },
    blog: { eyebrow: "Inseljournal", title: "Thassos Blog", subtitle: "Guides, Routen und Geschichten aus der Ägäis.", back: "Alle Artikel", backHome: "Zur Startseite" },
    reviews: { allReviews: "Alle Bewertungen" },
    seo: { siteName: "Rent A Boat Villy", description: "Luxus-Bootsverleih auf Thassos. Private Charter, geheime Buchten, Sonnenuntergangsfahrten." }
  },
  sr: {
    nav: { faq: "Pitanja" },
    hero: { scroll: "Skroluj za istraživanje" },
    fleet: { subtitle: "Od agilnih čamaca do luksuznih jahti — savršen saputnik na Egeju.", stat1: "5+ Plovila", stat2: "Od 15€/h", stat3: "Bez dozvole ≤30KS" },
    map: { subtitle: "Besplatna interaktivna mapa sa OpenStreetMap. Dodirnite markere za detalje." },
    experiences: {
      subtitle: "Sunčane avanture za parove, porodice i proslave.",
      items: [
        { title: "Krstarenja pri Zalasku", desc: "Zlatni sat na Egeju — šampanjac opciono, uspomene zagarantovane." },
        { title: "Lagune i Uvale", desc: "Tajne uvale koje znaju samo lokalci. GPS rute uključene." },
        { title: "Celodnevni Charter", desc: "Od zore do sumraka — istražite celu obalu Tasosa." },
        { title: "Proslave na Moru", desc: "Rođendani, prosidbe, okupljanja — mi pripremamo scenu." }
      ]
    },
    booking: {
      expectTitle: "Šta očekivati", expect1: "Email potvrde u roku od 1 sata.", expect2: "Ponesite ličnu kartu ili pasoš.", expect3: "30% depozit. Ostatak u marini Limenaria.",
      successTitle: "Zahtev primljen", successDesc: "Uskoro potvrđujemo charter. Proverite email.", successAgain: "Nova rezervacija", submit: "Pošalji rezervaciju", submitting: "Šalje se...",
      form: { fullName: "Ime i prezime", email: "Email", phone: "Telefon", idNumber: "Lična karta / Pasoš", date: "Datum", time: "Vreme", vessel: "Plovilo", route: "Ruta", guests: "Gosti", notes: "Posebni zahtevi", selectBoat: "Izaberi plovilo", selectRoute: "Izaberi rutu", guestCount: "gost", guestCountPlural: "gosti" }
    },
    faq: {
      subtitle: "Sve pre polaska na more.",
      items: [
        { q: "Da li mi treba dozvola za brod?", a: "Za plovila do 30KS nije potrebna. Bezbednosni brifing pre svakog polaska." },
        { q: "Da li je gorivo uključeno?", a: "Da. Sve satne cene uključuju gorivo za standardno krstarenje oko Tasosa." },
        { q: "Šta ako je loše vreme?", a: "Besplatno premeštanje termina ili pun povraćaj novca." },
        { q: "Da li je potreban depozit?", a: "30% depozit osigurava termin. Ostatak u marini Limenaria." },
        { q: "Odakle polazimo?", a: "Svi charteri polaze iz marine Limenaria. GPS se šalje po potvrdi." }
      ]
    },
    cookies: { title: "Cenimo vašu privatnost", desc: "Neophodni kolačići održavaju sajt. Analitika i marketing su opcioni.", policy: "Politika Kolačića", acceptAll: "Prihvati sve", reject: "Samo neophodno", customize: "Prilagodi", settingsTitle: "Podešavanja Kolačića", necessary: "Neophodni", necessaryDesc: "Potrebni za rad sajta", alwaysOn: "Uvek uključeno", analytics: "Analitika", analyticsDesc: "Anonimna statistika", marketing: "Marketing", marketingDesc: "Remarketing", save: "Sačuvaj", footerSettings: "Podešavanja kolačića" },
    footer: { tagline: "Egejske avanture · Tasos, Grčka", fleet: "Flota", map: "Mapa", guide: "Vodič", reviews: "Recenzije", book: "Rezerviši", blog: "Blog", privacy: "Privatnost", cookies: "Kolačići", terms: "Uslovi", gdpr: "GDPR" },
    blog: { eyebrow: "Dnevnik Ostrva", title: "Tasos Blog", subtitle: "Vodiči, rute i priče sa Egeja.", back: "Svi članci", backHome: "Početna" },
    reviews: { allReviews: "Sve recenzije" },
    seo: { siteName: "Rent A Boat Villy", description: "Luksuzni iznajmljivanje brodova na Tasosu. Privatni charteri i tajne uvale." }
  },
  bg: {
    nav: { faq: "Въпроси" },
    hero: { scroll: "Превъртете за откриване" },
    fleet: { subtitle: "Малки моторни лодки и дневни круизери от Лименария — перфектният спътник в Егейско море.", stat1: "5+ Съдове", stat2: "От 15€/ч", stat3: "Без лиценз ≤30к.с." },
    map: { subtitle: "Безплатна интерактивна карта с OpenStreetMap. Докоснете маркерите за детайли." },
    experiences: {
      subtitle: "Слънчеви приключения за двойки, семейства и празници.",
      items: [
        { title: "Круизи при Залез", desc: "Златният час в Егейско море — шампанско по желание, спомени гарантирани." },
        { title: "Лагуни и Заливи", desc: "Тайни заливи, познати само на местните. GPS маршрути включени." },
        { title: "Целодневен Чартър", desc: "От зора до залез — изследвайте целия бряг на Тасос." },
        { title: "Празнични Пътувания", desc: "Рождени дни, предложения, срещи — ние подготвяме сцената." }
      ]
    },
    booking: {
      expectTitle: "Какво да очаквате", expect1: "Имейл за потвърждение в рамките на 1 час.", expect2: "Носете лична карта или паспорт.", expect3: "30% депозит. Остатък в марината Лименария.",
      successTitle: "Заявката е получена", successDesc: "Ще потвърдим чартъра скоро. Проверете имейла.", successAgain: "Нова резервация", submit: "Изпрати резервация", submitting: "Изпращане...",
      form: { fullName: "Пълно име", email: "Имейл", phone: "Телефон", idNumber: "ЛК / Паспорт", date: "Дата", time: "Час", vessel: "Съд", route: "Маршрут", guests: "Гости", notes: "Специални искания", selectBoat: "Избери лодка", selectRoute: "Избери маршрут", guestCount: "гост", guestCountPlural: "гости" }
    },
    faq: {
      subtitle: "Всичко преди да отплавате.",
      items: [
        { q: "Нужен ли е капитански лиценз?", a: "За съдове до 30к.с. не е необходим. Безопасностен брифинг преди всяко отплаване." },
        { q: "Включено ли е горивото?", a: "Да. Всички почасови тарифи включват гориво за стандартно плаване около Тасос." },
        { q: "Какво при лошо време?", a: "Пренасрочване без такса или пълно възстановяване при опасни условия." },
        { q: "Нужен ли е депозит?", a: "30% депозит гарантира резервацията. Остатък в марината Лименария." },
        { q: "Откъде тръгваме?", a: "Всички чартъри тръгват от марината Лименария. GPS при потвърждение." }
      ]
    },
    cookies: { title: "Ценим вашата поверителност", desc: "Необходимите бисквитки поддържат сайта. Аналитика и маркетинг са по избор.", policy: "Политика за Бисквитки", acceptAll: "Приеми всички", reject: "Само необходими", customize: "Персонализирай", settingsTitle: "Настройки Бисквитки", necessary: "Необходими", necessaryDesc: "Задължителни за функция", alwaysOn: "Винаги активни", analytics: "Аналитика", analyticsDesc: "Анонимна статистика", marketing: "Маркетинг", marketingDesc: "Ремаркетинг", save: "Запази", footerSettings: "Настройки бисквитки" },
    footer: { tagline: "Егейски бягства · Тасос, Гърция", fleet: "Флота", map: "Карта", guide: "Гид", reviews: "Отзиви", book: "Резервация", blog: "Блог", privacy: "Поверителност", cookies: "Бисквитки", terms: "Условия", gdpr: "GDPR" },
    blog: { eyebrow: "Дневник на Острова", title: "Блог Тасос", subtitle: "Гидове, маршрути и истории от Егейско море.", back: "Всички статии", backHome: "Начало" },
    reviews: { allReviews: "Всички отзиви" },
    seo: { siteName: "Rent A Boat Villy", description: "Луксозни наеми на лодки в Тасос. Частни чартъри, тайни заливи, круизи при залез." }
  }
};

for (const lang of ["ro", "el", "de", "sr", "bg"]) {
  const existing = JSON.parse(readFileSync(join(dir, `${lang}.json`), "utf-8"));
  const merged = deepMerge(deepMerge(en, existing), shared[lang]);
  writeFileSync(join(dir, `${lang}.json`), JSON.stringify(merged, null, 2) + "\n");
  console.log(`Updated ${lang}.json`);
}
