import { NextResponse } from "next/server";
import {
  buildConciergeContext,
  respondToMessage,
  type LocalizedFaqEntry,
} from "@/lib/chat/concierge-brain";
import {
  generateGroqConciergeReply,
  type ChatHistoryMessage,
} from "@/lib/chat/groq-concierge";
import { getBoats, getFAQ } from "@/lib/data";
import { isLocale } from "@/lib/i18n/routing";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  enforceRateLimit,
  parseJsonBody,
  requireSameOrigin,
} from "@/lib/security/request";
import { trimField } from "@/lib/security/validate";

export const dynamic = "force-dynamic";

const MAX_HISTORY_ITEMS = 8;
const MAX_LOCALIZED_FAQ = 16;

function sanitizeHistory(value: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY_ITEMS).flatMap((item): ChatHistoryMessage[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const role = record.role === "assistant" ? "assistant" : record.role === "user" ? "user" : null;
    const text = trimField(record.text, 600);
    if (!role || !text) return [];
    return [{ role, text }];
  });
}

function sanitizeLocalizedFaq(value: unknown): LocalizedFaqEntry[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, MAX_LOCALIZED_FAQ).flatMap((item): LocalizedFaqEntry[] => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const q = trimField(record.q, 220);
    const a = trimField(record.a, 700);
    if (!q || !a) return [];
    return [{ q, a }];
  });
}

export async function POST(request: Request) {
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = await enforceRateLimit(
    request,
    "chat",
    RATE_LIMITS.chat.limit,
    RATE_LIMITS.chat.windowMs,
  );
  if (limited) return limited;

  const parsed = await parseJsonBody<Record<string, unknown>>(request, 16 * 1024);
  if (!parsed.ok) return parsed.response;

  const message = trimField(parsed.body.message, 1000);
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const localeRaw = trimField(parsed.body.locale, 8);
  const locale = localeRaw && isLocale(localeRaw) ? localeRaw : "en";
  const localizedFaq = sanitizeLocalizedFaq(parsed.body.localizedFaq);
  const history = sanitizeHistory(parsed.body.history);
  const context = buildConciergeContext(getBoats(), getFAQ(), localizedFaq);
  const fallback = respondToMessage(message, locale, context);
  const groqText = await generateGroqConciergeReply({
    message,
    locale,
    context,
    baseline: fallback,
    history,
  });

  return NextResponse.json({
    ...fallback,
    text: groqText ?? fallback.text,
    ai: Boolean(groqText),
  });
}
