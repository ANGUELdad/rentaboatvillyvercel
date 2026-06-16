#!/usr/bin/env node
/**
 * Send a sample booking notification (HTML + plain text) via Resend.
 *
 *   node scripts/send-test-booking-email.mjs
 *
 * Requires .env.local: RESEND_API_KEY, BOOKING_NOTIFICATION_EMAIL
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(name) {
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
  process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
  process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
  null;
const from =
  process.env.RESEND_FROM_EMAIL?.trim() ||
  "Rent A Boat Villy <onboarding@resend.dev>";

const booking = {
  id: `bk-test-${Date.now()}`,
  fullName: "Νίκος Παπαδόπουλος",
  email: "guest.example@mail.com",
  phone: "+30 690 123 4567",
  idNumber: "AK123456",
  date: "2026-07-15",
  time: "10:00",
  boatName: "KIMA",
  routeName: "South coast loop",
  guests: 6,
  notes: "Birthday celebration — prefer a boat with good shade. TEST email, safe to ignore.",
};

const submittedAt = new Date().toLocaleString("en-GB", {
  timeZone: "Europe/Athens",
  dateStyle: "medium",
  timeStyle: "short",
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlField(label, value) {
  return `<tr>
  <td style="padding:8px 16px 8px 0;color:#64748b;font-size:14px;white-space:nowrap;vertical-align:top;width:120px">${escapeHtml(label)}</td>
  <td style="padding:8px 0;font-size:14px;color:#0f172a;vertical-align:top">${escapeHtml(value)}</td>
</tr>`;
}

function htmlSection(title, rows) {
  if (!rows.trim()) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border-collapse:collapse">
  <tr>
    <td style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0369a1">${escapeHtml(title)}</td>
  </tr>
  <tr>
    <td style="padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">${rows}</table>
    </td>
  </tr>
</table>`;
}

const contactRows = [
  htmlField("Name", booking.fullName),
  htmlField("Email", booking.email),
  htmlField("Phone", booking.phone),
  htmlField("ID / passport", booking.idNumber),
].join("");

const tripRows = [
  htmlField("Date", booking.date),
  htmlField("Time", booking.time),
  htmlField("Route", booking.routeName),
].join("");

const boatRows = [
  htmlField("Boat", booking.boatName),
  htmlField("Guests", String(booking.guests)),
].join("");

const notesBlock = booking.notes
  ? htmlSection(
      "Guest notes",
      `<tr><td style="padding:0;font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-wrap">${escapeHtml(booking.notes)}</td></tr>`,
    )
  : "";

const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0f172a;line-height:1.5">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;border-collapse:collapse">
    <tr>
      <td style="padding:24px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0369a1">New booking request</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0c4a6e">Rent A Boat Villy</h1>
        ${htmlSection("Contact", contactRows)}
        ${htmlSection("Trip details", tripRows)}
        ${htmlSection("Boat & guests", boatRows)}
        ${notesBlock}
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 16px;border-collapse:collapse">
          <tr>
            <td style="padding:12px 16px;background:#ecfeff;border:1px solid #a5f3fc;border-radius:8px;font-size:13px;color:#0e7490">
              <strong>Request ID:</strong> ${escapeHtml(booking.id)}<br>
              <strong>Submitted:</strong> ${escapeHtml(submittedAt)} (Europe/Athens)
            </td>
          </tr>
        </table>
        <p style="margin:0;font-size:13px;color:#64748b">Reply directly to the guest at <a href="mailto:${escapeHtml(booking.email)}" style="color:#0369a1">${escapeHtml(booking.email)}</a>.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

const text = [
  "NEW BOOKING REQUEST",
  "Rent A Boat Villy · thassosboats.gr",
  "",
  "── Contact ──",
  `Name:     ${booking.fullName}`,
  `Email:    ${booking.email}`,
  `Phone:    ${booking.phone}`,
  `ID/pass:  ${booking.idNumber}`,
  "",
  "── Trip ──",
  `Date:     ${booking.date}`,
  `Time:     ${booking.time}`,
  `Route:    ${booking.routeName}`,
  "",
  "── Boat & guests ──",
  `Boat:     ${booking.boatName}`,
  `Guests:   ${booking.guests}`,
  "",
  "── Notes ──",
  booking.notes,
  "",
  "── Reference ──",
  `Request ID: ${booking.id}`,
  `Submitted:  ${submittedAt} (Europe/Athens)`,
  "",
  `Reply to the guest: ${booking.email}`,
].join("\n");

const subject = `[TEST Booking] ${booking.fullName} — ${booking.date} ${booking.time} · ${booking.boatName}`;

if (!apiKey) {
  console.error("FAIL: RESEND_API_KEY is not set in .env.local");
  process.exit(1);
}

if (!to) {
  console.error("FAIL: BOOKING_NOTIFICATION_EMAIL is not set in .env.local");
  process.exit(1);
}

console.log(`Sending formatted booking email to: ${to}`);
console.log(`From: ${from}`);

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    reply_to: booking.email,
    subject,
    text,
    html,
  }),
});

const body = await res.text();
let parsed;
try {
  parsed = JSON.parse(body);
} catch {
  parsed = { raw: body };
}

if (!res.ok) {
  console.error("FAIL:", res.status, parsed);
  process.exit(1);
}

console.log("SUCCESS:", parsed);
