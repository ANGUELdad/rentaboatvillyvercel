"use client";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { STATIC_NAV } from "@/lib/nav-static";
import { NavProvider } from "@/providers/NavProvider";

export function SiteErrorChrome({ children }: { children: React.ReactNode }) {
  return (
    <NavProvider items={STATIC_NAV.items}>
      <Header />
      <main className="pt-[4.5rem] pb-fab-clearance lg:pt-16 xl:pt-[4.5rem]">
        {children}
      </main>
      <Footer />
    </NavProvider>
  );
}
