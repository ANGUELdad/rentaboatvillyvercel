"use client";

import { SiteIcon } from "@/components/ui/SiteIcon";
import Link from "next/link";
import { useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";
import { DateField } from "@/components/ui/DateField";
import { useI18n } from "@/providers/LanguageProvider";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function YachtSearchCard({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const s = t.yachtUi?.search ?? {
    title: "Search",
    location: "Location",
    locationValue: "New Port of Limenaria, Thassos",
    from: "From",
    to: "To",
    cta: "Search boats",
  };

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const minDate = todayIso();

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const href = `/booking${qs.toString() ? `?${qs}` : ""}`;

  return (
    <div className={`app-panel overflow-safe ${className || "mb-8"}`}>
      <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-ds-text sm:text-xl">
        <AppIcon name="search" size="sm" />
        {s.title}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="app-label mb-2 flex items-center gap-1.5">
            <SiteIcon name="marina" size={14} className="text-ds-brand" />
            {s.location}
          </label>
          <div className="app-input flex min-h-[52px] min-w-0 items-center gap-3 overflow-hidden px-4 text-sm text-ds-text">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/12 text-brand-green">
              <SiteIcon name="marina" size={16} />
            </span>
            <span className="min-w-0 truncate">{s.locationValue}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DateField
            label={s.from}
            value={from}
            onChange={setFrom}
            min={minDate}
            placeholder="Select start date"
          />
          <DateField
            label={s.to}
            value={to}
            onChange={setTo}
            min={from || minDate}
            placeholder="Select end date"
          />
        </div>

        <Link href={href} className="btn-app-primary btn-responsive ui-btn-label inline-flex items-center justify-center gap-2 leading-none">
          <SiteIcon name="search" size={16} className="text-ds-base" />
          {s.cta}
        </Link>
      </div>
    </div>
  );
}
