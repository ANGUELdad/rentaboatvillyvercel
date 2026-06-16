import { pick, shuffle } from "@/lib/chat/concierge-variety";
import type { Boat, FAQ } from "@/types";

export const MARINA_PHONE = "+30 698 131 8393";
export const MARINA_HOURS = "08:00–20:00";
export const MARINA_NAME = "New Port of Limenaria";

export interface LocalizedFaqEntry {
  q: string;
  a: string;
}

export interface ConciergeContext {
  boats: Boat[];
  faq: FAQ[];
  localizedFaq: LocalizedFaqEntry[];
}

export function buildConciergeContext(
  boats: Boat[],
  faq: FAQ[],
  localizedFaq: LocalizedFaqEntry[] = [],
): ConciergeContext {
  return { boats, faq, localizedFaq };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreTokens(inputTokens: string[], corpus: string): number {
  const corpusTokens = new Set(tokenize(corpus));
  let score = 0;
  for (const token of inputTokens) {
    if (corpusTokens.has(token)) score += 2;
    else if ([...corpusTokens].some((c) => c.includes(token) || token.includes(c))) score += 1;
  }
  return score;
}

const FAQ_ID_KEYWORDS: Record<string, RegExp[]> = {
  license: [/licen/i, /δίπλω/i, /führerschein/i, /permis/i, /dozvol/i, /лиценз/i, /30hp/i, /30 hp/i],
  pricing: [/price/i, /cost/i, /how much/i, /rate/i, /€|eur/i, /τιμ/i, /pret/i, /preis/i, /cena/i, /цена/i],
  fuel: [/fuel/i, /gas/i, /petrol/i, /καύσι/i, /combustibil/i, /treibstoff/i, /gorivo/i, /гориво/i],
  marina: [/marina/i, /limenaria/i, /where/i, /location/i, /hours/i, /open/i, /λιμεν/i, /πού/i, /anfahrt/i],
  deposit: [/deposit/i, /prepay/i, /payment/i, /online pay/i, /προκαταβ/i, /plat/i, /depozit/i, /депозит/i],
  speedboat: [/speedboat/i, /experience/i, /beginner/i, /without experience/i, /απειρ/i, /anfänger/i],
  booking: [/confirm/i, /booking/i, /reserve/i, /availability/i, /διαθεσιμ/i, /rezerv/i, /buchen/i],
  safety: [/safety/i, /stay on board/i, /disembark/i, /life jacket/i, /ασφαλ/i, /sigur/i, /bezbed/i],
};

function idBoost(input: string, id: string): number {
  const patterns = FAQ_ID_KEYWORDS[id];
  if (!patterns) return 0;
  return patterns.some((p) => p.test(input)) ? 8 : 0;
}

export function matchFaq(
  input: string,
  context: ConciergeContext,
): { question: string; answer: string; id?: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const inputTokens = tokenize(trimmed);
  if (!inputTokens.length) return null;

  type Scored = { question: string; answer: string; id?: string; score: number };
  const scored: Scored[] = [];

  for (const item of context.faq) {
    const corpus = `${item.question} ${item.answer}`;
    const score = scoreTokens(inputTokens, corpus) + idBoost(trimmed, item.id);
    if (score >= 3) scored.push({ question: item.question, answer: item.answer, id: item.id, score });
  }

  for (const item of context.localizedFaq) {
    const corpus = `${item.q} ${item.a}`;
    const score = scoreTokens(inputTokens, corpus);
    if (score >= 3) scored.push({ question: item.q, answer: item.a, score });
  }

  if (!scored.length) return null;

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!;

  if (best.id && context.localizedFaq.length) {
    const localized = findLocalizedByTopic(best.id, context.localizedFaq, best.question);
    if (localized) {
      return { question: localized.q, answer: stripMarkdownLinks(localized.a), id: best.id };
    }
  }

  return {
    question: best.question,
    answer: stripMarkdownLinks(best.answer),
    id: best.id,
  };
}

function findLocalizedByTopic(
  id: string,
  localized: LocalizedFaqEntry[],
  enQuestion: string,
): LocalizedFaqEntry | null {
  const keywords = FAQ_ID_KEYWORDS[id];
  if (keywords) {
    const hit = localized.find((item) => keywords.some((p) => p.test(item.q) || p.test(item.a)));
    if (hit) return hit;
  }
  const enTokens = new Set(tokenize(enQuestion));
  let best: LocalizedFaqEntry | null = null;
  let bestScore = 0;
  for (const item of localized) {
    const score = scoreTokens([...enTokens], item.q);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore >= 2 ? best : null;
}

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export function formatFleetSummary(boats: Boat[], sampleCount?: number): string {
  if (!boats.length) return "Contact us for fleet details.";
  const ordered = shuffle(boats);
  const count = sampleCount ?? Math.min(ordered.length, 3 + Math.floor(Math.random() * 2));
  return ordered
    .slice(0, count)
    .map((b) => `${b.name} (${b.pax} seats)`)
    .join(", ");
}

export function formatFullFleetLine(boats: Boat[]): string {
  return [...boats]
    .sort((a, b) => b.pax - a.pax)
    .map((b) => `${b.name} (${b.pax})`)
    .join(", ");
}

export function getBoatDetails(boat: Boat): string {
  const amenities =
    boat.amenities?.slice(0, 4).map((a) => a.label).join(", ") ??
    "sun tent, Bluetooth, icebox, anchor, life jackets";
  return `${boat.name}: up to ${boat.pax} seats. ${boat.tagline ?? boat.description} Includes ${amenities}. Self-drive from ${MARINA_NAME} — please call ${MARINA_PHONE} for rates (${MARINA_HOURS}). Fuel is not included in the rental rate.`;
}

export function recommendBoatForPax(boats: Boat[], pax: number): Boat[] {
  const fits = boats.filter((b) => b.pax >= pax);
  if (!fits.length) return [...boats].sort((a, b) => b.pax - a.pax).slice(0, 2);
  return [...fits].sort((a, b) => a.pax - b.pax).slice(0, 2);
}

export function findBoatByName(boats: Boat[], input: string): Boat | undefined {
  const lower = input.toLowerCase();
  return boats.find(
    (b) =>
      lower.includes(b.name.toLowerCase()) ||
      lower.includes(b.id.replace(/-/g, " ")),
  );
}

export function compactBoat(boats: Boat[]): Boat {
  return [...boats].sort((a, b) => a.pax - b.pax)[0]!;
}

export function spaciousBoat(boats: Boat[]): Boat {
  return [...boats].sort((a, b) => b.pax - a.pax)[0]!;
}

export function extractPax(input: string): number | null {
  const m =
    input.match(/(\d+)\s*(people|persons|guests|pax|seats|άτομα|ατομα|persoane|personen|osoba|души)/i) ??
    input.match(/for\s*(\d+)/i) ??
    input.match(/(\d+)\s*(άτομ|επισκ)/i);
  return m ? parseInt(m[1]!, 10) : null;
}

export function pickRandomBoats(boats: Boat[], count: number): Boat[] {
  return shuffle(boats).slice(0, Math.min(count, boats.length));
}

export function contactSnippet(): string {
  return pick([
    `Call ${MARINA_PHONE} or visit ${MARINA_NAME}. Open daily ${MARINA_HOURS}.`,
    `${MARINA_NAME}, south coast of Thassos — ${MARINA_HOURS} daily. Phone ${MARINA_PHONE}.`,
    `Reach us at ${MARINA_PHONE}, email vilitrifonova245@gmail.com. ${MARINA_NAME}, ${MARINA_HOURS}.`,
  ]);
}
