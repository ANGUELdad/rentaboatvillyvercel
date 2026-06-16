export const SITE_TIMEZONE =
  process.env.SITE_TIMEZONE?.trim() || "Europe/Athens";

/** YYYY-MM-DD in site timezone (en-CA locale format). */
export function todayInSiteTz(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Max bookable date — 18 months ahead in site timezone. */
export function maxBookingDateInSiteTz(): string {
  const now = new Date();
  const future = new Date(now);
  future.setMonth(future.getMonth() + 18);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(future);
}
