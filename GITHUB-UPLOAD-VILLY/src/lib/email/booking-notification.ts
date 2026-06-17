import "server-only";

import {
  buildGuestBookingEmailHtml,
  buildOwnerBookingEmailHtml,
} from "@/lib/email/booking-templates";
import { getBoatById, getRoutes } from "@/lib/data";
import { getTranslatedDictionary } from "@/lib/i18n/auto-translate";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";
import { SITE_CONTACT } from "@/lib/site";
import type { BookingRequest } from "@/types";

export type SendBookingEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Owner inbox(es) for new booking requests. Supports a comma-separated list so
 *  notifications can fan out to several addresses. Defaults to both owners. */
function getNotifyRecipients(): string[] {
  const test = process.env.BOOKING_TEST_EMAIL?.trim();
  if (test && process.env.NODE_ENV !== "production") return [test];

  const raw =
    process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "";

  return raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || "";
}

type BookingEmailContext = {
  boatName: string;
  routeName: string | null;
  submittedAt: string;
};

function resolveRouteName(routeId: string): string | null {
  if (!routeId?.trim()) return null;
  const routes = getRoutes().routes;
  return routes.find((route) => route.id === routeId)?.name ?? null;
}

function resolveBookingContext(booking: BookingRequest): BookingEmailContext {
  const boat = booking.boatId ? getBoatById(booking.boatId) : null;
  const boatName = boat?.name ?? (booking.boatId || "Any available boat");
  const routeName = resolveRouteName(booking.routeId);

  const submittedAt = new Date(booking.createdAt).toLocaleString("en-GB", {
    timeZone: "Europe/Athens",
    dateStyle: "medium",
    timeStyle: "short",
  });

  return { boatName, routeName, submittedAt };
}

async function sendResendEmail(payload: {
  to: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<SendBookingEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const from = getFromAddress();
  if (!from) {
    return { ok: false, error: "RESEND_FROM_EMAIL not configured" };
  }

  const body: Record<string, unknown> = {
    from,
    to: payload.to,
    reply_to: payload.replyTo,
    subject: payload.subject,
    text: payload.text,
  };
  if (payload.html) {
    body.html = payload.html;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const responseBody = await res.text().catch(() => "");
    return { ok: false, error: `Resend API ${res.status}: ${responseBody}` };
  }

  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id ?? "sent" };
}

async function sendPlainTextFallbackEmail(payload: {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendBookingEmailResult> {
  return sendResendEmail({
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    replyTo: payload.replyTo,
  });
}

function plainSection(title: string, lines: string[]): string {
  const body = lines.filter(Boolean);
  if (body.length === 0) return "";
  return [`── ${title} ──`, ...body, ""].join("\n");
}

function buildOwnerPlainText(
  booking: BookingRequest,
  ctx: BookingEmailContext,
): string {
  const notes = booking.notes.trim();

  return [
    "NEW BOOKING REQUEST",
    "Rent A Boat Villy · rentaboatvilly.com",
    "",
    plainSection("Contact", [
      `Name:     ${booking.fullName}`,
      `Email:    ${booking.email}`,
      `Phone:    ${booking.phone}`,
      `ID/pass:  ${booking.idNumber}`,
    ]),
    plainSection("Trip", [
      `Date:     ${booking.date}`,
      `Time:     ${booking.time}`,
      ...(ctx.routeName ? [`Route:    ${ctx.routeName}`] : []),
    ]),
    plainSection("Boat & guests", [
      `Boat:     ${ctx.boatName}`,
      `Guests:   ${booking.guests}`,
    ]),
    notes ? plainSection("Notes", [notes]) : "",
    "── Reference ──",
    `Request ID: ${booking.id}`,
    `Submitted:  ${ctx.submittedAt} (Europe/Athens)`,
    "",
    `Reply to the guest: ${booking.email}`,
    `Call the guest: ${booking.phone}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

function resolveEmailLocale(raw?: string): Locale {
  if (raw && isLocale(raw)) return raw;
  return DEFAULT_LOCALE;
}

function formatTripDate(date: string, locale: Locale): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;

  const localeTag =
    locale === "el"
      ? "el-GR"
      : locale === "de"
        ? "de-DE"
        : locale === "ro"
          ? "ro-RO"
          : locale === "bg"
            ? "bg-BG"
            : locale === "sr"
              ? "sr-RS"
              : "en-GB";

  return new Date(year, month - 1, day).toLocaleDateString(localeTag, {
    dateStyle: "long",
    timeZone: "Europe/Athens",
  });
}

type GuestEmailCopy = {
  subject: string;
  heading: string;
  intro: string;
  notConfirmed: string;
  summaryTitle: string;
  expectTitle: string;
  expect1: string;
  expect2: string;
  expect3: string;
  referenceLabel: string;
  questions: string;
  anyBoat: string;
  labels: {
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    boat: string;
    guests: string;
    notes: string;
    route: string;
  };
};

async function loadGuestEmailCopy(
  locale: Locale,
  booking: BookingRequest,
): Promise<GuestEmailCopy> {
  const dict = await getTranslatedDictionary(locale);
  const b = dict.booking;
  const form = b.form;

  return {
    subject: b.emailSubject ?? "Your booking request — Rent A Boat Villy",
    heading: b.successTitle,
    intro: interpolate(
      b.emailIntro ?? "Thanks, {name}! We received your boat rental request.",
      { name: booking.fullName },
    ),
    notConfirmed:
      b.emailNotConfirmed ??
      "This is not a confirmed booking yet. We will contact you by phone or message to confirm availability.",
    summaryTitle: b.summaryTitle ?? "Your request",
    expectTitle: b.expectTitle,
    expect1: b.expect1,
    expect2: b.expect2,
    expect3: b.expect3,
    referenceLabel: b.emailReference ?? "Reference",
    questions: interpolate(
      b.emailQuestions ?? "Questions? Call {phone} or reply to this email.",
      { phone: SITE_CONTACT.phone },
    ),
    anyBoat: b.emailAnyBoat ?? b.summaryBoatEmpty ?? "Any available boat",
    labels: {
      name: form.fullName ?? "Full name",
      email: form.email ?? "Email",
      phone: form.phone ?? "Phone",
      date: form.date ?? "Date",
      time: form.time ?? "Preferred time",
      boat: form.vessel ?? "Preferred boat",
      guests: form.guests ?? "Guests",
      notes: form.notes ?? "Special requests & preferences",
      route: form.route ?? "Suggested route",
    },
  };
}

function guestBoatName(ctx: BookingEmailContext, copy: GuestEmailCopy): string {
  return ctx.boatName === "Any available boat" ? copy.anyBoat : ctx.boatName;
}

function buildGuestPlainText(
  booking: BookingRequest,
  ctx: BookingEmailContext,
  copy: GuestEmailCopy,
  formattedDate: string,
): string {
  const notes = booking.notes.trim();
  const boatName = guestBoatName(ctx, copy);

  return [
    copy.heading,
    "Rent A Boat Villy · rentaboatvilly.com",
    "",
    copy.intro,
    "",
    copy.notConfirmed,
    "",
    plainSection(copy.summaryTitle, [
      `${copy.labels.name}:  ${booking.fullName}`,
      `${copy.labels.email}: ${booking.email}`,
      `${copy.labels.phone}: ${booking.phone}`,
      `${copy.labels.date}:  ${formattedDate}`,
      `${copy.labels.time}:  ${booking.time}`,
      `${copy.labels.boat}:  ${boatName}`,
      `${copy.labels.guests}: ${booking.guests}`,
      ...(ctx.routeName ? [`${copy.labels.route}: ${ctx.routeName}`] : []),
    ]),
    notes ? plainSection(copy.labels.notes, [notes]) : "",
    plainSection(copy.expectTitle, [copy.expect1, copy.expect2, copy.expect3]),
    `${copy.referenceLabel}: ${booking.id}`,
    "",
    copy.questions,
    "",
    SITE_CONTACT.marina,
    SITE_CONTACT.hours,
    SITE_CONTACT.phone,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendBookingNotificationEmail(
  booking: BookingRequest,
): Promise<SendBookingEmailResult> {
  const recipients = getNotifyRecipients();
  if (recipients.length === 0) {
    return {
      ok: false,
      error: "BOOKING_NOTIFICATION_EMAIL not configured",
    };
  }

  const ctx = resolveBookingContext(booking);
  const subject = `[Booking] ${booking.fullName} — ${booking.date} ${booking.time} · ${ctx.boatName}`;
  const plainText = buildOwnerPlainText(booking, ctx);

  const primary = await sendResendEmail({
    to: recipients,
    replyTo: booking.email,
    subject,
    text: plainText,
    html: buildOwnerBookingEmailHtml({
      booking,
      boatName: ctx.boatName,
      routeName: ctx.routeName,
    }),
  });

  if (!primary.ok) return primary;

  const fallback = await sendPlainTextFallbackEmail({
    to: recipients,
    replyTo: booking.email,
    subject: `[Plain text] ${subject}`,
    text: plainText,
  });

  if (!fallback.ok) {
    console.warn("[bookings] owner plain-text fallback failed:", fallback.error);
  }

  return primary;
}

export async function sendBookingConfirmationEmail(
  booking: BookingRequest,
  localeRaw?: string,
): Promise<SendBookingEmailResult> {
  const locale = resolveEmailLocale(localeRaw);
  const ctx = resolveBookingContext(booking);
  const copy = await loadGuestEmailCopy(locale, booking);
  const formattedDate = formatTripDate(booking.date, locale);
  const boatName = guestBoatName(ctx, copy);
  const subject = `${copy.subject} — ${formattedDate} · ${boatName}`;
  const plainText = buildGuestPlainText(booking, ctx, copy, formattedDate);

  const primary = await sendResendEmail({
    to: [booking.email],
    replyTo: SITE_CONTACT.email,
    subject,
    text: plainText,
    html: buildGuestBookingEmailHtml({
      booking,
      boatName,
      routeName: ctx.routeName,
      copy: {
        heading: copy.heading,
        intro: copy.intro,
        notConfirmed: copy.notConfirmed,
        expect1: copy.expect1,
        expect2: copy.expect2,
        expect3: copy.expect3,
        questions: copy.questions,
        reference: copy.referenceLabel,
        nextStepsTitle: copy.expectTitle,
        tripSummaryTitle: copy.summaryTitle,
        routeLabel: copy.labels.route,
      },
    }),
  });

  if (!primary.ok) return primary;

  const fallback = await sendPlainTextFallbackEmail({
    to: [booking.email],
    replyTo: SITE_CONTACT.email,
    subject: `[Plain text] ${subject}`,
    text: plainText,
  });

  if (!fallback.ok) {
    console.warn("[bookings] guest plain-text fallback failed:", fallback.error);
  }

  return primary;
}
