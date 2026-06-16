import { getAllBookings } from "@/lib/db/bookings";

/** Count bookings created within the last N days (server-only). */
export function getRecentBookingCount(days = 7): number {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString();
    return getAllBookings().filter((b) => b.createdAt >= cutoffIso).length;
  } catch {
    return 0;
  }
}
