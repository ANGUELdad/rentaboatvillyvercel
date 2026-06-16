"use client";

import { useState } from "react";
import { FleetVisualEditor } from "@/components/admin/FleetVisualEditor";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { JsonEditor } from "@/components/admin/JsonEditor";
import { MenuEditor } from "@/components/admin/MenuEditor";

const TABS = [
  { id: "menu", label: "Menu" },
  { id: "fleet", label: "Fleet" },
  { id: "gallery", label: "Gallery" },
  { id: "faq", label: "FAQ" },
  { id: "offers", label: "Offers" },
  { id: "legal", label: "Legal" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminContentPage() {
  const [tab, setTab] = useState<TabId>("menu");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Site content</h1>
        <p className="mt-1 text-sm text-white/45">
          Drag-and-drop editors for menu & gallery. Visual fleet forms. No code needed.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-[10px] tracking-[0.15em] uppercase transition-colors ${
              tab === t.id
                ? "bg-cyan-400/10 text-cyan-300"
                : "text-white/50 hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "menu" && <MenuEditor />}
      {tab === "fleet" && <FleetVisualEditor />}
      {tab === "gallery" && <GalleryEditor />}
      {tab === "faq" && <JsonEditor file="faq" title="FAQ (faq.json)" />}
      {tab === "offers" && (
        <JsonEditor file="offers" title="Offer popups (offers.json)" />
      )}
      {tab === "legal" && (
        <JsonEditor file="legal" title="Legal documents (legal.json)" />
      )}
    </div>
  );
}
