"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

export function StickyBookBar({ boat }: { boat: PublicBoat }) {
  const { t } = useI18n();
  const cta =
    t.conversion?.boatDetail?.checkAvailability ?? t.hero?.cta ?? t.nav.bookNow;

  return (
    <div
      className="fixed inset-x-0 bottom-0 border-t border-ds-border bg-ds-base/95 py-3 backdrop-blur-xl sm:hidden"
      style={{
        zIndex: Z.stickyBar,
        paddingInline: "max(1rem, env(safe-area-inset-left, 0px)) max(1rem, env(safe-area-inset-right, 0px))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
      }}
      role="region"
      aria-label={cta}
    >
      <div className="mx-auto max-w-lg">
        <Link
          href={`/booking?boat=${boat.id}`}
          className="btn-app-primary ui-btn-label inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
        >
          {cta}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
