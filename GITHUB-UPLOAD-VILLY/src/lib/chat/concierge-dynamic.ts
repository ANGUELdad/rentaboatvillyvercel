import { pick } from "@/lib/chat/concierge-variety";
import type { Locale } from "@/lib/i18n";
import {
  MENU_MESSAGE_VARIANTS,
  TIME_GREETINGS,
} from "@/lib/chat/concierge-menu-messages";

const MENU_NODE_KEYS = [
  "start",
  "booking",
  "fleet",
  "group",
  "directions",
  "fuel",
  "amenities",
  "rates",
  "contact",
  "book-cta",
  "fleet-cta",
] as const;

export type MenuNodeKey = (typeof MENU_NODE_KEYS)[number];

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateSessionRef(): string {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]!;
  }
  return `VB-${suffix}`;
}

export function getTimeGreeting(locale: Locale): string {
  const hour = new Date().getHours();
  const bucket = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const table = TIME_GREETINGS[locale] ?? TIME_GREETINGS.en;
  return table[bucket];
}

export function pickMenuMessage(
  nodeId: string,
  locale: Locale,
  fallback: string,
): string {
  const pool =
    MENU_MESSAGE_VARIANTS[locale]?.[nodeId as MenuNodeKey] ??
    MENU_MESSAGE_VARIANTS.en?.[nodeId as MenuNodeKey];

  const base = pool?.length ? pick(pool) : fallback;

  if (nodeId === "start") {
    const body = pool?.length ? pool[0]! : fallback;
    return `${getTimeGreeting(locale)} ${body}`;
  }

  return base;
}

export function menuThinkingDelayMs(): number {
  return 500 + Math.floor(Math.random() * 401);
}
