import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionCookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const opts = adminSessionCookieOptions(0);
  response.cookies.set(ADMIN_COOKIE, "", { ...opts, maxAge: 0 });
  return response;
}
