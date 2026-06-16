"use client";

import { SlidersHorizontal } from "lucide-react";
import { YachtListCard } from "@/components/yacht/YachtListCard";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

export function FleetListView({ boats }: { boats: PublicBoat[] }) {
  const { t } = useI18n();
  const ui = t.yachtUi?.results ?? {
    count: "{count} Results",
    sort: "Sort by relevance",
  };

  return (
    <div className="space-y-4">
      <div className="app-panel flex flex-wrap items-center justify-between gap-3 py-3">
        <p className="text-sm font-semibold text-ds-text">
          {ui.count.replace("{count}", String(boats.length))}
        </p>
        <span className="inline-flex items-center gap-2 text-[11px] text-ds-text-muted">
          <SlidersHorizontal className="size-3.5 text-app-teal" />
          {ui.sort}
        </span>
      </div>

      <div className="space-y-3">
        {boats.map((boat, index) => (
          <YachtListCard key={boat.id} boat={boat} index={index} />
        ))}
      </div>
    </div>
  );
}
