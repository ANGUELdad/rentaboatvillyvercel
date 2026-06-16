import {
  type ConciergeContext,
  type ConciergeReply,
} from "@/lib/chat/concierge-brain";
import {
  MARINA_HOURS,
  MARINA_NAME,
  MARINA_PHONE,
} from "@/lib/chat/concierge-context";
import type { Locale } from "@/lib/i18n";

const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const MAX_REPLY_CHARS = 700;

type ChatRole = "user" | "assistant";

export interface ChatHistoryMessage {
  role: ChatRole;
  text: string;
}

interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function compactText(value: string, max = 1400): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function localeName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: "English",
    el: "Greek",
    ro: "Romanian",
    de: "German",
    sr: "Serbian",
    bg: "Bulgarian",
  };
  return names[locale] ?? "English";
}

function buildFleetFacts(context: ConciergeContext): string {
  if (!context.boats.length) return "Fleet details are temporarily unavailable.";
  return context.boats
    .map((boat) => {
      const amenities =
        boat.amenities?.slice(0, 6).map((item) => item.label).join(", ") ||
        "sun tent, Bluetooth speaker, icebox, anchor, life jackets";
      return `- ${boat.name}: ${boat.pax} seats. ${boat.tagline || boat.description}. Amenities: ${amenities}.`;
    })
    .join("\n");
}

function buildFaqFacts(context: ConciergeContext): string {
  const faq = context.localizedFaq.length
    ? context.localizedFaq.map((item) => ({ q: item.q, a: item.a }))
    : context.faq.map((item) => ({ q: item.question, a: item.answer }));

  return faq
    .slice(0, 12)
    .map((item) => `- Q: ${compactText(item.q, 180)} A: ${compactText(item.a, 360)}`)
    .join("\n");
}

function buildSystemPrompt(locale: Locale, context: ConciergeContext): string {
  return [
    "You are Villy, the polite marina assistant for Rent A Boat Villy in Thassos.",
    `Reply in ${localeName(locale)} unless the guest clearly uses another supported language.`,
    "You only help with Rent A Boat Villy: boat rental, fleet selection, booking requests, location, safety, fuel, weather policy, what to bring, and island routes.",
    "Never invent live availability, exact prices, discounts, payment confirmations, legal rules beyond the provided facts, medical advice, or guarantees.",
    "If asked for prices or live availability, direct the guest to submit the booking form or call the marina.",
    "If a question is off-topic, abusive, sexual, hateful, unsafe, or asks for illegal/harmful content, politely refuse and redirect to boat rental help.",
    "Do not flirt, roleplay, use profanity, or answer inappropriate personal questions.",
    "Keep answers short, practical, and calm: 2 to 5 sentences, no markdown tables.",
    "Use only the provided business facts and the provided baseline answer. If unsure, say so and offer phone/booking contact.",
    "",
    "Business facts:",
    `- Brand: Rent A Boat Villy`,
    `- Marina: ${MARINA_NAME}, Thassos`,
    `- Phone: ${MARINA_PHONE}`,
    `- Hours: daily ${MARINA_HOURS}`,
    "- Fuel is not included in the rental rate and is charged separately.",
    "- No online payment is required for a booking request; the team confirms by phone or email.",
    "- No licence is required for boats up to 30HP; a safety briefing and life jackets are provided.",
    "- Guests must remain on board while the boat is moving. Swimming is allowed only while anchored.",
    "",
    "Fleet facts:",
    buildFleetFacts(context),
    "",
    "FAQ facts:",
    buildFaqFacts(context) || "- No FAQ facts available.",
  ].join("\n");
}

function buildUserPrompt(message: string, baseline: ConciergeReply): string {
  return [
    `Guest message: ${compactText(message, 1000)}`,
    "",
    "Baseline safe answer from the site logic:",
    compactText(baseline.text, 1200),
    "",
    "Write the final answer for the guest. Stay consistent with the baseline answer. Do not add facts that are not in the business facts.",
  ].join("\n");
}

function sanitizeHistory(history: ChatHistoryMessage[]): GroqChatMessage[] {
  return history.slice(-6).map((item) => ({
    role: item.role,
    content: compactText(item.text, 500),
  }));
}

function cleanModelText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_REPLY_CHARS);
}

function looksUnsafeOrUseless(text: string): boolean {
  if (text.length < 12) return true;
  if (/as an ai|language model|system prompt|developer message/i.test(text)) return true;
  if (/not provided in (the )?(context|facts)/i.test(text)) return true;
  return false;
}

export async function generateGroqConciergeReply(params: {
  message: string;
  locale: Locale;
  context: ConciergeContext;
  baseline: ConciergeReply;
  history?: ChatHistoryMessage[];
}): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GROQ_CHAT_MODEL?.trim() || DEFAULT_GROQ_MODEL;
  const messages: GroqChatMessage[] = [
    { role: "system", content: buildSystemPrompt(params.locale, params.context) },
    ...sanitizeHistory(params.history ?? []),
    { role: "user", content: buildUserPrompt(params.message, params.baseline) },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.25,
        max_completion_tokens: 220,
        top_p: 0.8,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = (await response.json()) as GroqChatResponse;
    const text = cleanModelText(data.choices?.[0]?.message?.content ?? "");
    if (looksUnsafeOrUseless(text)) return null;
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
