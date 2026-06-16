import {
  buildConciergeContext,
  compactBoat,
  contactSnippet,
  extractPax,
  findBoatByName,
  formatFleetSummary,
  formatFullFleetLine,
  getBoatDetails,
  MARINA_HOURS,
  MARINA_NAME,
  MARINA_PHONE,
  matchFaq,
  recommendBoatForPax,
  spaciousBoat,
  type ConciergeContext,
  type LocalizedFaqEntry,
} from "@/lib/chat/concierge-context";
import {
  diversifySuggestions,
  pick,
  thinkingDelayMs,
} from "@/lib/chat/concierge-variety";
import type { Boat, FAQ } from "@/types";
import type { Locale } from "@/lib/i18n";

export { thinkingDelayMs };
export { TIME_GREETINGS, MENU_MESSAGE_VARIANTS } from "@/lib/chat/concierge-menu-messages";
export {
  buildConciergeContext,
  type ConciergeContext,
  type LocalizedFaqEntry,
} from "@/lib/chat/concierge-context";

const CONTACT_RATES = `Contact us for rates — call ${MARINA_PHONE} or visit our office at ${MARINA_NAME}.`;

export interface ConciergeReply {
  text: string;
  suggestions?: string[];
  link?: { href: string; label: string };
  links?: { href: string; label: string }[];
}

type BrainStrings = {
  greeting: string;
  fallback: string;
  book: string;
  pricing: string;
  beaches: string;
  fleet: string;
  licence: string;
  contact: string;
  thanks: string;
  suggestBook: string;
  suggestBeaches: string;
  suggestPricing: string;
  suggestFleet: string;
  suggestMap: string;
  suggestExperiences: string;
  suggestReviews: string;
  suggestMatch: string;
  linkBook: string;
  linkFleet: string;
  linkGuide: string;
  linkMap: string;
  linkExperiences: string;
  linkReviews: string;
  fuel: string;
  weather: string;
  deposit: string;
  pickup: string;
  bring: string;
  safety: string;
  season: string;
  recommend: string;
  cheapest: string;
  luxury: string;
  experiences: string;
  map: string;
  reviews: string;
  matchmaker: string;
};

type VariantPools = Partial<Record<keyof BrainStrings, readonly string[]>>;

const VARIANTS: Partial<Record<Locale, VariantPools>> = {
  en: {
    greeting: [
      "Hello. I am Villy, your assistant at Rent A Boat Villy, {marina}. I would be happy to help with our fleet, availability, fuel policy, or booking.",
      "Welcome to Rent A Boat Villy. I am Villy, based at {marina}. Please tell me your group size or what you would like to know.",
      "Good day. I am Villy from {marina}. Our fleet includes {fleetSample}. How may I assist you?",
    ],
    fallback: [
      "I can help with boat selection, availability, fuel policy, directions, and contact details. You may also choose one of the quick replies below.",
      "Please ask about our fleet, beaches, availability, fuel, or directions to {marina}. I am here to assist.",
    ],
    fleet: [
      "We operate {count} self-drive boats from {marina}: {fullFleet}. A safety briefing is included, and no licence is required up to 30HP.",
      "Fleet overview: {fleetSample}. Each boat includes a sun tent, Bluetooth speaker, icebox, anchor, and life jackets. Fuel is not included in the rental rate.",
    ],
    fuel: [
      "Fuel is not included in the rental rate and is charged separately according to your trip. We explain typical usage during check-in at {marina}.",
      "Fuel is billed in addition to the rental fee. The boat is prepared before departure and usage is settled on return.",
    ],
    safety: [
      "For everyone's safety, guests remain on board while the boat is in motion. Swimming is permitted only while anchored. A briefing and life jackets are provided at {marina}, daily {hours}.",
    ],
    pricing: [CONTACT_RATES, `Rates are available on request. ${CONTACT_RATES}`],
    book: [
      "To request availability, please share your date, hours, and group size. We will confirm by phone ({phone}) or email. No online payment is required.",
    ],
    contact: [
      `Telephone: ${MARINA_PHONE} or +40 770 965 041 · Email: vilitrifonova245@gmail.com · {marina}, daily {hours}.`,
    ],
    recommend: [
      "For {pax} guests, I would suggest {boat}, with up to {seats} seats. {desc}",
      "A suitable option for {pax} guests is {boat}. {desc}",
    ],
    cheapest: ["A compact and easy option is {boat} — well suited to a relaxed day from {marina}."],
    luxury: ["For additional deck space, {boat} accommodates up to {pax} guests and works well for a full day along the south coast."],
    beaches: [
      "Popular areas reachable from {marina} include Marble Beach, Tripiti caves, Metalia, Paradise Cove, and Aliki bay. For safety, swimming is permitted only while anchored.",
    ],
    thanks: ["You are most welcome. We remain available during marina hours at {marina} if you need further assistance."],
  },
  el: {
    greeting: [
      "Γεια σας. Είμαι η Villy, η βοηθός σας στη Rent A Boat Villy, {marina}. Μπορώ να σας ενημερώσω για στόλο, διαθεσιμότητα ή κράτηση.",
    ],
    fallback: [
      "Μπορώ να σας βοηθήσω με κρατήσεις, στόλο και επικοινωνία. Παρακαλούμε δοκιμάστε μία από τις γρήγορες απαντήσεις ή περιγράψτε την ερώτησή σας.",
    ],
    book: [
      "Για διαθεσιμότητα, στείλτε ημερομηνία, αριθμό ατόμων και ώρες. Ελέγχουμε τον στόλο και επικοινωνούμε ({phone}). Δεν απαιτείται online πληρωμή.",
    ],
    fleet: [
      "Διαθέτουμε {count} βάρκες με δική σας οδήγηση από {marina}: {fullFleet}. Ενημέρωση ασφαλείας, χωρίς άδεια έως 30HP.",
    ],
    fuel: [
      "Τα καύσιμα δεν περιλαμβάνονται στο ναύλο και χρεώνονται ξεχωριστά. Εξηγούμε την κατανάλωση κατά την παραλαβή στη {marina}.",
    ],
    safety: [
      "Για την ασφάλειά σας, παραμένετε στη βάρκα ενώ κινείται. Το κολύμπι επιτρέπεται μόνο ενώ αγκυροβολείτε. Ενημέρωση και σωσίβια στη {marina}, {hours}.",
    ],
  },
};

const PROMPT_POOLS: Record<Locale, string[]> = {
  en: [
    "Request availability",
    "Contact for rates",
    "Which boat for my group?",
    "Our fleet",
    "Fuel policy",
    "What's included?",
    "How to get to Limenaria",
    "Call us",
    "Safety rules",
    "No licence needed?",
  ],
  el: [
    "Διαθεσιμότητα",
    "Τιμές κατόπιν συνεννόησης",
    "Ποια βάρκα για την ομάδα μου;",
    "Στόλος",
    "Πολιτική καυσίμων",
    "Τι περιλαμβάνεται;",
    "Πώς φτάνω στη Λιμενάρια",
    "Κλήση",
    "Κανόνες ασφαλείας",
    "Χωρίς άδεια;",
  ],
  de: [
    "Verfügbarkeit anfragen",
    "Preise auf Anfrage",
    "Welches Boot für meine Gruppe?",
    "Unsere Flotte",
    "Treibstoffrichtlinie",
    "Was ist inklusive?",
    "Anfahrt Limenaria",
    "Anrufen",
    "Sicherheitsregeln",
    "Ohne Führerschein?",
  ],
  ro: [
    "Verifică disponibilitatea",
    "Tarife la cerere",
    "Ce barcă pentru grupul meu?",
    "Flota noastră",
    "Politica combustibil",
    "Ce este inclus?",
    "Cum ajung la Limenaria",
    "Sună-ne",
    "Reguli de siguranță",
    "Fără permis?",
  ],
  sr: [
    "Proveri dostupnost",
    "Cene na upit",
    "Koji brod za moju grupu?",
    "Naša flota",
    "Politika goriva",
    "Šta je uključeno?",
    "Kako do Limenarije",
    "Pozovi nas",
    "Pravila bezbednosti",
    "Bez dozvole?",
  ],
  bg: [
    "Провери наличност",
    "Цени при запитване",
    "Коя лодка за моята група?",
    "Нашият флот",
    "Политика за гориво",
    "Какво е включено?",
    "Как да стигна до Лименария",
    "Обади се",
    "Правила за безопасност",
    "Без лиценз?",
  ],
};

const STRINGS: Record<Locale, BrainStrings> = {
  en: {
    greeting:
      "Hello. I am Villy, your boat rental assistant at Rent A Boat Villy. I would be happy to help with boats, beaches, availability, and booking.",
    fallback:
      "I can assist with bookings, fleet selection, south-coast beaches, and marina contact. You may try “boat for 4 people” or “our fleet”.",
    book: "We operate {count} boats from {marina}. Please send a booking request and we will check availability before contacting you.",
    pricing: CONTACT_RATES,
    beaches: "Notable spots by boat include Paradise Cove, Marble Beach, and Aliki bay, with route guidance from {marina}.",
    fleet: "Our fleet of {count} boats: {list}. Specifications and photos are available on the fleet page.",
    licence: "No licence is required for boats up to 30HP. A safety briefing is provided at {marina} before every departure.",
    contact: `Please contact us at ${MARINA_PHONE} or vilitrifonova245@gmail.com. {marina}, daily {hours}.`,
    thanks: "You are most welcome. We wish you a pleasant day on the water.",
    suggestBook: "Request availability",
    suggestBeaches: "South-coast routes",
    suggestPricing: "Contact for rates",
    suggestFleet: "Our fleet",
    suggestMap: "How to find us",
    suggestExperiences: "What's included",
    suggestReviews: "Google reviews",
    suggestMatch: "Which boat for my group?",
    linkBook: "Open booking",
    linkFleet: "Browse fleet",
    linkGuide: "Island guide",
    linkMap: "View map",
    linkExperiences: "What's included",
    linkReviews: "Google reviews",
    fuel: "Fuel is not included in the rental rate and is charged separately. We explain typical usage during check-in.",
    weather: "If conditions are unsafe, we will reschedule at no cost or offer a full refund. Morning departures are usually the calmest in summer.",
    deposit: "No online payment is required — please send your details and we will confirm by phone. Payment is made at {marina}.",
    pickup: "All boats depart from {marina}. GPS and parking information is sent with your booking confirmation.",
    bring: "We recommend swimwear, sunscreen, and a hat. Life jackets, cooler space, and a safety briefing are provided.",
    safety:
      "For everyone's safety, guests remain on board while the boat is in motion. Swimming is permitted only while anchored. A briefing and life jackets are provided at {marina}.",
    season: "The main season runs from June to September. Early booking is recommended for July and August.",
    recommend: "For {pax} guests, I would suggest {boat}, with up to {seats} seats. {desc}",
    cheapest: "A practical option is {boat} — well suited to a relaxed day from {marina}.",
    luxury: "For additional space at sea, {boat} accommodates {pax} guests comfortably.",
    experiences: "Every boat includes a sun tent, Bluetooth speaker, icebox, anchor, and life jackets.",
    map: "Our interactive map shows coves and suggested routes from {marina}.",
    reviews: "Guest reviews are available on Google under Rent A Boat Villy, New Port of Limenaria.",
    matchmaker: "Please share your group size and we will recommend the most suitable boat from our fleet of {count}. You may also call {phone}.",
  },
  el: {
    greeting: "Γεια σας. Είμαι η Villy, η βοηθός σας στη Rent A Boat Villy, {marina}. Μπορώ να σας ενημερώσω για στόλο, διαθεσιμότητα ή κράτηση.",
    fallback: "Μπορώ να σας βοηθήσω με κρατήσεις, στόλο και επικοινωνία. Παρακαλούμε δοκιμάστε μία από τις γρήγορες απαντήσεις ή περιγράψτε την ερώτησή σας.",
    book: "{count} βάρκες στη {marina}. Στείλτε αίτημα — ελέγχουμε διαθεσιμότητα και επικοινωνούμε.",
    pricing: `Επικοινωνήστε για τιμές — ${MARINA_PHONE}, {marina}.`,
    beaches: "Marble Beach, Paradise Cove, Αλυκή — GPS διαδρομές από {marina}.",
    fleet: "Στόλος ({count} βάρκες): {list}.",
    licence: "Χωρίς άδεια έως 30HP. Ενημέρωση ασφαλείας στη {marina}.",
    contact: `${MARINA_PHONE} · vilitrifonova245@gmail.com · {marina}, {hours}.`,
    thanks: "Στη διάθεσή σας. Σας ευχόμαστε μια όμορφη ημέρα στη θάλασσα.",
    suggestBook: "Κράτηση",
    suggestBeaches: "Παραλίες",
    suggestPricing: "Επικοινωνία για τιμές",
    suggestFleet: "Στόλος",
    suggestMap: "Χάρτης",
    suggestExperiences: "Εμπειρίες",
    suggestReviews: "Κριτικές",
    suggestMatch: "Βρες βάρκα",
    linkBook: "Κράτηση",
    linkFleet: "Στόλος",
    linkGuide: "Οδηγός",
    linkMap: "Χάρτης",
    linkExperiences: "Εμπειρίες",
    linkReviews: "Κριτικές",
    fuel: "Τα καύσιμα δεν περιλαμβάνονται στο ναύλο και χρεώνονται ξεχωριστά.",
    weather: "Αν οι συνθήκες δεν είναι ασφαλείς, επαναπρογραμματίζουμε δωρεάν.",
    deposit: "Χωρίς online πληρωμή — επιβεβαίωση τηλεφωνικά.",
    pickup: "Αναχώρηση από {marina}. GPS με την επιβεβαίωση.",
    bring: "Μαγιό, αντηλιακό, καπέλο. Σωσίβια και ενημέρωση ασφαλείας.",
    safety: "Για την ασφάλειά σας, παραμένετε στη βάρκα ενώ κινείται. Το κολύμπι επιτρέπεται μόνο ενώ αγκυροβολείτε.",
    season: "Ιούνιος–Σεπτέμβριος ιδανικά.",
    recommend: "Για {pax} άτομα: {boat}, έως {seats} θέσεις. {desc}",
    cheapest: "Μικρότερη επιλογή: {boat}.",
    luxury: "Περισσότερος χώρος: {boat}, έως {pax} άτομα.",
    experiences: "Τέντα, Bluetooth, ψυγείο, άγκυρα, σωσίβια σε κάθε βάρκα.",
    map: "Διαδραστικός χάρτης με κρυφά κολπάκια.",
    reviews: "Κριτικές Google — Rent A Boat Villy Limenaria.",
    matchmaker: "Πες μας πόσα άτομα — θα προτείνουμε βάρκα από {count} σκάφη.",
  },
  ro: {
    greeting: "Bună ziua. Sunt Villy, asistentul dvs. pentru închirieri de bărci la Rent A Boat Villy. Vă pot ajuta cu bărci, plaje, disponibilitate și rezervări.",
    fallback: "Vă pot ajuta cu rezervări, flotă, plaje și contactul marinei. Puteți încerca „barcă pentru 4 persoane” sau „flota noastră”.",
    book: "Operăm {count} bărci din {marina}. Vă rugăm să trimiteți o cerere de rezervare și vom verifica disponibilitatea înainte de a vă contacta.",
    pricing: `Contactați pentru tarife — ${MARINA_PHONE}, {marina}.`,
    beaches: "Paradise Cove, Marble Beach, golf Aliki.",
    fleet: "Flota ({count}): {list}.",
    licence: "Fără licență până la 30CP.",
    contact: `${MARINA_PHONE} · {marina}, {hours}.`,
    thanks: "Cu plăcere. Vă dorim o zi plăcută pe apă.",
    suggestBook: "Rezervă",
    suggestBeaches: "Plaje",
    suggestPricing: "Contact pentru tarife",
    suggestFleet: "Flotă",
    suggestMap: "Hartă",
    suggestExperiences: "Experiențe",
    suggestReviews: "Recenzii",
    suggestMatch: "Găsește barca",
    linkBook: "Rezervare",
    linkFleet: "Flotă",
    linkGuide: "Ghid",
    linkMap: "Hartă",
    linkExperiences: "Experiențe",
    linkReviews: "Recenzii",
    fuel: "Combustibilul nu este inclus în tariful de închiriere și se facturează separat. Explicăm consumul tipic la predarea bărcii.",
    weather: "Reprogramăm gratuit dacă vremea este nefavorabilă.",
    deposit: "Nu este necesară plata online — vă confirmăm telefonic.",
    pickup: "Plecările au loc din {marina}. Coordonatele GPS sunt trimise cu confirmarea.",
    bring: "Recomandăm costum de baie și protecție solară. Veste de salvare și briefing de siguranță sunt incluse.",
    safety: "Pentru siguranța tuturor, oaspeții rămân la bord în timpul deplasării. Înotul este permis doar cu barca ancorată.",
    season: "Iunie–septembrie ideal.",
    recommend: "Pentru {pax} persoane: {boat}, {seats} locuri.",
    cheapest: "Opțiune compactă: {boat}.",
    luxury: "Cea mai spațioasă: {boat}, {pax} persoane.",
    experiences: "Cort solar, Bluetooth, lada frigorifică, ancoră, veste.",
    map: "Hartă interactivă cu golfuri secrete.",
    reviews: "Recenzii Google — Rent A Boat Villy.",
    matchmaker: "Spune-ne câți sunteți — {count} bărci disponibile.",
  },
  de: {
    greeting: "Guten Tag. Ich bin Villy, Ihre Assistentin für Bootsvermietung bei Rent A Boat Villy. Gerne helfe ich bei Booten, Stränden, Verfügbarkeit und Buchung.",
    fallback: "Ich kann bei Buchungen, Flotte, Stränden und Kontakt helfen. Sie können zum Beispiel „Boot für 4 Personen“ oder „unsere Flotte“ fragen.",
    book: "Wir betreiben {count} Boote ab {marina}. Bitte senden Sie eine Buchungsanfrage — wir prüfen die Verfügbarkeit und melden uns bei Ihnen.",
    pricing: `Preise auf Anfrage — ${MARINA_PHONE}.`,
    beaches: "Paradise Cove, Marble Beach, Aliki-Bucht.",
    fleet: "Flotte ({count}): {list}.",
    licence: "Kein Führerschein bis 30 PS.",
    contact: `${MARINA_PHONE} · {marina}, {hours}.`,
    thanks: "Gern geschehen. Wir wünschen Ihnen einen angenehmen Tag auf dem Wasser.",
    suggestBook: "Buchen",
    suggestBeaches: "Strände",
    suggestPricing: "Kontakt für Preise",
    suggestFleet: "Flotte",
    suggestMap: "Karte",
    suggestExperiences: "Erlebnisse",
    suggestReviews: "Bewertungen",
    suggestMatch: "Boot finden",
    linkBook: "Buchung",
    linkFleet: "Flotte",
    linkGuide: "Guide",
    linkMap: "Karte",
    linkExperiences: "Erlebnisse",
    linkReviews: "Bewertungen",
    fuel: "Treibstoff ist nicht im Mietpreis enthalten und wird separat berechnet. Den typischen Verbrauch erklären wir bei der Übergabe.",
    weather: "Bei unsicheren Bedingungen buchen wir kostenlos um oder erstatten vollständig.",
    deposit: "Eine Online-Zahlung ist nicht erforderlich — wir bestätigen telefonisch.",
    pickup: "Alle Boote starten ab {marina}. GPS und Parkinformationen erhalten Sie mit der Bestätigung.",
    bring: "Wir empfehlen Badekleidung und Sonnenschutz. Schwimmwesten und Sicherheitsbriefing sind inklusive.",
    safety: "Zu Ihrer Sicherheit bleiben Gäste während der Fahrt an Bord. Schwimmen ist nur bei verankertem Boot erlaubt.",
    season: "Juni–September am besten.",
    recommend: "Für {pax} Personen: {boat}, {seats} Plätze.",
    cheapest: "Kompakt: {boat}.",
    luxury: "Geräumig: {boat}, {pax} Personen.",
    experiences: "Sonnenzelt, Bluetooth, Kühlbox, Anker, Westen.",
    map: "Interaktive Karte mit Geheimbuchten.",
    reviews: "Google-Bewertungen — Rent A Boat Villy.",
    matchmaker: "Nenne uns deine Gruppengröße — {count} Boote.",
  },
  sr: {
    greeting: "Dobar dan. Ja sam Villy, vaš asistent za iznajmljivanje brodova u Rent A Boat Villy. Rado ću pomoći oko brodova, plaža, dostupnosti i rezervacija.",
    fallback: "Mogu da pomognem oko rezervacija, flote, plaža i kontakta marine. Možete pitati „brod za 4 osobe“ ili „naša flota“.",
    book: "Upravljamo {count} brodova iz {marina}. Molimo pošaljite zahtev za rezervaciju i proverićemo dostupnost pre nego što vas kontaktiramo.",
    pricing: `Cene na upit — ${MARINA_PHONE}.`,
    beaches: "Paradise Cove, Marble Beach, Aliki.",
    fleet: "Flota ({count}): {list}.",
    licence: "Bez dozvole do 30KS.",
    contact: `${MARINA_PHONE} · {marina}, {hours}.`,
    thanks: "Nema na čemu. Želimo vam prijatan dan na vodi.",
    suggestBook: "Rezervacija",
    suggestBeaches: "Plaže",
    suggestPricing: "Kontakt za cene",
    suggestFleet: "Flota",
    suggestMap: "Mapa",
    suggestExperiences: "Iskustva",
    suggestReviews: "Recenzije",
    suggestMatch: "Pronađi brod",
    linkBook: "Rezervacija",
    linkFleet: "Flota",
    linkGuide: "Vodič",
    linkMap: "Mapa",
    linkExperiences: "Iskustva",
    linkReviews: "Recenzije",
    fuel: "Gorivo nije uključeno u cenu iznajmljivanja i naplaćuje se posebno. Tipičnu potrošnju objašnjavamo pri predaji broda.",
    weather: "Besplatno pomeramo termin ako uslovi nisu bezbedni.",
    deposit: "Online plaćanje nije potrebno — potvrđujemo telefonom.",
    pickup: "Polasci su iz {marina}. GPS koordinate šaljemo uz potvrdu.",
    bring: "Preporučujemo kupaće i zaštitu od sunca. Prsluci i safety briefing su uključeni.",
    safety: "Radi bezbednosti svih, gosti ostaju na brodu tokom kretanja. Plivanje je dozvoljeno samo dok je brod na sidru.",
    season: "Jun–septembar najbolje.",
    recommend: "Za {pax} osoba: {boat}, {seats} mesta.",
    cheapest: "Kompaktan: {boat}.",
    luxury: "Najprostraniji: {boat}, {pax} osoba.",
    experiences: "Suncobran, Bluetooth, frižider, sidro, prsluci.",
    map: "Interaktivna mapa.",
    reviews: "Google recenzije.",
    matchmaker: "Recite koliko vas je — {count} brodova.",
  },
  bg: {
    greeting: "Здравейте. Аз съм Villy, вашият асистент за наем на лодки в Rent A Boat Villy. С удоволствие ще помогна с лодки, плажове, наличност и резервации.",
    fallback: "Мога да помогна с резервации, флот, плажове и контакт с марината. Можете да попитате „лодка за 4 души“ или „нашият флот“.",
    book: "Оперираме {count} лодки от {marina}. Моля, изпратете заявка за резервация и ще проверим наличността, преди да се свържем с вас.",
    pricing: `Цени при запитване — ${MARINA_PHONE}.`,
    beaches: "Paradise Cove, Marble Beach, Aliki.",
    fleet: "Флот ({count}): {list}.",
    licence: "Без лиценз до 30 к.с.",
    contact: `${MARINA_PHONE} · {marina}, {hours}.`,
    thanks: "Моля!",
    suggestBook: "Резервация",
    suggestBeaches: "Плажове",
    suggestPricing: "Контакт за цени",
    suggestFleet: "Флот",
    suggestMap: "Карта",
    suggestExperiences: "Преживявания",
    suggestReviews: "Отзиви",
    suggestMatch: "Намери лодка",
    linkBook: "Резервация",
    linkFleet: "Флот",
    linkGuide: "Гид",
    linkMap: "Карта",
    linkExperiences: "Преживявания",
    linkReviews: "Отзиви",
    fuel: "Горивото НЕ е включено.",
    weather: "Безплатно пренасрочване при лошо време.",
    deposit: "Без онлайн плащане.",
    pickup: "Тръгване от {marina}.",
    bring: "Бански, слънцезащита.",
    safety: "Гостите остават на борда — плуване само на котва.",
    season: "Юни–септември най-добре.",
    recommend: "За {pax} души: {boat}, {seats} места.",
    cheapest: "Компактен: {boat}.",
    luxury: "Най-просторен: {boat}, {pax} души.",
    experiences: "Tent, Bluetooth, хладилник, котва, жилетки.",
    map: "Интерактивна карта.",
    reviews: "Google отзиви.",
    matchmaker: "Кажете колко сте — {count} лодки.",
  },
};

function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function matches(input: string, patterns: RegExp[]) {
  return patterns.some((p) => p.test(input));
}

function baseVars(context: ConciergeContext): Record<string, string | number> {
  const { boats } = context;
  return {
    count: boats.length,
    marina: MARINA_NAME,
    hours: MARINA_HOURS,
    phone: MARINA_PHONE,
    fleetSample: formatFleetSummary(boats),
    fullFleet: formatFullFleetLine(boats),
  };
}

function variantText(
  locale: Locale,
  s: BrainStrings,
  key: keyof BrainStrings,
  vars?: Record<string, string | number>,
): string {
  const pool = VARIANTS[locale]?.[key] ?? VARIANTS.en?.[key];
  const raw = pool?.length ? pick(pool) : s[key];
  const text = typeof raw === "string" ? raw : String(raw);
  return vars ? fill(text, vars) : text;
}

function baseSuggestions(s: BrainStrings): string[] {
  return [s.suggestBook, s.suggestPricing, s.suggestFleet, s.suggestMatch, s.suggestExperiences];
}

function enrichReply(reply: ConciergeReply, locale: Locale, s: BrainStrings): ConciergeReply {
  const pool = [...baseSuggestions(s), ...(PROMPT_POOLS[locale] ?? PROMPT_POOLS.en)];
  return {
    ...reply,
    suggestions: diversifySuggestions(reply.suggestions ?? [], pool, 5),
  };
}

const DEFAULT_SUGGESTIONS = (s: BrainStrings) => [
  s.suggestBook,
  s.suggestFleet,
  s.suggestPricing,
  s.suggestMatch,
];

function faqLinks(id?: string): ConciergeReply["link"] | ConciergeReply["links"] | undefined {
  if (id === "pricing") return { href: "/booking", label: "Open booking" };
  if (id === "fuel" || id === "license") return { href: "/faq", label: "FAQ" };
  if (id === "marina") return { href: "/map", label: "View map" };
  return { href: "/faq", label: "More FAQ" };
}

export function getConciergeGreeting(locale: Locale, context: ConciergeContext): ConciergeReply {
  const s = STRINGS[locale] ?? STRINGS.en;
  const vars = baseVars(context);
  return enrichReply(
    {
      text: variantText(locale, s, "greeting", vars),
      suggestions: DEFAULT_SUGGESTIONS(s),
    },
    locale,
    s,
  );
}

export function getRotatingQuickPrompts(locale: Locale, limit = 8): string[] {
  const pool = [
    ...(PROMPT_POOLS[locale] ?? PROMPT_POOLS.en),
    ...baseSuggestions(STRINGS[locale] ?? STRINGS.en),
  ];
  return diversifySuggestions([], pool, limit);
}

export function respondToMessage(
  raw: string,
  locale: Locale,
  context: ConciergeContext,
): ConciergeReply {
  const input = raw.trim().toLowerCase();
  const s = STRINGS[locale] ?? STRINGS.en;
  const { boats } = context;
  const vars = baseVars(context);
  const fleetList = formatFleetSummary(boats);
  const wrap = (reply: ConciergeReply) => enrichReply(reply, locale, s);

  if (!input) {
    return wrap({ text: variantText(locale, s, "fallback", vars), suggestions: DEFAULT_SUGGESTIONS(s) });
  }

  const faqHit = matchFaq(raw, context);
  if (faqHit) {
    const linkMeta = faqLinks(faqHit.id);
    return wrap({
      text: faqHit.answer + ` ${contactSnippet()}`,
      suggestions: [s.suggestBook, s.suggestFleet, s.suggestPricing],
      ...(Array.isArray(linkMeta) ? { links: linkMeta } : linkMeta ? { link: linkMeta } : {}),
    });
  }

  const boat = findBoatByName(boats, input);
  if (boat) {
    return wrap({
      text: getBoatDetails(boat),
      suggestions: [s.suggestBook, s.suggestPricing, s.suggestFleet],
      link: { href: `/fleet/${boat.id}`, label: boat.name },
    });
  }

  const pax = extractPax(input);
  if (
    pax &&
    matches(input, [
      /for\s*\d|people|guests|family|group|άτομα|persoane|personen|osoba|души|couple|παρέα/i,
    ])
  ) {
    const [primary, alt] = recommendBoatForPax(boats, pax);
    const altLine = alt ? ` Also consider ${alt.name} (${alt.pax} seats).` : "";
    return wrap({
      text:
        variantText(locale, s, "recommend", {
          ...vars,
          pax,
          boat: primary.name,
          seats: primary.pax,
          desc: primary.tagline ?? primary.description.slice(0, 80),
        }) + altLine,
      suggestions: [s.suggestBook, s.suggestFleet, s.suggestPricing],
      link: { href: `/fleet/${primary.id}`, label: primary.name },
      links: alt
        ? [
            { href: `/fleet/${primary.id}`, label: primary.name },
            { href: `/fleet/${alt.id}`, label: alt.name },
          ]
        : undefined,
    });
  }

  if (matches(input, [/cheap|budget|affordable|φτην|ieftin|günstig|jeftin|евтин/i])) {
    const pickBoat = compactBoat(boats);
    return wrap({
      text: variantText(locale, s, "cheapest", { ...vars, boat: pickBoat.name }),
      suggestions: [s.suggestBook, s.suggestFleet, s.suggestPricing],
      link: { href: `/fleet/${pickBoat.id}`, label: pickBoat.name },
    });
  }

  if (matches(input, [/luxur|premium|best boat|vip|πολυτελ|luksuz|лукс/i])) {
    const pickBoat = spaciousBoat(boats);
    return wrap({
      text: variantText(locale, s, "luxury", { ...vars, boat: pickBoat.name, pax: pickBoat.pax }),
      suggestions: [s.suggestBook, s.suggestFleet, s.suggestExperiences],
      link: { href: `/fleet/${pickBoat.id}`, label: pickBoat.name },
    });
  }

  if (matches(input, [/availab|διαθεσιμ|disponib|verfüg|dostup|наличн|free today/i])) {
    return wrap({
      text: variantText(locale, s, "book", vars),
      suggestions: [s.suggestBook, s.suggestPricing, s.suggestFleet],
      link: { href: "/booking", label: s.linkBook },
    });
  }

  if (matches(input, [/tripiti|metalia|marble|golden|potos|paradise|αλυκ|μάρμαρο/i])) {
    return wrap({
      text: variantText(locale, s, "beaches", vars),
      suggestions: [s.suggestMap, s.suggestBook],
      links: [
        { href: "/map", label: s.linkMap },
        { href: "/guide", label: s.linkGuide },
      ],
    });
  }

  if (matches(input, [/fuel|gas|petrol|καύσι|combustibil|treibstoff|gorivo|гориво/i])) {
    return wrap({
      text: variantText(locale, s, "fuel", vars),
      suggestions: [s.suggestPricing, s.suggestBook, s.suggestFleet],
    });
  }

  if (matches(input, [/weather|rain|wind|cancel|storm|καιρ|vreme|wetter/i])) {
    return wrap({
      text: variantText(locale, s, "weather", vars),
      suggestions: [s.suggestBook, s.suggestFleet],
    });
  }

  if (matches(input, [/deposit|prepay|advance|προκαταβ|avans|anzahlung|depozit|депозит|payment online/i])) {
    return wrap({
      text: variantText(locale, s, "deposit", vars),
      suggestions: [s.suggestBook, s.suggestPricing],
    });
  }

  if (matches(input, [/pickup|pick up|marina|where.*meet|που.*παίρν|unde|abfahrt|polazak|direction|how.*get|parking/i])) {
    return wrap({
      text: variantText(locale, s, "pickup", vars),
      suggestions: [s.suggestBook, s.suggestMap],
      link: { href: "/map", label: s.linkMap },
    });
  }

  if (matches(input, [/bring|pack|wear|what.*need|τι.*φέρ|ce.*aduc|mitnehmen|poneti/i])) {
    return wrap({
      text: variantText(locale, s, "bring", vars),
      suggestions: [s.suggestBeaches, s.suggestBook],
    });
  }

  if (matches(input, [/safety|safe|rules|disembark|ashore|stay on board|life jacket|ασφαλ|sigur|sicher|bezbed|безопас/i])) {
    return wrap({
      text: variantText(locale, s, "safety", vars),
      suggestions: [s.suggestBook, s.suggestFleet],
      link: { href: "/guide", label: s.linkGuide },
    });
  }

  if (matches(input, [/when.*visit|best time|season|month|πότε|când|saison|sezona/i])) {
    return wrap({
      text: variantText(locale, s, "season", vars),
      suggestions: [s.suggestBook, s.suggestPricing],
    });
  }

  if (matches(input, [/experience|sunset|cruise|tour|εμπειρ|experien|erlebnis|iskustv/i])) {
    return wrap({
      text: variantText(locale, s, "experiences", vars),
      suggestions: [s.suggestBook, s.suggestMap],
      link: { href: "/experiences", label: s.linkExperiences },
    });
  }

  if (matches(input, [/map|route|gps|anchor|χάρτη|hartă|karte|mapa|карта/i])) {
    return wrap({
      text: variantText(locale, s, "map", vars),
      suggestions: [s.suggestBeaches, s.suggestMap],
      link: { href: "/map", label: s.linkMap },
    });
  }

  if (matches(input, [/review|rating|testimonial|κριτικ|recenz|bewertung|отзив/i])) {
    return wrap({
      text: variantText(locale, s, "reviews", vars),
      suggestions: [s.suggestBook, s.suggestReviews],
      link: { href: "/reviews", label: s.linkReviews },
    });
  }

  if (matches(input, [/match|recommend|which boat|help me choose|βρες|ποια βάρκα|găsește|find.*boat|group/i])) {
    return wrap({
      text: variantText(locale, s, "matchmaker", vars),
      suggestions: [s.suggestFleet, s.suggestBook, s.suggestMatch],
      link: { href: "/fleet", label: s.suggestMatch },
    });
  }

  if (matches(input, [/amenit|included|what.*include|icebox|bluetooth|tent|περιλαμβ|τι περιλαμβ/i])) {
    const sample = boats[0];
    const amenityList =
      sample?.amenities?.map((a) => a.label).join(", ") ??
      (locale === "el"
        ? "τέντα, Bluetooth, ψυγείο, άγκυρα, σωσίβια"
        : "sun tent, Bluetooth, icebox, anchor, life jackets");
    const template =
      locale === "el"
        ? "Κάθε βάρκα περιλαμβάνει: {amenities}. Ενημέρωση ασφαλείας στη {marina} πριν την αναχώρηση."
        : "Every boat includes: {amenities}. Safety briefing at {marina} before departure.";
    return wrap({
      text: fill(template, {
        ...vars,
        amenities: amenityList,
      }),
      suggestions: [s.suggestFleet, s.suggestBook],
      link: { href: "/fleet", label: s.linkFleet },
    });
  }

  if (matches(input, [/book|reserve|reserv|κρατ|rezerv|buchen|резерв|want a boat|rent a boat/i])) {
    return wrap({
      text: variantText(locale, s, "book", vars),
      suggestions: [s.suggestPricing, s.suggestFleet, s.suggestBook],
      link: { href: "/booking", label: s.linkBook },
    });
  }

  if (matches(input, [/price|pricing|cost|how much|€|eur|τιμ|pret|preis|цена|cena|tarif|preț/i])) {
    return wrap({
      text: variantText(locale, s, "pricing", vars),
      suggestions: [s.suggestBook, s.suggestFleet],
      link: { href: "/fleet", label: s.linkFleet },
    });
  }

  if (matches(input, [/beach|lagoon|cove|spot|παραλ|plaj|strand|plaž|плаж|where to go|where swim/i])) {
    return wrap({
      text: variantText(locale, s, "beaches", vars),
      suggestions: [s.suggestBook, s.suggestMap],
      links: [
        { href: "/guide", label: s.linkGuide },
        { href: "/map", label: s.linkMap },
      ],
    });
  }

  if (matches(input, [/fleet|boat|βάρκ|σκάφ|στόλ|στολ|barc|boot|brod|лодк/i])) {
    return wrap({
      text: variantText(locale, s, "fleet", { ...vars, list: fleetList }),
      suggestions: [s.suggestBook, s.suggestMatch, s.suggestFleet],
      link: { href: "/fleet", label: s.linkFleet },
    });
  }

  if (matches(input, [/licen|license|licence|δίπλω|führerschein|dozvol|30hp/i])) {
    return wrap({
      text: variantText(locale, s, "licence", vars),
      suggestions: [s.suggestFleet, s.suggestBook],
    });
  }

  if (matches(input, [/contact|phone|email|call|limenaria|τηλ|telefon|kontakt|hours|open|reach|κλήση/i])) {
    return wrap({
      text: variantText(locale, s, "contact", vars),
      suggestions: [s.suggestBook, s.suggestPricing],
    });
  }

  if (matches(input, [/thank|thanks|ευχαρι|mersi|danke|hvala|благодар/i])) {
    return wrap({
      text: variantText(locale, s, "thanks", vars),
      suggestions: [s.suggestBook, s.suggestFleet],
    });
  }

  if (matches(input, [/hi|hello|hey|γεια|salut|hallo|zdravo|здравей/i])) {
    return getConciergeGreeting(locale, context);
  }

  if (matches(input, [/faq|question|help/i])) {
    const firstFaq = context.faq[0];
    return wrap({
      text: firstFaq
        ? `${firstFaq.question} — ${firstFaq.answer.slice(0, 120)}…`
        : variantText(locale, s, "fallback", vars),
      suggestions: DEFAULT_SUGGESTIONS(s),
      link: { href: "/faq", label: "FAQ" },
    });
  }

  return wrap({
    text: variantText(locale, s, "fallback", vars),
    suggestions: DEFAULT_SUGGESTIONS(s),
  });
}

export function respondToSuggestion(
  suggestion: string,
  locale: Locale,
  context: ConciergeContext,
): ConciergeReply {
  return respondToMessage(suggestion, locale, context);
}

/** @deprecated Use ConciergeContext — kept for callers passing boats + faq separately */
export function respondToMessageLegacy(
  raw: string,
  locale: Locale,
  boats: Boat[],
  faq: FAQ[] = [],
  localizedFaq: LocalizedFaqEntry[] = [],
): ConciergeReply {
  return respondToMessage(raw, locale, buildConciergeContext(boats, faq, localizedFaq));
}
