import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin-auth";
import { getAdminPassword } from "@/lib/env";
import {
  forbiddenOriginResponse,
  isAllowedOrigin,
  isHoneypotTripped,
  parseJsonBody,
  safeEqual,
} from "@/lib/security/request";

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return forbiddenOriginResponse();
  }

  const parsed = await parseJsonBody<{ password?: string; _hp?: string }>(
    request,
    4096,
  );
  if (!parsed.ok) return parsed.response;

  if (isHoneypotTripped(parsed.body)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  let secret: string;
  try {
    secret = getAdminPassword();
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const password = parsed.body.password ?? "";
  if (!password || !safeEqual(password, secret)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, adminSessionCookieOptions());
  return response;
}
