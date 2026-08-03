"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useConsentResolved } from "@/hooks/useConsentResolved";
import { mediaUrl } from "@/lib/bandwidth";
import { appleSpringSoft } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { useI18n } from "@/providers/LanguageProvider";

/* A centred dialog interrupts, so it has to earn the interruption: it waits
   for a visitor who is genuinely reading rather than bouncing, fires once, and
   never returns in the same session once dismissed.

   40s is past the point where most bounces have already left, so the people who
   see it are the ones still deciding — and it is early enough that they have
   not finished reading and drifted off. Scroll is the second trigger because a
   fast reader can reach the fleet in far less than 40s. */
const DWELL_MS = 40_000;
const SCROLLED_FRACTION = 0.5;
const DISMISS_KEY = "tbc-book-banner-dismissed";
const POSTER = mediaUrl("/images/boats/poseidon-sea.jpg");

export function BookNowBanner() {
  const { t } = useI18n();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const consentResolved = useConsentResolved();
  const [visible, setVisible] = useState(false);

  const onBookingRoute = pathname?.startsWith("/booking") ?? false;

  /* Tell the concierge chat to stand down while this is up. */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("tbc-book-banner", { detail: { visible } }),
    );
  }, [visible]);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode — dialog simply returns next session */
    }
  }, []);

  useEffect(() => {
    /* Wait for the consent bar to be gone — a dialog over a consent prompt
       would block the one thing the visitor legally has to answer first. */
    if (onBookingRoute || !consentResolved) return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }

    let dwellReached = false;
    let done = false;

    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
    };

    const pastHero = () => window.scrollY > window.innerHeight * 0.8;

    const onScroll = () => {
      if (!pastHero()) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const fraction = scrollable > 0 ? window.scrollY / scrollable : 0;
      if (dwellReached || fraction > SCROLLED_FRACTION) reveal();
    };

    const timer = window.setTimeout(() => {
      dwellReached = true;
      onScroll();
    }, DWELL_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onBookingRoute, consentResolved]);

  /* Escape closes it, like any dialog. */
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  if (onBookingRoute) return null;

  const label = t.nav?.bookNow ?? "Book now";
  const title = t.nav?.bookBannerTitle ?? "Ready for your day on the water?";
  const message =
    t.nav?.bookBannerText ?? "Boats go fast in high season — check your date.";
  const dismissLabel = t.common?.dismiss ?? "Dismiss";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 grid place-items-center p-4"
          style={{ zIndex: Z.bookBanner }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
        >
          {/* Scrim — clicking anywhere off the card dismisses. */}
          <button
            type="button"
            aria-label={dismissLabel}
            onClick={dismiss}
            className="absolute inset-0 h-full w-full cursor-default bg-[#001133]/55 backdrop-blur-[3px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduceMotion ? false : { scale: 0.9, y: 18, opacity: 0 }}
            animate={reduceMotion ? undefined : { scale: 1, y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.94, y: 10, opacity: 0 }}
            transition={appleSpringSoft}
            className="relative w-full max-w-[21rem] overflow-hidden rounded-[1.75rem] bg-white shadow-[0_40px_90px_-20px_rgba(0,17,51,0.65)] sm:max-w-sm"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label={dismissLabel}
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/55"
            >
              <X className="size-[18px]" aria-hidden />
            </button>

            <div className="relative aspect-[4/3] w-full">
              <Image
                src={POSTER}
                alt=""
                fill
                sizes="(max-width: 640px) 90vw, 24rem"
                className="object-cover object-center"
                aria-hidden
              />
            </div>

            <div className="px-5 pb-5 pt-4 text-center">
              <p className="text-[19px] font-semibold leading-snug tracking-[-0.015em] text-ds-text sm:text-[21px]">
                {title}
              </p>
              <p className="mx-auto mt-1.5 max-w-[19rem] text-[13.5px] leading-snug text-ds-text-secondary">
                {message}
              </p>

              <Link
                href="/booking"
                onClick={dismiss}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#7cd143] to-[var(--color-brand-green)] px-4 text-[16px] font-semibold leading-none tracking-[-0.01em] text-white ring-1 ring-inset ring-white/25 [box-shadow:0_1px_2px_rgba(0,0,0,0.18),0_10px_24px_-6px_color-mix(in_srgb,var(--color-brand-green)_65%,transparent)] transition-[filter,transform] duration-200 hover:brightness-[1.04] active:scale-[0.985]"
              >
                {label}
                <ArrowRight className="size-[18px] shrink-0" aria-hidden />
              </Link>

              <button
                type="button"
                onClick={dismiss}
                className="mt-2.5 min-h-9 w-full text-[13px] font-medium text-ds-text-muted transition-colors hover:text-ds-text"
              >
                {dismissLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
