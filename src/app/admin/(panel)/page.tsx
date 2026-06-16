import Link from "next/link";
import { getAllBookings } from "@/lib/db/bookings";
import { getAllArticles } from "@/lib/db/blog";
import { getConsentLogs, getGdprRequests } from "@/lib/db/gdpr";

export default function AdminDashboard() {
  const bookings = getAllBookings();
  const articles = getAllArticles();
  const consents = getConsentLogs(10);
  const gdprRequests = getGdprRequests();
  const pendingGdpr = gdprRequests.filter((r) => r.status === "pending");

  const cards = [
    {
      label: "Bookings",
      value: bookings.length,
      href: "/admin/bookings",
    },
    {
      label: "Blog articles",
      value: articles.length,
      href: "/admin/blog",
    },
    {
      label: "Pending GDPR",
      value: pendingGdpr.length,
      href: "/admin/gdpr",
    },
    {
      label: "Consent logs",
      value: consents.length,
      href: "/admin/gdpr",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="glass-panel rounded-2xl p-6 transition-colors hover:border-cyan-400/20"
        >
          <p className="text-[10px] tracking-[0.2em] text-white/40 uppercase">
            {card.label}
          </p>
          <p className="mt-2 text-3xl font-light text-white">{card.value}</p>
        </Link>
      ))}
    </div>
  );
}
