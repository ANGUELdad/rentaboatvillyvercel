"use client";

import { Sparkles, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useConsentResolved } from "@/hooks/useConsentResolved";
import { playFeedback } from "@/lib/feedback";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";
import type { Offer } from "@/types";

const STORAGE_PREFIX = "tbc-offer-dismissed-";

export function OfferPopup({ offers }: { offers: Offer[] }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const consentResolved = useConsentResolved();
  const [active, setActive] = useState<Offer | null>(null);
  const onBoatDetail =
    pathname.startsWith("/fleet/") && pathname !== "/fleet";

  useEffect(() => {
    if (!consentResolved || onBoatDetail || pathname === "/") return;

    const eligible = offers.find((o) => {
      if (!o.enabled) return false;
      if (o.showOnce && sessionStorage.getItem(`${STORAGE_PREFIX}${o.id}`)) {
        return false;
      }
      return true;
    });

    if (!eligible) return;

    const timer = setTimeout(
      () => {
        setActive(eligible);
        playFeedback("notify", "light");
      },
      Math.max(eligible.delaySeconds ?? 12, 12) * 1000,
    );
    return () => clearTimeout(timer);
  }, [consentResolved, offers, onBoatDetail]);

  const dismiss = () => {
    playFeedback("dismiss", "light");
    if (active?.showOnce) {
      sessionStorage.setItem(`${STORAGE_PREFIX}${active.id}`, "1");
    }
    setActive(null);
  };

  if (!active) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss offer"
        data-sfx-skip
        onClick={dismiss}
        className="fixed inset-0 top-14 bg-black/50"
        style={{ zIndex: Z.offerBackdrop }}
      />
      <div
        className="pointer-events-none fixed inset-x-4 top-[50%] mx-auto max-w-md -translate-y-1/2 sm:inset-x-auto"
        style={{ zIndex: Z.offer }}
      >
        <div className="pointer-events-auto glass-panel overflow-hidden rounded-2xl border border-summer-gold/30 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="relative h-36">
            <Image
              src={active.image}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 to-transparent" />
            <span className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-summer-coral/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
              <Sparkles className="size-3" />
              {active.badge}
            </span>
            <button
              type="button"
              data-sfx-skip
              onClick={dismiss}
              className="absolute top-3 right-3 flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-ocean-950/80 text-white/70"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="p-5">
            <p className="text-[10px] tracking-[0.25em] text-ds-brand uppercase">
              {active.subtitle}
            </p>
            <h3 className="mt-1 text-xl font-light tracking-wide text-ds-text uppercase">
              {active.title}
            </h3>
            <p className="body-fit mt-2 text-sm text-ds-text-secondary">
              {active.description}
            </p>
            <div className="mt-5 flex gap-2">
              <Link
                href={active.ctaLink}
                onClick={dismiss}
                className="btn-app-primary min-h-[48px] flex-1"
              >
                {active.cta}
              </Link>
              <button
                type="button"
                data-sfx-skip
                onClick={dismiss}
                className="min-h-[48px] rounded-xl border border-ds-border px-4 text-[10px] tracking-[0.12em] text-ds-text-muted uppercase hover:text-ds-text"
              >
                {t.offers.later}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
