#!/usr/bin/env node
/**
 * Fix incorrect geographic references placing Limenaria on the west coast.
 * Limenaria is on the SOUTH coast of Thassos.
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
  "data/boats.json",
  "data/blog/en.json",
  "data/blog/translations/el.json",
  "data/blog/translations/de.json",
  "data/blog/translations/ro.json",
  "data/blog/translations/bg.json",
  "data/blog/translations/sr.json",
  "scripts/new-blog-translations-data.mjs",
  "src/lib/chat/concierge-brain.ts",
  "src/components/home/WhyChooseSection.tsx",
];

const replacements = [
  // EN — Limenaria location
  ["Limenaria Marina, Thassos — west coast departure point", "Limenaria Marina, Thassos — south coast departure point"],
  ["Pick up on the west coast of Thassos", "Pick up on the south coast of Thassos"],
  ["Pick up at our home marina on the west coast of Thassos", "Pick up at our home marina on the south coast of Thassos"],
  ["Limenaria Marina on Thassos' west coast", "Limenaria Marina on Thassos' south coast"],
  ["Limenaria Marina on the west coast", "Limenaria Marina on the south coast"],
  ["West-coast pickup", "South-coast pickup"],
  ["Central west-coast base", "Central south-coast base"],
  ["Limenaria sits on Thassos' west coast", "Limenaria sits on Thassos' south coast"],
  ["Limenaria Marina sits on Thassos' west coast", "Limenaria Marina sits on Thassos' south coast"],
  ["The west coast around Limenaria offers", "The south coast around Limenaria offers"],
  ["Limenaria — west-coast heart of Thassos", "Limenaria — south-coast heart of Thassos"],
  ["Limenaria Town Guide — Beaches, Marina Vibe, and Boat Days from the West Coast", "Limenaria Town Guide — Beaches, Marina Vibe, and Boat Days from the South Coast"],
  ["Limenaria's former iron-ore loading pier on Thassos' west coast", "Limenaria's former iron-ore loading pier on Thassos' south coast"],
  ["half-day west-coast runs", "half-day south-coast runs"],
  ["easy handling for west-coast routes", "easy handling for south-coast routes"],
  ["Meet us at Limenaria Marina on the west coast", "Meet us at Limenaria Marina on the south coast"],
  ["quiet west coves near Limenaria", "quiet south coves near Limenaria"],
  ["quiet west coves with route pins from Limenaria Marina", "quiet south coves with route pins from Limenaria Marina"],
  ["links to Tripiti on the west coast", "links to Tripiti on the south-west coast"],
  ["Exit Limenaria harbour and follow the west shoreline south", "Exit Limenaria harbour and follow the south coast westward"],
  ["follow the west coast south", "follow the south coast westward"],
  ["follow the west shoreline south", "follow the south coast westward"],

  // EL
  ["Μαρίνα Λιμενάρια, Θάσος — αναχώρηση από τη δυτική ακτή", "Μαρίνα Λιμενάρια, Θάσος — αναχώρηση από τη νότια ακτή"],
  ["Παραλαβή στη δυτική Θάσο", "Παραλαβή στη νότια Θάσο"],
  ["Παραλαβή στη μαρίνα μας στη δυτική Θάσο", "Παραλαβή στη μαρίνα μας στη νότια Θάσο"],
  ["Αναχωρούμε από Μαρίνα Λιμενάρια, δυτική Θάσος", "Αναχωρούμε από Μαρίνα Λιμενάρια, νότια Θάσος"],
  ["στη Μαρίνα Λιμενάρια στη δυτική Θάσο", "στη Μαρίνα Λιμενάρια στη νότια Θάσο"],
  ["Παραλαβή στη δυτική ακτή, GPS", "Παραλαβή στη νότια ακτή, GPS"],
  ["Κεντρική δυτική βάση", "Κεντρική νότια βάση"],
  ["Η Limenaria βρίσκεται στη δυτική ακτή", "Η Limenaria βρίσκεται στη νότια ακτή της Θάσου"],
  ["ήσυχα δυτικά κολπάκια", "ήσυχα νότια κολπάκια"],
  ["ακολούθησε τη δυτική ακτογραμμή προς νότο", "ακολούθησε τη νότια ακτογραμμή προς δύση"],
  ["Λιμενάρια — καρδιά της δυτικής ακτής", "Λιμενάρια — καρδιά της νότιας ακτής"],
  ["πιο χαλαρή παραλιακή κωμόπολη της δυτικής Θάσου", "πιο χαλαρή παραλιακή κωμόπολη της νότιας Θάσου"],
  ["στον δυτικό ορίζοντα", "στον νότιο ορίζοντα"],

  // DE
  ["Limenaria Marina, Thassos — Abfahrt an der Westküste", "Limenaria Marina, Thassos — Abfahrt an der Südküste"],
  ["an Thassos' Westküste", "an Thassos' Südküste"],
  ["Limenaria liegt an der Westküste von Thassos", "Limenaria liegt an der Südküste von Thassos"],
  ["Die Limenaria Marina liegt an der Westküste von Thassos", "Die Limenaria Marina liegt an der Südküste von Thassos"],
  ["Limenaria — Herz der Westküste", "Limenaria — Herz der Südküste"],
  ["Thassos' entspannteste Hafenstadt an der Westküste", "Thassos' entspannteste Hafenstadt an der Südküste"],
  ["Ladepier an Thassos' Westküste", "Ladepier an Thassos' Südküste"],
  ["Die Westküste rund um Limenaria bietet", "Die Südküste rund um Limenaria bietet"],
  ["Limenaria Stadtführer — Strände, Marina-Flair und Bootstage an der Westküste", "Limenaria Stadtführer — Strände, Marina-Flair und Bootstage an der Südküste"],
  ["folge der Westküste nach Süden", "folge der Südküste nach Westen"],
  ["Verlasse den Hafen Limenaria und folge der Westküste nach Süden", "Verlasse den Hafen Limenaria und folge der Südküste nach Westen"],
  ["Kombination mit Tripiti an der Westküste", "Kombination mit Tripiti an der Südwestküste"],

  // RO
  ["Marina Limenaria, Thassos — plecare de pe coasta de vest", "Marina Limenaria, Thassos — plecare de pe coasta de sud"],
  ["de pe coasta de vest a Thassos", "de pe coasta de sud a Thassos"],
  ["Limenaria se află pe coasta de vest a lui Thassos", "Limenaria se află pe coasta de sud a insulei Thassos"],
  ["Limenaria Marina se află pe coasta de vest a lui Thassos", "Limenaria Marina se află pe coasta de sud a insulei Thassos"],
  ["Coasta de vest în jurul Limenariei oferă", "Coasta de sud din jurul Limenariei oferă"],
  ["urmați coasta de vest spre sud", "urmați coasta de sud spre vest"],

  // BG
  ["Марина Лименария, Тасос — тръгване от западното крайбрежие", "Марина Лименария, Тасос — тръгване от южното крайбрежие"],
  ["на западното крайбрежие на Тасос", "на южното крайбрежие на Тасос"],
  ["Limenaria се намира на западното крайбрежие на Thassos", "Limenaria се намира на южното крайбрежие на Thassos"],
  ["Limenaria Marina се намира на западното крайбрежие на Thassos", "Limenaria Marina се намира на южното крайбрежие на Thassos"],
  ["Лименария — сърцето на западното крайбрежие", "Лименария — сърцето на южното крайбрежие"],
  ["най-спокойният пристанищен град на западното крайбрежие на Тасос", "най-спокойният пристанищен град на южното крайбрежие на Тасос"],
  ["на западния хоризонт", "на южния хоризонт"],
  ["следвайте западното крайбрежие на юг", "следвайте южното крайбрежие на запад"],
  ["по западното крайбрежие", "по южното крайбрежие"],

  // SR
  ["Marina Limenaria, Tasos — polazak sa zapadne obale", "Marina Limenaria, Tasos — polazak sa južne obale"],
  ["na zapadnoj obali Tasosa", "na južnoj obali Tasosa"],
  ["Limenaria leži na zapadnoj obali Thassosa", "Limenaria leži na južnoj obali Thassosa"],
  ["Limenaria Marina leži na zapadnoj obali Thassosa", "Limenaria Marina leži na južnoj obali Thassosa"],
  ["pratite zapadnu obalu na jug", "pratite južnu obalu ka zapadu"],
  ["Izađite iz luke Limenaria i pratite zapadnu obalu na jug", "Izađite iz luke Limenaria i pratite južnu obalu ka zapadu"],
];

let totalChanges = 0;

for (const rel of files) {
  const filePath = path.join(root, rel);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skip missing: ${rel}`);
    continue;
  }
  let content = fs.readFileSync(filePath, "utf8");
  let fileChanges = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      const count = content.split(from).length - 1;
      content = content.split(from).join(to);
      fileChanges += count;
    }
  }
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`${rel}: ${fileChanges} replacement(s)`);
    totalChanges += fileChanges;
  }
}

console.log(`\nTotal: ${totalChanges} replacements across ${files.length} files`);
