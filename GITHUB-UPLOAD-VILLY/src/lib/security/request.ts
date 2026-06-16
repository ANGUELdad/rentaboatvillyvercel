import { NextResponse } from "next/server";
import {
  forbiddenOriginResponse,
  getClientIp,
  isAllowedOrigin,
  rateLimitResponse,
} from "./edge-request";
import { checkRateLimit } from "./rate-limit";
import { hasPoisonKeys } from "./validate";

export { safeEqual, safeEqualHex } from "./timing";
export {
  forbiddenOriginResponse,
  getClientIp,
  isAllowedOrigin,
  rateLimitResponse,
} from "./edge-request";

const MAX_JSON_BYTES = 32 * 1024;

export async function enforceRateLimit(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number,
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const { allowed, retryAfterSec } = checkRateLimit(
    `${namespace}:${ip}`,
    limit,
    windowMs,
  );
  if (!allowed) return rateLimitResponse(retryAfterSec!);
  return null;
}

export function enforceEmailRateLimit(
  namespace: string,
  email: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const { allowed, retryAfterSec } = checkRateLimit(
    `${namespace}:${email}`,
    limit,
    windowMs,
  );
  if (!allowed) return rateLimitResponse(retryAfterSec!);
  return null;
}

function isJsonContentType(request: Request): boolean {
  const ct = request.headers.get("content-type")?.toLowerCase() ?? "";
  return ct.includes("application/json") || ct.includes("+json");
}

export async function parseJsonBody<T extends Record<string, unknown>>(
  request: Request,
  maxBytes = MAX_JSON_BYTES,
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  if (!isJsonContentType(request)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 },
      ),
    };
  }

  const raw = await request.text();
  if (raw.length === 0) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Empty body" }, { status: 400 }),
    };
  }

  if (raw.length > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request too large" }, { status: 413 }),
    };
  }

  try {
    const body = JSON.parse(raw) as T;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid request" }, { status: 400 }),
      };
    }
    if (hasPoisonKeys(body as Record<string, unknown>)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Invalid request" }, { status: 400 }),
      };
    }
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}

/** Reject bot submissions that fill hidden honeypot fields. */
export function isHoneypotTripped(
  body: Record<string, unknown>,
  field = "_hp",
): boolean {
  if (!(field in body)) return false;
  const value = body[field];
  if (value == null || value === false || value === 0) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Origin check wrapper for public POST endpoints. */
export function requireSameOrigin(request: Request): NextResponse | null {
  if (!isAllowedOrigin(request)) return forbiddenOriginResponse();
  return null;
}
