import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ocean-950 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-lg font-light tracking-[0.15em] text-white uppercase">
            Admin Panel
          </h1>
          <p className="mt-1 text-xs text-white/40">
            Bookings · Blog · GDPR · Content
          </p>
        </div>
        <AdminNav />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
