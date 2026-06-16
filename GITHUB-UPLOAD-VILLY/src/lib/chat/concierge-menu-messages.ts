import type { Locale } from "@/lib/i18n";

export const TIME_GREETINGS: Record<
  Locale,
  { morning: string; afternoon: string; evening: string }
> = {
  en: {
    morning: "Good morning!",
    afternoon: "Good afternoon!",
    evening: "Good evening!",
  },
  el: {
    morning: "Καλημέρα.",
    afternoon: "Καλό απόγευμα.",
    evening: "Καλησπέρα.",
  },
  de: {
    morning: "Guten Morgen!",
    afternoon: "Guten Tag!",
    evening: "Guten Abend!",
  },
  ro: {
    morning: "Bună dimineața!",
    afternoon: "Bună ziua!",
    evening: "Bună seara!",
  },
  sr: {
    morning: "Dobro jutro!",
    afternoon: "Dobar dan!",
    evening: "Dobro veče!",
  },
  bg: {
    morning: "Добро утро!",
    afternoon: "Добър ден!",
    evening: "Добър вечер!",
  },
};

type MenuNodeMessages = Partial<
  Record<
    | "start"
    | "booking"
    | "fleet"
    | "group"
    | "directions"
    | "fuel"
    | "amenities"
    | "rates"
    | "contact"
    | "book-cta"
    | "fleet-cta",
    readonly string[]
  >
>;

export const MENU_MESSAGE_VARIANTS: Record<Locale, MenuNodeMessages> = {
  en: {
    start: [
      "I am Villy from Rent A Boat Villy at New Port of Limenaria. We operate eight self-drive boats — please choose a topic below or type your question.",
      "Welcome. I am Villy, your marina assistant at New Port of Limenaria. I can help with fleet details, availability, fuel policy, and directions.",
      "Thank you for contacting Rent A Boat Villy. I am here to help you plan your day on the water.",
    ],
    booking: [
      "To request availability, please share your preferred date, guest count, and rental hours. We will check the fleet and contact you by phone or email. No online payment is required.",
      "When you are ready to book, send your date and party size through the booking form. Our team will confirm availability and follow up with you directly.",
      "Booking is a simple request form. We review availability and contact you once we have matched a suitable boat.",
    ],
    fleet: [
      "Our fleet of eight self-drive boats from New Port of Limenaria includes Kima (9 seats), Nikos, Nikoleta and Ag. Nikolaos (8 seats), and Niki, Poseidon, Ektoras and Basilios (7 seats). A safety briefing is included; no licence is required up to 30HP.",
      "All eight boats depart from New Port of Limenaria with a sun tent, Bluetooth speaker, icebox, anchor, and life jackets as standard equipment.",
      "You may browse photos, capacity, and specifications for each boat on our fleet page.",
    ],
    group: [
      "Please let us know your group size — Kima accommodates up to 9 guests, our 8-seat boats suit medium groups, and our 7-seat boats are ideal for smaller parties.",
      "For the most suitable match, share your guest count in the booking request and we will recommend the appropriate boat.",
      "We would be happy to suggest a boat once we know how many guests will be on board.",
    ],
    directions: [
      "New Port of Limenaria is on the south coast of Thassos, with free parking nearby. GPS coordinates and berth details are sent with your booking confirmation. We are open daily 08:00–20:00 in season.",
      "You will find us at New Port of Limenaria. Parking is available close to the marina, and we can assist with directions by phone if needed.",
      "All boats depart from our Limenaria base. Please call +30 698 131 8393 if you would like directions before you travel.",
    ],
    fuel: [
      "Fuel is not included in the rental rate and is charged separately according to your trip. We explain typical consumption during check-in.",
      "Fuel is billed in addition to the rental fee. The boat is prepared before departure and usage is settled on return.",
      "The rental price does not include fuel. Our team will walk you through typical usage at the marina before departure.",
    ],
    amenities: [
      "Every boat includes a sun tent, Bluetooth speaker, icebox, anchor, and life jackets. A safety briefing is provided before departure. We recommend swimwear, sunscreen, water, and light snacks.",
      "Standard equipment on all boats includes a sun tent, Bluetooth, icebox, anchor, and life jackets. Please bring swimwear, sun protection, and drinking water.",
      "Sun tent, Bluetooth, icebox, anchor, and life jackets are included on every boat, along with a full safety briefing at New Port of Limenaria.",
    ],
    rates: [
      "Rates are provided on request. Please call +30 698 131 8393 or visit our office at New Port of Limenaria.",
      "Pricing depends on boat and season. For July and August, we recommend contacting us early to secure availability.",
      "We would be pleased to provide a quote by phone or in person at New Port of Limenaria.",
    ],
    contact: [
      "Telephone: +30 698 131 8393 or +40 770 965 041 · Email: vilitrifonova245@gmail.com · New Port of Limenaria, south coast of Thassos · Open daily 08:00–20:00 in season.",
      "Our marina team is available daily in season from 08:00 to 20:00. You may reach us by phone, email, or in person at New Port of Limenaria.",
      "For direct assistance, please call +30 698 131 8393 or email vilitrifonova245@gmail.com.",
    ],
    "book-cta": [
      "Please use the booking form below to share your date, guest count, and preferred boat.",
      "Open the booking form with your date and group size, and our team will confirm availability by phone or email.",
    ],
    "fleet-cta": [
      "You may compare photos, capacity, and specifications for all eight boats on the fleet page.",
      "Browse Kima, Nikos, Nikoleta, Ag. Nikolaos, Niki, Poseidon, Ektoras, and Basilios on the fleet page.",
    ],
  },
  el: {
    start: [
      "Είμαι η Villy, η ψηφιακή βοηθός της Rent A Boat Villy στο Νέο Λιμάνι Λιμεναρίων. Διαθέτουμε οκτώ βάρκες με δική σας οδήγηση — παρακαλούμε επιλέξτε ένα θέμα ή στείλτε την ερώτησή σας.",
      "Καλώς ήρθατε. Είμαι η Villy, η βοηθός της μαρίνας στο Νέο Λιμάνι Λιμεναρίων. Μπορώ να σας ενημερώσω για στόλο, διαθεσιμότητα, καύσιμα και οδηγίες.",
      "Σας ευχαριστούμε που επικοινωνείτε με την Rent A Boat Villy. Παρακαλούμε επιλέξτε μια γρήγορη απάντηση ή περιγράψτε τις ανάγκες σας για την ενοικίαση.",
    ],
    booking: [
      "Για διαθεσιμότητα, στείλτε ημερομηνία, αριθμό ατόμων και ώρες ενοικίασης. Θα ελέγξουμε τον στόλο και θα επικοινωνήσουμε μαζί σας. Δεν απαιτείται online πληρωμή.",
      "Όταν είστε έτοιμοι, συμπληρώστε την ημερομηνία και τα άτομα στη φόρμα κράτησης. Η ομάδα μας θα επιβεβαιώσει τη διαθεσιμότητα.",
    ],
    fleet: [
      "8 βάρκες από τη Λιμενάρια: Kima (9), Nikos, Nikoleta & Ag. Nikolaos (8), Niki, Poseidon, Ektoras & Basilios (7). Ενημέρωση ασφαλείας. Χωρίς άδεια έως 30HP.",
      "Kima, Nikos, Nikoleta, Ag. Nikolaos, Niki, Poseidon, Ektoras, Basilios — τέντα, Bluetooth, ψυγείο, άγκυρα, σωσίβια σε κάθε βάρκα.",
    ],
    group: [
      "Παρακαλούμε ενημερώστε μας για τον αριθμό των ατόμων — το Kima χωρά έως 9, τα 8-θέσια για μεσαίες ομάδες, τα 7-θέσια για μικρότερες.",
      "Πόσα άτομα θα είστε; Θα σας προτείνουμε την κατάλληλη βάρκα στο αίτημα κράτησης.",
    ],
    directions: [
      "Το Νέο Λιμάνι Λιμεναρίων βρίσκεται στη νότια ακτή της Θάσου. Δωρεάν πάρκινγκ. Τα στοιχεία GPS αποστέλλονται με την επιβεβαίωση. 08:00–20:00.",
      "Βρείτε μας στη Λιμενάρια — δωρεάν πάρκινγκ κοντά. Καλέστε στο +30 698 131 8393 αν χρειάζεστε οδηγίες.",
    ],
    fuel: [
      "Τα καύσιμα δεν περιλαμβάνονται στο ναύλο και χρεώνονται ξεχωριστά. Εξηγούμε την τυπική κατανάλωση κατά την παραλαβή.",
      "Το καύσιμο χρεώνεται επιπλέον του ναύλου. Γεμίζουμε πριν την αναχώρηση και συμψηφίζουμε στην επιστροφή.",
    ],
    amenities: [
      "Κάθε βάρκα: τέντα, Bluetooth, ψυγείο, άγκυρα, σωσίβια. Ενημέρωση ασφαλείας. Φέρτε μαγιό, αντηλιακό, νερό.",
      "Σε όλες τις βάρκες: τέντα, Bluetooth, ψυγείο, άγκυρα, σωσίβια. Φέρτε μαγιό και αντηλιακό.",
    ],
    rates: [
      "Δεν δημοσιεύουμε τιμές online. Καλέστε +30 698 131 8393 ή επισκεφθείτε το γραφείο στη Λιμενάρια.",
      "Οι τιμές εξαρτώνται από βάρκα και season. Καλέστε ή περάστε από τη μαρίνα.",
    ],
    contact: [
      "Κλήση +30 698 131 8393 ή +40 770 965 041 ή vilitrifonova245@gmail.com. Νέο Λιμάνι Λιμεναρίων. 08:00–20:00.",
      "Ομάδα μαρίνας στη Λιμενάρια — τηλέφωνο, email ή επίσκεψη.",
    ],
    "book-cta": [
      "Παρακαλούμε χρησιμοποιήστε τη φόρμα κράτησης παρακάτω — ημερομηνία, αριθμός ατόμων και προτιμώμενη βάρκα.",
    ],
    "fleet-cta": [
      "Μπορείτε να συγκρίνετε φωτογραφίες και χωρητικότητα για τις οκτώ βάρκες στη σελίδα στόλου.",
    ],
  },
  de: {
    start: [
      "Ich bin Villy von Rent A Boat Villy im Neuen Hafen von Limenaria an Thassos' Südküste. Acht Boote ohne Skipper — wähle ein Thema.",
      "Guten Tag. Ich bin Villy von Rent A Boat Villy im Neuen Hafen von Limenaria. Wählen Sie ein Thema oder stellen Sie Ihre Frage.",
    ],
    booking: [
      "Sende eine Buchungsanfrage mit Datum, Gästezahl und Stunden. Wir prüfen Verfügbarkeit und melden uns — keine Online-Zahlung.",
      "Bereit zu buchen? Datum und Personenzahl reichen — wir rufen zurück.",
    ],
    fleet: [
      "8 Boote ab Limenaria: Kima (9), Nikos, Nikoleta & Ag. Nikolaos (8), Niki, Poseidon, Ektoras & Basilios (7). Sicherheitsbriefing inklusive — kein Führerschein bis 30 PS.",
      "Kima, Nikos, Nikoleta, Ag. Nikolaos, Niki, Poseidon, Ektoras, Basilios — Sonnenzelt, Bluetooth, Kühlbox, Anker, Schwimmwesten auf jedem Boot.",
    ],
    group: [
      "Nenne uns deine Gruppengröße — Kima für bis zu 9, 8-Sitzer für mittlere Gruppen, 7-Sitzer für kleinere.",
      "Wie viele seid ihr? Wir schlagen das passende Boot in deiner Anfrage vor.",
    ],
    directions: [
      "Neuer Hafen von Limenaria an Thassos' Südküste. Kostenlose Parkplätze. GPS nach Bestätigung. Täglich 08:00–20:00.",
      "Finde uns in Limenaria — Parkplätze in der Nähe. Ruf +30 698 131 8393 an, wenn du vorab Wegbeschreibung brauchst.",
    ],
    fuel: [
      "Treibstoff ist nicht inklusive — wird separat berechnet. Typischen Verbrauch erklären wir beim Check-in.",
      "Benzin kommt extra. Wir tanken vor Abfahrt und rechnen bei Rückkehr ab.",
    ],
    amenities: [
      "Jedes Boot: Sonnenzelt, Bluetooth, Kühlbox, Anker, Schwimmwesten. Sicherheitsbriefing vor Abfahrt — Badezeug, Sonnencreme, Wasser mitbringen.",
      "Standard an Bord: Sonnenzelt, Bluetooth, Kühlbox, Anker, Schwimmwesten.",
    ],
    rates: [
      "Preise veröffentlichen wir nicht online. Ruf +30 698 131 8393 an oder besuche unser Büro in Limenaria.",
      "Preise hängen von Boot und Saison ab — im Juli/August schnell ausgebucht.",
    ],
    contact: [
      "+30 698 131 8393 · +40 770 965 041 · vilitrifonova245@gmail.com · Neuer Hafen von Limenaria. 08:00–20:00.",
      "Team in Limenaria — Telefon, E-Mail oder vorbeikommen.",
    ],
    "book-cta": [
      "Tippe unten für das Buchungsformular — Datum, Gästezahl und bevorzugtes Boot.",
    ],
    "fleet-cta": [
      "Vergleiche Fotos und Kapazität aller 8 Boote auf der Flottenseite.",
    ],
  },
  ro: {
    start: [
      "Sunt Villy de la Rent A Boat Villy, Neuer Hafen von Limenaria, pe coasta de sud a Thassosului. Opt bărci fără skipper — alege un subiect.",
      "Bună ziua. Sunt Villy de la Rent A Boat Villy, Portul Nou Limenaria. Alegeți un subiect sau scrieți întrebarea dumneavoastră.",
    ],
    booking: [
      "Trimite o cerere cu data, numărul de oaspeți și orele preferate. Verificăm disponibilitatea și te contactăm — fără plată online.",
      "Gata de rezervare? Data și numărul de persoane — te sunăm înapoi.",
    ],
    fleet: [
      "8 bărci din Limenaria: Kima (9), Nikos, Nikoleta & Ag. Nikolaos (8), Niki, Poseidon, Ektoras & Basilios (7). Briefing de siguranță inclus — fără permis până la 30 CP.",
      "Kima, Nikos, Nikoleta, Ag. Nikolaos, Niki, Poseidon, Ektoras, Basilios — cort solar, Bluetooth, lada frigorifică, ancoră, veste pe fiecare barcă.",
    ],
    group: [
      "Spune-ne câți sunteți — Kima pentru 9, locurile de 8 pentru grupuri medii, 7 pentru echipe mici.",
      "Câți oaspeți? Îți sugerăm barca potrivită în cererea de rezervare.",
    ],
    directions: [
      "Neuer Hafen von Limenaria pe coasta de sud a Thassosului. Parcare gratuită. GPS la confirmare. 08:00–20:00.",
      "Ne găsești în Limenaria — parcare gratuită în apropiere. Sună +30 698 131 8393 dacă ai nevoie de indicații.",
    ],
    fuel: [
      "Combustibilul nu este inclus — se facturează separat. Explicăm consumul tipic la preluare.",
      "Benzina se plătește extra. Alimentăm înainte de plecare și reglăm la întoarcere.",
    ],
    amenities: [
      "Fiecare barcă: cort solar, Bluetooth, lada frigorifică, ancoră, veste de salvare. Briefing înainte de plecare — aduce costum de baie, cremă solară, apă.",
      "Standard pe toate bărcile: cort solar, Bluetooth, lada frigorifică, ancoră, veste.",
    ],
    rates: [
      "Nu publicăm prețuri online. Sună +30 698 131 8393 sau vizitează biroul din Neuer Hafen von Limenaria.",
      "Tarifele depind de barcă și sezon — săptămânile de vârf se ocupă repede.",
    ],
    contact: [
      "+30 698 131 8393 · +40 770 965 041 · vilitrifonova245@gmail.com · Neuer Hafen von Limenaria. 08:00–20:00.",
      "Echipa din Limenaria — telefon, email sau vizită.",
    ],
    "book-cta": [
      "Apasă mai jos pentru formularul de rezervare — dată, oaspeți și barca preferată.",
    ],
    "fleet-cta": [
      "Compară fotografiile și capacitatea celor 8 bărci pe pagina flotei.",
    ],
  },
  sr: {
    start: [
      "Ja sam Villy iz Rent A Boat Villy u marini Limenaria na južnoj obali Tasosa. Osam brodova bez skipera — izaberi temu.",
      "Dobar dan. Ja sam Villy iz Rent A Boat Villy u Novoj luci Limenarija. Izaberite temu ili unesite pitanje.",
    ],
    booking: [
      "Pošaljite zahtev sa datumom, brojem gostiju i satima. Proveravamo dostupnost i javljamo se — bez online plaćanja.",
      "Spremni za rezervaciju? Datum i broj osoba — javljamo se telefonom.",
    ],
    fleet: [
      "8 brodova iz Limenarije: Kima (9), Nikos, Nikoleta & Ag. Nikolaos (8), Niki, Poseidon, Ektoras & Basilios (7). Bezbednosni briefing uključen — bez dozvole do 30 KS.",
      "Kima, Nikos, Nikoleta, Ag. Nikolaos, Niki, Poseidon, Ektoras, Basilios — suncobran, Bluetooth, frižider, sidro, prsluci na svakom brodu.",
    ],
    group: [
      "Recite koliko vas je — Kima za 9, 8-sedi za srednje grupe, 7-sedi za manje.",
      "Koliko gostiju? Predložićemo pravi brod u zahtevu za rezervaciju.",
    ],
    directions: [
      "Neuer Hafen von Limenaria na južnoj obali Tasosa. Besplatan parking. GPS nakon potvrde. 08:00–20:00.",
      "Nađite nas u Limenariji — besplatan parking u blizini. Pozovite +30 698 131 8393 za uputstva.",
    ],
    fuel: [
      "Gorivo nije uključeno — naplaćuje se posebno. Objašnjavamo tipičnu potrošnju pri preuzimanju.",
      "Benzin se plaća dodatno. Sipamo pre polaska i obračunavamo po povratku.",
    ],
    amenities: [
      "Svaki brod: suncobran, Bluetooth, frižider, sidro, prsluci. Bezbednosni briefing pre polaska — ponesite kupaće, kremu i vodu.",
      "Standardno na svim brodovima: suncobran, Bluetooth, frižider, sidro, prsluci.",
    ],
    rates: [
      "Ne objavljujemo cene online. Pozovite +30 698 131 8393 ili posetite kancelariju u marini Limenaria.",
      "Cene zavise od broda i sezone — vrh sezone se brzo popuni.",
    ],
    contact: [
      "+30 698 131 8393 · +40 770 965 041 · vilitrifonova245@gmail.com · Neuer Hafen von Limenaria. 08:00–20:00.",
      "Tim u Limenariji — telefon, email ili poseta.",
    ],
    "book-cta": [
      "Dodirnite ispod za formular rezervacije — datum, gosti i željeni brod.",
    ],
    "fleet-cta": [
      "Uporedite fotografije i kapacitet svih 8 brodova na stranici flote.",
    ],
  },
  bg: {
    start: [
      "Аз съм Villy от Rent A Boat Villy в марина Лименария на южното крайбрежие на Тасос. Осем лодки без капитан — изберете тема.",
      "Добър ден. Аз съм Villy от Rent A Boat Villy в Новото пристанище Лименария. Изберете тема или задайте въпрос.",
    ],
    booking: [
      "Изпратете заявка с дата, брой гости и часове. Проверяваме наличност и се обаждаме — без онлайн плащане.",
      "Готови за резервация? Дата и брой хора — обратно обаждане от нас.",
    ],
    fleet: [
      "8 лодки от Лименария: Kima (9), Nikos, Nikoleta & Ag. Nikolaos (8), Niki, Poseidon, Ektoras & Basilios (7). Инструктаж за безопасност включен — без лиценз до 30 к.с.",
      "Kima, Nikos, Nikoleta, Ag. Nikolaos, Niki, Poseidon, Ektoras, Basilios — слънцезащитен tent, Bluetooth, хладилник, котва, спасителни жилетки на всяка лодка.",
    ],
    group: [
      "Кажете колко сте — Kima за 9, 8-местните за средни групи, 7-местните за по-малки.",
      "Колко гости? Ще предложим подходящата лодка в заявката за резервация.",
    ],
    directions: [
      "Марина Лименария на южното крайбрежие на Тасос. Безплатен паркинг. GPS при потвърждение. 08:00–20:00.",
      "Намерете ни в Лименария — безплатен паркинг наблизо. Обадете се на +30 698 131 8393 за указания.",
    ],
    fuel: [
      "Горивото не е включено — таксува се отделно. Обясняваме типичната консумация при получаване.",
      "Бензинът се плаща допълнително. Зареждаме преди отплаване и уреждаме при връщане.",
    ],
    amenities: [
      "Всяка лодка: слънцезащитен tent, Bluetooth, хладилник, котва, спасителни жилетки. Инструктаж преди отплаване — носете бански, крем и вода.",
      "Стандартно на всички лодки: tent, Bluetooth, хладилник, котва, спасителни жилетки.",
    ],
    rates: [
      "Не публикуваме цени онлайн. Обадете се на +30 698 131 8393 или посетете офиса в марина Лименария.",
      "Цените зависят от лодка и сезон — пиковите седмици се запълват бързо.",
    ],
    contact: [
      "+30 698 131 8393 · +40 770 965 041 · vilitrifonova245@gmail.com · Марина Лименария. 08:00–20:00.",
      "Екипът в Лименария — телефон, имейл или на място.",
    ],
    "book-cta": [
      "Докоснете по-долу за формуляра за резервация — дата, гости и предпочитана лодка.",
    ],
    "fleet-cta": [
      "Сравнете снимки и капацитет на всички 8 лодки на страницата на флота.",
    ],
  },
};
