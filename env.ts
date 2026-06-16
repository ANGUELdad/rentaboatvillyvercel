/** Production environment helpers — fail fast when secrets are missing. */

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set in production`);
  }

  throw new Error(
    `${name} is required. Copy .env.example to .env.local and set all secrets.`,
  );
}

/** Admin login password — never used for session signing. */
export function getAdminPassword(): string {
  const secret = requireEnv(
    "ADMIN_SECRET or ADMIN_PASSWORD",
    process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD,
  );

  if (process.env.NODE_ENV === "production" && secret.length < 16) {
    throw new Error(
      "ADMIN_SECRET must be at least 16 characters in production",
    );
  }

  return secret;
}

/** Separate key for HMAC session tokens — must differ from login password. */
export function getSessionSigningKey(): string {
  const key = process.env.SESSION_SIGNING_KEY?.trim();
  if (key) return key;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SIGNING_KEY must be set in production");
  }

  // Dev-only: allow a distinct signing key derived from admin password if unset
  const admin = process.env.ADMIN_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (admin) return `${admin}:session-signing-dev`;

  throw new Error(
    "SESSION_SIGNING_KEY (or ADMIN_SECRET for dev) is required. See .env.example.",
  );
}

export function getGdprSalt(): string {
  return requireEnv("GDPR_SALT", process.env.GDPR_SALT);
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://rentaboatvilly.com";
}

/** Hostname for email footers and plain-text branding (no protocol). */
export function getSiteDisplayHost(): string {
  try {
    return new URL(getSiteUrl()).hostname.replace(/^www\./i, "");
  } catch {
    return "rentaboatvilly.com";
  }
}

/** Server-only booking notification inbox(es) — never expose in client or locale data.
 *  Supports a comma-separated list; returns the first address for single-value callers. */
export function getBookingNotificationEmail(): string | null {
  const test = process.env.BOOKING_TEST_EMAIL?.trim();
  if (test && process.env.NODE_ENV !== "production") return test;

  const raw =
    process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim();

  if (!raw) return null;
  return raw.split(",")[0]?.trim() || null;
}
