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

function errorResponse(status: number, error: string, code: string) {
  return NextResponse.json({ error, code }, { status });
}

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
      return errorResponse(400, "Please complete all required fields", "missing_required_fields");
    }

    const email = normalizeEmail(emailRaw);

    if (!isValidEmail(email)) {
      return errorResponse(400, "Invalid email address", "invalid_email");
    }

    if (!isValidPhone(phone)) {
      return errorResponse(400, "Invalid phone number", "invalid_phone");
    }

    if (idNumberRaw && !isValidIdNumber(idNumberRaw)) {
      return errorResponse(400, "Invalid ID / passport format", "invalid_id_number");
    }

    if (!isBookingDateInRange(date)) {
      return errorResponse(400, "Date must be within the allowed booking window", "invalid_date");
    }

    if (!isValidTime(time)) {
      return errorResponse(400, "Time must be between 08:00 and 20:00", "invalid_time");
    }

    if (boatId && !isValidEntityId(boatId)) {
      return errorResponse(400, "Invalid selection", "invalid_boat_selection");
    }

    const boat = boatId ? getBoatById(boatId) : null;
    if (boatId && !boat) {
      return errorResponse(400, "Invalid boat", "invalid_boat");
    }

    const guests = Number(parsed.body.guests);
    if (!Number.isInteger(guests) || guests < 1) {
      return errorResponse(400, "Guests must be at least 1", "invalid_guests");
    }

    if (boat && guests > boat.pax) {
      return errorResponse(
        400,
        `Guests must be 1–${boat.pax} for this boat`,
        "guests_exceed_capacity",
      );
    }

    if (!boat && guests > 10) {
      return errorResponse(400, "Guests must be 1–10", "invalid_guest_range");
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
        return errorResponse(409, "A similar booking was recently submitted", "duplicate_booking");
      }

      createBooking(booking);
      persisted = true;
    } catch (dbError) {
      console.error("[bookings] SQLite unavailable:", dbError);
    }

    const ownerEmail = await sendBookingNotificationEmail(booking);
    const guestEmail = await sendBookingConfirmationEmail(booking, locale);

    if (!persisted && !ownerEmail.ok && !guestEmail.ok) {
      return errorResponse(
        500,
        "Failed to save booking and send notification",
        "notification_failed",
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

    const warningCode = !guestEmail.ok ? "guest_email_failed" : undefined;
    if (!guestEmail.ok) {
      console.warn("[bookings] guest confirmation failed:", guestEmail.error);
    }

    return NextResponse.json({ success: true, id: booking.id, code: warningCode });
  } catch (error) {
    console.error("[bookings] unexpected failure:", error);
    return errorResponse(500, "Failed to save booking", "server_error");
  }
}
