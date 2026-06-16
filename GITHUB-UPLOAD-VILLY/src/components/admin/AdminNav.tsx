"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/gdpr", label: "GDPR" },
  { href: "/admin/content", label: "Content" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* proceed to login even if network fails */
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-6">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors ${
              active
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-white/50 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="ml-auto flex gap-2">
        <Link
          href="/"
          className="rounded-xl px-4 py-2 text-[10px] tracking-[0.15em] text-white/30 uppercase hover:text-cyan-300"
        >
          ← Site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl px-4 py-2 text-[10px] tracking-[0.15em] text-white/30 uppercase hover:bg-white/5 hover:text-white/70"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
