import type { BookingRequest } from "@/types";

interface BookingsPanelProps {
  bookings: BookingRequest[];
}

export function BookingsPanel({ bookings }: BookingsPanelProps) {
  if (bookings.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="mb-2 text-sm tracking-[0.15em] text-white uppercase">
          Bookings
        </h2>
        <p className="text-xs text-white/40">No booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6">
      <h2 className="mb-4 text-sm tracking-[0.15em] text-white uppercase">
        Bookings ({bookings.length})
      </h2>
      <div className="space-y-3">
        {[...bookings].reverse().map((booking) => (
          <div
            key={booking.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium text-white">{booking.fullName}</p>
              <p className="text-white/40">
                {booking.date} · {booking.time}
              </p>
            </div>
            <p className="mt-1 text-white/50">
              {booking.email} · {booking.phone}
            </p>
            <p className="mt-1 text-white/40">
              ID: {booking.idNumber} · {booking.guests} guests · {booking.boatId || "any boat"}
            </p>
            {booking.notes && (
              <p className="mt-2 text-white/35">{booking.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
