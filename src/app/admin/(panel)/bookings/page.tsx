import { BookingsPanel } from "@/components/admin/BookingsPanel";
import { getAllBookings } from "@/lib/db/bookings";

export default function AdminBookingsPage() {
  const bookings = getAllBookings();
  return <BookingsPanel bookings={bookings} />;
}
