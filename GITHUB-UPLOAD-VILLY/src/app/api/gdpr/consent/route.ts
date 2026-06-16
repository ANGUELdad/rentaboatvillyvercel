import { NextResponse } from "next/server";
import { hasRecentConsentLog, logConsent } from "@/lib/db/gdpr";
import {
  enforceRateLimit,
  getClientIp,
  parseJsonBody,
  requireSameOrigin,
} from "@/lib/security/request";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import { isValidConsentId } from "@/lib/security/validate";

export async function POST(request: Request) {
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = await enforceRateLimit(
    request,
    "gdpr-consent",
    RATE_LIMITS.gdprConsent.limit,
    RATE_LIMITS.gdprConsent.windowMs,
  );
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody<Record<string, unknown>>(request, 4096);
    if (!parsed.ok) return parsed.response;

    const consentId =
      typeof parsed.body.consentId === "string"
        ? parsed.body.consentId.trim()
        : "";

    if (!consentId || !isValidConsentId(consentId)) {
      return NextResponse.json({ error: "Invalid consentId" }, { status: 400 });
    }

    const analytics = Boolean(parsed.body.analytics);
    const marketing = Boolean(parsed.body.marketing);
    const policyVersion =
      typeof parsed.body.policyVersion === "string"
        ? parsed.body.policyVersion.trim().slice(0, 32)
        : undefined;

    if (hasRecentConsentLog(consentId, analytics, marketing)) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request);
    const resolvedIp = ip.startsWith("fp:") ? undefined : ip;

    logConsent({
      consentId,
      analytics,
      marketing,
      policyVersion,
      ip: resolvedIp,
      userAgent: request.headers.get("user-agent")?.slice(0, 255) ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to log consent" }, { status: 500 });
  }
}
