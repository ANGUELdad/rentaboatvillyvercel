import { SITE_CONTACT } from "@/lib/site";
import { getSiteUrl } from "@/lib/env";

const BRAND = {
  navy: "#0b1f37",
  navyLight: "#12304f",
  green: "#66cc33",
  greenDark: "#4da624",
  cream: "#f7fafc",
  border: "#d8e3ed",
  muted: "#5a6b7d",
  text: "#1a2b3c",
  amber: "#b45309",
  amberBg: "#fffbeb",
  amberBorder: "#fcd34d",
} as const;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatSubmittedAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Athens",
    timeZoneName: "short",
  }).format(parsed);
}

export type TripSummary = {
  date: string;
  time: string;
  boatName: string;
  guests: number;
  routeName?: string | null;
  routeLabel?: string;
};

export type ContactBlock = {
  fullName: string;
  email: string;
  phone: string;
  idNumber?: string;
};

function emailShell(params: {
  preheader: string;
  body: string;
}): string {
  const siteUrl = getSiteUrl();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Rent A Boat Villy</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(params.preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.navy} 0%,${BRAND.navyLight} 100%);border-radius:16px 16px 0 0;padding:28px 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.72);font-weight:600;">Rent A Boat Villy</p>
                    <p style="margin:0;font-size:22px;line-height:1.25;font-weight:700;color:#ffffff;">Thassos · Self-drive boat charters</p>
                  </td>
                  <td align="right" valign="top" width="72">
                    <div style="width:56px;height:56px;border-radius:14px;background:rgba(102,204,51,0.18);border:1px solid rgba(102,204,51,0.45);text-align:center;line-height:56px;font-size:26px;">⛵</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};padding:32px;">
              ${params.body}
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border:1px solid ${BRAND.border};border-top:none;border-radius:0 0 16px 16px;padding:0 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td style="border-top:1px solid ${BRAND.border};padding-top:20px;">
                  <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:${BRAND.muted};">
                    <strong style="color:${BRAND.text};">${escapeHtml(SITE_CONTACT.marina)}</strong><br />
                    ${escapeHtml(SITE_CONTACT.hours)}
                  </p>
                  <p style="margin:0 0 4px;font-size:13px;line-height:1.5;">
                    <a href="tel:${SITE_CONTACT.phone.replace(/\s/g, "")}" style="color:${BRAND.greenDark};text-decoration:none;font-weight:600;">${escapeHtml(SITE_CONTACT.phone)}</a>
                    &nbsp;·&nbsp;
                    <a href="mailto:${SITE_CONTACT.email}" style="color:${BRAND.greenDark};text-decoration:none;font-weight:600;">${escapeHtml(SITE_CONTACT.email)}</a>
                  </p>
                  <p style="margin:12px 0 0;font-size:12px;color:${BRAND.muted};">
                    <a href="${siteUrl}" style="color:${BRAND.muted};text-decoration:underline;">rentaboatvilly.com</a>
                    &nbsp;·&nbsp;© ${year} Rent A Boat Villy
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function badge(label: string, tone: "green" | "amber" | "navy" = "green"): string {
  const styles = {
    green: `background-color:rgba(102,204,51,0.14);color:${BRAND.greenDark};border:1px solid rgba(102,204,51,0.35);`,
    amber: `background-color:${BRAND.amberBg};color:${BRAND.amber};border:1px solid ${BRAND.amberBorder};`,
    navy: `background-color:rgba(11,31,55,0.08);color:${BRAND.navy};border:1px solid rgba(11,31,55,0.15);`,
  }[tone];

  return `<span style="display:inline-block;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;${styles}">${escapeHtml(label)}</span>`;
}

function tripSummaryCard(trip: TripSummary): string {
  const dateLine = formatDisplayDate(trip.date);
  const routeRow = trip.routeName
    ? `<tr>
        <td colspan="2" style="padding-top:14px;border-top:1px solid ${BRAND.border};">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">${escapeHtml(trip.routeLabel ?? "Route")}</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.text};">${escapeHtml(trip.routeName)}</p>
        </td>
      </tr>`
    : "";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%);border:1px solid ${BRAND.border};border-left:4px solid ${BRAND.green};border-radius:12px;margin:0 0 24px;">
    <tr>
      <td style="padding:20px 22px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="50%" valign="top" style="padding-right:10px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">Date</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:${BRAND.navy};line-height:1.35;">${escapeHtml(dateLine)}</p>
            </td>
            <td width="50%" valign="top" style="padding-left:10px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">Departure</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:${BRAND.navy};">${escapeHtml(trip.time)}</p>
            </td>
          </tr>
          <tr>
            <td width="50%" valign="top" style="padding-top:14px;padding-right:10px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">Boat</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.text};">${escapeHtml(trip.boatName)}</p>
            </td>
            <td width="50%" valign="top" style="padding-top:14px;padding-left:10px;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};font-weight:600;">Guests</p>
              <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.text};">${trip.guests}</p>
            </td>
          </tr>
          ${routeRow}
        </table>
      </td>
    </tr>
  </table>`;
}

function detailGrid(rows: Array<{ label: string; value: string; href?: string }>): string {
  const cells = rows
    .map((row) => {
      const valueHtml = row.href
        ? `<a href="${row.href}" style="color:${BRAND.greenDark};text-decoration:none;font-weight:600;">${escapeHtml(row.value)}</a>`
        : escapeHtml(row.value);
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};width:38%;vertical-align:top;">
          <span style="font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(row.label)}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-size:15px;color:${BRAND.text};vertical-align:top;">
          ${valueHtml}
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">${cells}</table>`;
}

function noticeBox(message: string, tone: "amber" | "info" = "amber"): string {
  const bg = tone === "amber" ? BRAND.amberBg : "#eff6ff";
  const border = tone === "amber" ? BRAND.amberBorder : "#93c5fd";
  const color = tone === "amber" ? BRAND.amber : "#1d4ed8";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
    <tr>
      <td style="background-color:${bg};border:1px solid ${border};border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:14px;line-height:1.55;color:${color};font-weight:500;">${escapeHtml(message)}</p>
      </td>
    </tr>
  </table>`;
}

function stepsList(steps: string[]): string {
  const items = steps
    .map(
      (step, index) => `<tr>
        <td width="32" valign="top" style="padding:0 0 14px;">
          <div style="width:24px;height:24px;border-radius:999px;background-color:${BRAND.green};color:#ffffff;font-size:12px;font-weight:700;text-align:center;line-height:24px;">${index + 1}</div>
        </td>
        <td valign="top" style="padding:0 0 14px;font-size:14px;line-height:1.55;color:${BRAND.text};">
          ${escapeHtml(step)}
        </td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">${items}</table>`;
}

function ctaButton(href: string, label: string, primary = true): string {
  const bg = primary ? BRAND.green : "#ffffff";
  const color = primary ? "#ffffff" : BRAND.navy;
  const border = primary ? BRAND.green : BRAND.border;

  return `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;background-color:${bg};color:${color};border:1px solid ${border};border-radius:999px;font-size:14px;font-weight:700;text-decoration:none;">${escapeHtml(label)}</a>`;
}

function sectionTitle(title: string): string {
  return `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">${escapeHtml(title)}</p>`;
}

function notesBlock(notes: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
    <tr>
      <td style="background-color:#f8fafc;border:1px dashed ${BRAND.border};border-radius:10px;padding:16px 18px;">
        ${sectionTitle("Guest notes")}
        <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.text};white-space:pre-wrap;">${escapeHtml(notes)}</p>
      </td>
    </tr>
  </table>`;
}

function referenceFooter(reference: string, submittedAt?: string): string {
  const submitted = submittedAt
    ? `<p style="margin:4px 0 0;font-size:12px;color:${BRAND.muted};">Submitted ${escapeHtml(formatSubmittedAt(submittedAt))}</p>`
    : "";

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="background-color:#f8fafc;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:12px;color:${BRAND.muted};">Reference</p>
        <p style="margin:2px 0 0;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;color:${BRAND.navy};font-weight:600;">${escapeHtml(reference)}</p>
        ${submitted}
      </td>
    </tr>
  </table>`;
}

export function buildOwnerBookingEmailHtml(params: {
  booking: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    idNumber: string;
    date: string;
    time: string;
    guests: number;
    notes: string;
    createdAt: string;
  };
  boatName: string;
  routeName?: string | null;
}): string {
  const { booking, boatName, routeName } = params;
  const preheader = `New booking from ${booking.fullName} — ${boatName} on ${booking.date} at ${booking.time}`;

  const body = `
    <p style="margin:0 0 12px;">${badge("New request", "green")}</p>
    <h1 style="margin:0 0 8px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">${escapeHtml(booking.fullName)} wants to book</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:${BRAND.muted};">Review the details below and reply to confirm availability and marina meeting point.</p>

    ${tripSummaryCard({
      date: booking.date,
      time: booking.time,
      boatName,
      guests: booking.guests,
      routeName,
    })}

    ${sectionTitle("Guest contact")}
    ${detailGrid([
      { label: "Name", value: booking.fullName },
      {
        label: "Email",
        value: booking.email,
        href: `mailto:${booking.email}?subject=${encodeURIComponent(`Re: Your boat booking — ${booking.date}`)}`,
      },
      {
        label: "Phone",
        value: booking.phone,
        href: `tel:${booking.phone.replace(/\s/g, "")}`,
      },
      ...(booking.idNumber
        ? [{ label: "ID / Passport", value: booking.idNumber }]
        : []),
    ])}

    ${booking.notes.trim() ? notesBlock(booking.notes.trim()) : ""}

    <p style="margin:0 0 12px;">${ctaButton(`mailto:${booking.email}?subject=${encodeURIComponent(`Re: Your boat booking — ${booking.date}`)}`, "Reply to guest")}${ctaButton(`tel:${booking.phone.replace(/\s/g, "")}`, "Call guest", false)}</p>

    ${referenceFooter(booking.id, booking.createdAt)}
  `;

  return emailShell({ preheader, body });
}

export function buildGuestBookingEmailHtml(params: {
  booking: {
    id: string;
    fullName: string;
    date: string;
    time: string;
    guests: number;
    notes: string;
    createdAt: string;
  };
  boatName: string;
  routeName?: string | null;
  copy: {
    heading: string;
    intro: string;
    notConfirmed: string;
    expect1: string;
    expect2: string;
    expect3: string;
    questions: string;
    reference: string;
    nextStepsTitle?: string;
    tripSummaryTitle?: string;
    routeLabel?: string;
  };
}): string {
  const { booking, boatName, routeName, copy } = params;
  const preheader = `We received your request for ${boatName} on ${formatDisplayDate(booking.date)} at ${booking.time}. We'll confirm shortly.`;

  const body = `
    <h1 style="margin:0 0 10px;font-size:24px;line-height:1.3;color:${BRAND.navy};font-weight:700;">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.55;color:${BRAND.text};">${escapeHtml(copy.intro)}</p>

    ${noticeBox(copy.notConfirmed, "amber")}

    ${copy.tripSummaryTitle ? sectionTitle(copy.tripSummaryTitle) : ""}
    ${tripSummaryCard({
      date: booking.date,
      time: booking.time,
      boatName,
      guests: booking.guests,
      routeName,
      routeLabel: copy.routeLabel,
    })}

    ${copy.nextStepsTitle ? sectionTitle(copy.nextStepsTitle) : sectionTitle("What happens next")}
    ${stepsList([copy.expect1, copy.expect2, copy.expect3])}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#f0f8ff;border:1px solid ${BRAND.border};border-radius:10px;padding:16px 18px;">
          ${sectionTitle("Marina & hours")}
          <p style="margin:0 0 6px;font-size:14px;line-height:1.5;color:${BRAND.text};font-weight:600;">${escapeHtml(SITE_CONTACT.marina)}</p>
          <p style="margin:0 0 10px;font-size:14px;line-height:1.5;color:${BRAND.muted};">${escapeHtml(SITE_CONTACT.hours)}</p>
          <p style="margin:0;">${ctaButton(`tel:${SITE_CONTACT.phone.replace(/\s/g, "")}`, SITE_CONTACT.phone, false)}${ctaButton(getSiteUrl(), "View our fleet", false)}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(copy.questions)}</p>

    ${referenceFooter(`${copy.reference} ${booking.id}`, booking.createdAt)}
  `;

  return emailShell({ preheader, body });
}
