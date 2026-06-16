"use client";

import { HomeQuickNav } from "@/components/home/HomeQuickNav";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function HomeIntroDock() {
  return (
    <ScrollReveal as="div" className="home-intro-dock">
      <div className="home-section-inset">
        <HomeQuickNav />
      </div>
    </ScrollReveal>
  );
}
