import { NextResponse } from "next/server";
import { createGdprRequest, hasPendingGdprRequest } from "@/lib/db/gdpr";
import {
  enforceEmailRateLimit,
  enforceRateLimit,
  isHoneypotTripped,
  parseJsonBody,
  requireSameOrigin,
} from "@/lib/security/request";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  isValidEmail,
  LIMITS,
  normalizeEmail,
  trimField,
} from "@/lib/security/validate";

export async function POST(request: Request) {
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = await enforceRateLimit(
    request,
    "gdpr-request",
    RATE_LIMITS.gdprRequest.limit,
    RATE_LIMITS.gdprRequest.windowMs,
  );
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody<Record<string, unknown>>(request);
    if (!parsed.ok) return parsed.response;

    if (isHoneypotTripped(parsed.body)) {
      return NextResponse.json({ success: true, id: "gdpr-accepted" });
    }

    const emailRaw = trimField(parsed.body.email, LIMITS.email);
    const requestType = trimField(parsed.body.requestType, 20);
    const message = trimField(parsed.body.message ?? "", LIMITS.message) ?? "";

    if (!emailRaw) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const email = normalizeEmail(emailRaw);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const emailLimited = enforceEmailRateLimit(
      "gdpr-email",
      email,
      RATE_LIMITS.gdprRequestEmail.limit,
      RATE_LIMITS.gdprRequestEmail.windowMs,
    );
    if (emailLimited) return emailLimited;

    const validTypes = [
      "access",
      "delete",
      "portability",
      "rectification",
      "restriction",
      "objection",
      "withdraw_consent",
    ] as const;
    if (
      !requestType ||
      !validTypes.includes(requestType as (typeof validTypes)[number])
    ) {
      return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
    }

    if (hasPendingGdprRequest(email)) {
      return NextResponse.json(
        { error: "A pending request for this email already exists" },
        { status: 409 },
      );
    }

    const id = createGdprRequest({
      email,
      requestType: requestType as
        | "access"
        | "delete"
        | "portability"
        | "rectification"
        | "restriction"
        | "objection"
        | "withdraw_consent",
      message,
    });

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
