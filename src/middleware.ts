import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-auth";
import {
  forbiddenOriginResponse,
  getClientIp,
  isAllowedOrigin,
  rateLimitResponse,
} from "@/lib/security/edge-request";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";

const SUSPICIOUS_PATH =
  /(?:\.\.|%2e%2e|%252e%252e|\/\.env|\/\.git|\/wp-admin|\/wp-login|\/phpmyadmin|\/xmlrpc\.php|\/web\.config|\/\.htaccess|\/cgi-bin|\/\.aws|\/actuator|\/server-status|\/server-info|\/package\.json|\/docker-compose|\/\.cursor|\/node_modules|\/thassos\.db)/i;

function getSigningKey(): string | null {
  return (
    process.env.SESSION_SIGNING_KEY?.trim() ||
    (process.env.NODE_ENV !== "production"
      ? (() => {
          const admin =
            process.env.ADMIN_SECRET?.trim() ||
            process.env.ADMIN_PASSWORD?.trim();
          return admin ? `${admin}:session-signing-dev` : null;
        })()
      : null)
  );
}

async function isAuthed(request: NextRequest): Promise<boolean> {
  const key = getSigningKey();
  if (!key) return false;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token, key);
}

function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  return response;
}

function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function blockSuspiciousPath(pathname: string): NextResponse | null {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (SUSPICIOUS_PATH.test(pathname) || SUSPICIOUS_PATH.test(decoded)) {
    return new NextResponse(null, { status: 404 });
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  const blocked = blockSuspiciousPath(pathname);
  if (blocked) return blocked;

  if (pathname.startsWith("/data/")) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname === "/api/health") {
    const { limit, windowMs } = RATE_LIMITS.health;
    const { allowed, retryAfterSec } = checkRateLimit(
      `health:${ip}`,
      limit,
      windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/api/weather" && request.method === "GET") {
    const { limit, windowMs } = RATE_LIMITS.weather;
    const { allowed, retryAfterSec } = checkRateLimit(
      `weather:${ip}`,
      limit,
      windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/api/i18n/blog" && request.method === "GET") {
    const { limit, windowMs } = RATE_LIMITS.i18nBlog;
    const { allowed, retryAfterSec } = checkRateLimit(
      `i18n-blog:${ip}`,
      limit,
      windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api/i18n/") && pathname.endsWith("/translate")) {
    if (request.method === "POST") {
      const { limit, windowMs } = RATE_LIMITS.i18nTranslate;
      const { allowed, retryAfterSec } = checkRateLimit(
        `i18n-tr:${ip}`,
        limit,
        windowMs,
      );
      if (!allowed) return rateLimitResponse(retryAfterSec!);
    }
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/api/i18n/") && request.method === "GET") {
    const { limit, windowMs } = RATE_LIMITS.i18nDictionary;
    const { allowed, retryAfterSec } = checkRateLimit(
      `i18n-dict:${ip}`,
      limit,
      windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/api/bookings" && request.method === "POST") {
    const { limit, windowMs } = RATE_LIMITS.booking;
    const { allowed, retryAfterSec } = checkRateLimit(
      `booking:${ip}`,
      limit,
      windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (
    (pathname === "/api/gdpr/request" || pathname === "/api/gdpr/consent") &&
    request.method === "POST"
  ) {
    const namespace = pathname.includes("consent") ? "gdpr-consent" : "gdpr-request";
    const limits = pathname.includes("consent")
      ? RATE_LIMITS.gdprConsent
      : RATE_LIMITS.gdprRequest;
    const { allowed, retryAfterSec } = checkRateLimit(
      `${namespace}:${ip}`,
      limits.limit,
      limits.windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/api/admin/login" && request.method === "POST") {
    const { limit, windowMs } = RATE_LIMITS.adminLogin;
    const { allowed, retryAfterSec } = checkRateLimit(
      `login:${ip}`,
      limit,
      windowMs,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (
    pathname.startsWith("/api/admin/") &&
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    if (!isAllowedOrigin(request)) {
      return applyAdminSecurityHeaders(
        applyApiSecurityHeaders(forbiddenOriginResponse()),
      );
    }
    const { allowed, retryAfterSec } = checkRateLimit(
      `admin-mut:${ip}`,
      60,
      60 * 1000,
    );
    if (!allowed) return rateLimitResponse(retryAfterSec!);
  }

  if (pathname.startsWith("/api/data/")) {
    const authed = await isAuthed(request);
    if (!authed) {
      return applyApiSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }
    return applyAdminSecurityHeaders(
      applyApiSecurityHeaders(NextResponse.next()),
    );
  }

  if (pathname.startsWith("/api/")) {
    return applyApiSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const authed = await isAuthed(request);
    if (!authed) {
      if (pathname.startsWith("/api/")) {
        return applyAdminSecurityHeaders(
          applyApiSecurityHeaders(
            NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
          ),
        );
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/data/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icons|images|videos|manifest.webmanifest|robots.txt|sitemap.xml|\\.well-known/security\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|mp4|webm)$).*)",
  ],
};
