import { getDb } from "./index";
import type { BookingRequest } from "@/types";

function rowToBooking(row: Record<string, unknown>): BookingRequest {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: row.phone as string,
    idNumber: row.id_number as string,
    date: row.date as string,
    time: row.time as string,
    boatId: row.boat_id as string,
    guests: row.guests as number,
    routeId: row.route_id as string,
    notes: row.notes as string,
    createdAt: row.created_at as string,
  };
}

export function getAllBookings(): BookingRequest[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM bookings ORDER BY created_at DESC")
    .all();
  return rows.map((r) => rowToBooking(r as Record<string, unknown>));
}

export function hasRecentDuplicate(
  email: string,
  date: string,
  boatId: string,
  windowMinutes = 5,
): boolean {
  const db = getDb();
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const row = db
    .prepare(
      `SELECT id FROM bookings
       WHERE email = ? AND date = ? AND boat_id = ? AND created_at > ?
       LIMIT 1`,
    )
    .get(email, date, boatId, cutoff);
  return !!row;
}

export function createBooking(
  booking: Omit<BookingRequest, "id" | "createdAt"> & {
    id: string;
    createdAt: string;
  },
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO bookings (id, full_name, email, phone, id_number, date, time, boat_id, guests, route_id, notes, created_at)
    VALUES (@id, @full_name, @email, @phone, @id_number, @date, @time, @boat_id, @guests, @route_id, @notes, @created_at)
  `).run({
    id: booking.id,
    full_name: booking.fullName,
    email: booking.email,
    phone: booking.phone,
    id_number: booking.idNumber,
    date: booking.date,
    time: booking.time,
    boat_id: booking.boatId,
    guests: booking.guests,
    route_id: booking.routeId,
    notes: booking.notes,
    created_at: booking.createdAt,
  });
}
