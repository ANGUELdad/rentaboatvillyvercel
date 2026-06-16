import { NextResponse } from "next/server";

function fingerprint(request: Request): string {
  const ua = request.headers.get("user-agent") ?? "";
  const lang = request.headers.get("accept-language") ?? "";
  const s = `${ua}|${lang}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Client IP for rate limiting.
 * When TRUST_PROXY=true, prefers x-real-ip (set by nginx) over x-forwarded-for.
 * Without TRUST_PROXY, uses a UA fingerprint — not perfect, but avoids one shared bucket.
 */
export function getClientIp(request: Request): string {
  if (process.env.TRUST_PROXY === "true") {
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;

    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts[0]!;
    }
  }

  return `fp:${fingerprint(request)}`;
}

export function rateLimitResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSec) },
    },
  );
}

/** Reject cross-origin form posts to public write endpoints. */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    const fetchMode = request.headers.get("sec-fetch-site");
    return fetchMode === "same-origin" || fetchMode === "same-site" || !fetchMode;
  }

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

export function forbiddenOriginResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
