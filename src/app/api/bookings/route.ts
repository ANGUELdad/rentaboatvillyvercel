import { NextResponse } from "next/server";
import { getBoatById } from "@/lib/data";
import { createBooking, hasRecentDuplicate } from "@/lib/db/bookings";
import {
  sendBookingConfirmationEmail,
  sendBookingNotificationEmail,
} from "@/lib/email/booking-notification";
import { newId } from "@/lib/security/ids";
import {
  enforceRateLimit,
  isHoneypotTripped,
  parseJsonBody,
  requireSameOrigin,
} from "@/lib/security/request";
import { RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  isBookingDateInRange,
  isValidEmail,
  isValidEntityId,
  isValidIdNumber,
  isValidPhone,
  isValidTime,
  LIMITS,
  normalizeEmail,
  trimField,
} from "@/lib/security/validate";
import { isLocale } from "@/lib/i18n/routing";
import type { BookingRequest } from "@/types";

export async function POST(request: Request) {
  const originBlock = requireSameOrigin(request);
  if (originBlock) return originBlock;

  const limited = await enforceRateLimit(
    request,
    "booking",
    RATE_LIMITS.booking.limit,
    RATE_LIMITS.booking.windowMs,
  );
  if (limited) return limited;

  try {
    const parsed = await parseJsonBody<Record<string, unknown>>(request);
    if (!parsed.ok) return parsed.response;

    if (isHoneypotTripped(parsed.body)) {
      return NextResponse.json({ success: true, id: "bk-accepted" });
    }

    const fullName = trimField(parsed.body.fullName, LIMITS.name);
    const emailRaw = trimField(parsed.body.email, LIMITS.email);
    const phone = trimField(parsed.body.phone, LIMITS.phone);
    const idNumberRaw = trimField(parsed.body.idNumber, LIMITS.idNumber) ?? "";
    const idNumber = idNumberRaw || "Provided on arrival";
    const date = trimField(parsed.body.date, 10);
    const time = trimField(parsed.body.time, 5);
    const boatId = trimField(parsed.body.boatId, LIMITS.boatId);
    const notes = trimField(parsed.body.notes ?? "", LIMITS.notes) ?? "";
    const localeRaw = trimField(parsed.body.locale, 5);
    const locale = localeRaw && isLocale(localeRaw) ? localeRaw : undefined;

    if (
      !fullName ||
      !emailRaw ||
      !phone ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        { error: "Please complete all required fields" },
        { status: 400 },
      );
    }

    const email = normalizeEmail(emailRaw);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (idNumberRaw && !isValidIdNumber(idNumberRaw)) {
      return NextResponse.json({ error: "Invalid ID / passport format" }, { status: 400 });
    }

    if (!isBookingDateInRange(date)) {
      return NextResponse.json(
        { error: "Date must be within the allowed booking window" },
        { status: 400 },
      );
    }

    if (!isValidTime(time)) {
      return NextResponse.json(
        { error: "Time must be between 08:00 and 20:00" },
        { status: 400 },
      );
    }

    if (boatId && !isValidEntityId(boatId)) {
      return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
    }

    const boat = boatId ? getBoatById(boatId) : null;
    if (boatId && !boat) {
      return NextResponse.json({ error: "Invalid boat" }, { status: 400 });
    }

    const guests = Number(parsed.body.guests);
    if (!Number.isInteger(guests) || guests < 1) {
      return NextResponse.json({ error: "Guests must be at least 1" }, { status: 400 });
    }

    if (boat && guests > boat.pax) {
      return NextResponse.json(
        { error: `Guests must be 1–${boat.pax} for this boat` },
        { status: 400 },
      );
    }

    if (!boat && guests > 10) {
      return NextResponse.json({ error: "Guests must be 1–10" }, { status: 400 });
    }

    const booking: BookingRequest = {
      id: newId("bk"),
      fullName,
      email,
      phone,
      idNumber,
      date,
      time,
      boatId: boatId || "",
      guests,
      routeId: "",
      notes,
      createdAt: new Date().toISOString(),
    };

    let persisted = false;
    try {
      if (hasRecentDuplicate(email, date, boatId || "any")) {
        return NextResponse.json(
          { error: "A similar booking was recently submitted" },
          { status: 409 },
        );
      }

      createBooking(booking);
      persisted = true;
    } catch (dbError) {
      console.error("[bookings] SQLite unavailable:", dbError);
    }

    const ownerEmail = await sendBookingNotificationEmail(booking);
    const guestEmail = await sendBookingConfirmationEmail(booking, locale);

    if (!guestEmail.ok) {
      return NextResponse.json(
        {
          error:
            guestEmail.error ||
            "Failed to send confirmation email. Please try again or call us.",
        },
        { status: 500 },
      );
    }

    if (!persisted && !ownerEmail.ok) {
      console.warn(
        "[bookings] saved via email only — DB:",
        !persisted,
        "owner:",
        ownerEmail.error,
      );
    }

    if (!ownerEmail.ok) {
      console.warn("[bookings] owner notification failed:", ownerEmail.error);
    }

    return NextResponse.json({ success: true, id: booking.id });
  } catch (error) {
    console.error("[bookings] unexpected failure:", error);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }
}
