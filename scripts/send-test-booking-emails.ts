#!/usr/bin/env npx tsx
/**
 * Send sample owner + guest booking emails via Resend using production templates.
 *
 *   BOOKING_TEST_EMAIL=you@example.com npx tsx scripts/send-test-booking-emails.ts
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildGuestBookingEmailHtml,
  buildOwnerBookingEmailHtml,
} from "../src/lib/email/booking-templates";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(name: string) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const apiKey = process.env.RESEND_API_KEY?.trim();
const to =
  process.env.BOOKING_TEST_EMAIL?.trim() ||
  process.env.BOOKING_NOTIFICATION_EMAIL?.trim()?.split(",")[0]?.trim() ||
  null;
const from =
  process.env.RESEND_FROM_EMAIL?.trim() ||
  "Rent A Boat Villy <onboarding@resend.dev>";

if (!apiKey) {
  console.error("Missing RESEND_API_KEY in .env.local");
  process.exit(1);
}
if (!to) {
  console.error("Set BOOKING_TEST_EMAIL or BOOKING_NOTIFICATION_EMAIL");
  process.exit(1);
}

const booking = {
  id: "test-" + Date.now().toString(36),
  fullName: "Aggelos Dadalis",
  email: to,
  phone: "+30 698 131 8393",
  idNumber: "AB123456",
  date: "2026-07-15",
  time: "10:00",
  boatId: "villy-580",
  guests: 4,
  routeId: "southern-coast",
  notes: "We would love a cooler on board and a quick stop near Tripiti beach if possible.",
  createdAt: new Date().toISOString(),
};

const boatName = "Villy 580";
const routeName = "Southern Coast Discovery";

async function sendEmail(payload: {
  subject: string;
  text: string;
  html: string;
  label: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${payload.label} failed (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { id?: string };
  console.log(`✓ ${payload.label} sent — id: ${data.id ?? "unknown"}`);
}

async function main() {
const ownerHtml = buildOwnerBookingEmailHtml({ booking, boatName, routeName });
const guestHtml = buildGuestBookingEmailHtml({
  booking,
  boatName,
  routeName,
  copy: {
    heading: "Request received!",
    intro: `Thanks, ${booking.fullName}! We received your boat rental request.`,
    notConfirmed:
      "This is not a confirmed booking yet. We will contact you by phone or message to confirm availability and pricing.",
    expect1: "We review your request and check fleet availability.",
    expect2: "We call or message you to confirm your date, boat, and marina meeting point.",
    expect3: "On arrival, bring your ID/passport and enjoy your Thassos day on the water.",
    questions: "Questions? Call +30 698 131 8393 or reply to this email.",
    reference: "Reference",
    nextStepsTitle: "What happens next",
    tripSummaryTitle: "Your trip summary",
    routeLabel: "Where you might go",
  },
});

await sendEmail({
  label: "Owner notification",
  subject: `[Booking] ${booking.fullName} — ${booking.date} ${booking.time} · ${boatName}`,
  text: "New booking request (see HTML version)",
  html: ownerHtml,
});

await sendEmail({
  label: "Guest confirmation",
  subject: `Your booking request — Rent A Boat Villy — ${booking.date} · ${boatName}`,
  text: "Booking request received (see HTML version)",
  html: guestHtml,
});

console.log(`\nBoth emails sent to ${to}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
