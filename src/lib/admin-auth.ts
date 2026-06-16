import { cookies } from "next/headers";
import { getSessionSigningKey } from "@/lib/env";
import { safeEqualHex } from "@/lib/security/timing";

export const ADMIN_COOKIE = "admin-session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSessionToken(
  signingKey = getSessionSigningKey(),
): Promise<string> {
  const exp = String(Date.now() + SESSION_TTL_MS);
  const sig = await hmacSha256Hex(signingKey, exp);
  return `${exp}.${sig}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  signingKey?: string,
): Promise<boolean> {
  if (!token) return false;

  let key: string;
  try {
    key = signingKey ?? getSessionSigningKey();
  } catch {
    return false;
  }

  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;

  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expMs = Number(exp);

  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  if (sig.length !== 64) return false;

  const expected = await hmacSha256Hex(key, exp);
  return safeEqualHex(sig, expected);
}

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function adminSessionCookieOptions(maxAge = SESSION_TTL_MS / 1000) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge,
    path: "/",
  };
}
