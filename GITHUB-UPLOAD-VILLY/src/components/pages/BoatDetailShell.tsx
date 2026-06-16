"use client";

import { motion } from "framer-motion";
import { Check, Ship, Users } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  BoatGallery,
  type BoatGalleryHandle,
} from "@/components/yacht/BoatGallery";
import { BoatSpecPill } from "@/components/yacht/BoatSpecPill";
import { ContentRow } from "@/components/ui/ContentRow";
import { StickyBookBar } from "@/components/yacht/StickyBookBar";
import { boatsToContentRowItems } from "@/lib/content-row/mappers";
import { getAmenityIcon } from "@/lib/boat-amenities";
import { FaqAccordion } from "@/components/conversion/FaqAccordion";
import { TrustBar } from "@/components/conversion/TrustBar";
import { ui2026RevealChild, ui2026Stagger } from "@/lib/motion";
import { useI18n } from "@/providers/LanguageProvider";
import type { PublicBoat } from "@/types";

const DESC_CLAMP = 160;

export function BoatDetailShell({
  boat,
  related,
}: {
  boat: PublicBoat;
  related: PublicBoat[];
}) {
  const { t } = useI18n();
  const d = t.boatDetail;
  const cv = t.conversion;
  const faqItems = t.faq?.items?.slice(0, 4) ?? [];
  const gallery = boat.gallery ?? [boat.image];
  const galleryRef = useRef<BoatGalleryHandle>(null);
  const [expanded, setExpanded] = useState(false);

  const description = boat.longDescription ?? boat.description;
  const needsClamp = description.length > DESC_CLAMP;
  const displayDesc =
    expanded || !needsClamp
      ? description
      : `${description.slice(0, DESC_CLAMP).trim()}…`;

  const typeLabel = boat.tagline ?? t.package?.eyebrow ?? "Boat rental";
  const guestLabel = `${boat.pax} ${d.guests}`;

  const includedItems = (cv?.package?.included ?? []).filter(
    (item: string, index: number, items: string[]) => {
      const isSafetyGear = /safety gear/i.test(item);
      if (!isSafetyGear) return true;
      const firstSafetyIndex = items.findIndex((entry) =>
        /safety gear/i.test(entry),
      );
      return index === firstSafetyIndex;
    },
  );

  return (
    <div className="ui-2026-page boat-detail-page bg-ds-base pb-28 sm:pb-8">
      <BoatGallery
        ref={galleryRef}
        images={gallery}
        alt={boat.name}
        backLabel={d.back ?? "Back"}
        pageTitle={d.pageTitle ?? "Details"}
        shareLabel={d.share ?? "Share"}
        linkCopiedLabel={d.linkCopied ?? "Link copied"}
        prevLabel={t.gallery?.prev ?? "Previous"}
        nextLabel={t.gallery?.next ?? "Next"}
        shareTitle={boat.name}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div
          variants={ui2026Stagger}
          initial="hidden"
          animate="visible"
          className="boat-detail-page__card p-4 sm:p-8"
        >
          <motion.div variants={ui2026RevealChild}>
            <h1 className="text-2xl font-bold leading-tight text-ds-text sm:text-3xl">
              {boat.name}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-ds-brand">
              {d.location ?? "Limenaria, Thassos"}
            </p>
            <p className="mt-2 text-xs text-ds-text-muted">{cv?.popularSeason}</p>
            <TrustBar compact className="mt-3" />
          </motion.div>

          <motion.section variants={ui2026RevealChild} className="mt-6">
            <h2 className="text-base font-bold text-ds-text">
              {d.descriptionTitle ?? "Description"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ds-text-secondary">
              {displayDesc}
              {needsClamp && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="ml-1 font-medium text-ds-brand hover:underline"
                >
                  {expanded
                    ? (d.showLess ?? "Show less")
                    : (d.showMore ?? "Show more")}
                </button>
              )}
            </p>
          </motion.section>

          <motion.section variants={ui2026RevealChild} className="mt-7">
            <h2 className="text-base font-bold text-ds-text">
              {d.specifications ?? "Specifications"}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2.5">
              <BoatSpecPill icon={Ship} label={typeLabel} />
              <BoatSpecPill icon={Users} label={guestLabel} />
            </div>
          </motion.section>

          <motion.section variants={ui2026RevealChild} className="mt-8">
            <div className="boat-detail-page__price">
              <p className="boat-detail-page__price-label ui-text-fit">
                {d.contactForRates ??
                  "Contact us for rates — call +30 698 131 8393 or visit our office at New Port of Limenaria."}
              </p>
              {boat.tagline && (
                <p className="boat-detail-page__price-meta">{boat.tagline}</p>
              )}
              {includedItems.length > 0 && (
                <ul className="boat-detail-page__price-includes">
                  {includedItems.map((item: string) => (
                    <li key={item} className="boat-detail-page__price-include">
                      <Check
                        className="boat-detail-page__price-check size-4"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/booking?boat=${boat.id}`}
                className="btn-app-primary boat-detail-page__price-cta tap-target flex h-12 min-h-[48px] w-full items-center justify-center rounded-full text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:scale-[0.98]"
              >
                {cv?.boatDetail?.checkAvailability ?? t.nav.bookNow}
              </Link>
            </div>
          </motion.section>

          {boat.amenities && boat.amenities.length > 0 && (
            <motion.section variants={ui2026RevealChild} className="mt-8">
              <h2 className="text-base font-bold text-ds-text">{d.features}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {boat.amenities.map((amenity) => {
                  const Icon = getAmenityIcon(amenity.id);
                  return (
                    <BoatSpecPill
                      key={amenity.id}
                      icon={Icon}
                      label={amenity.label}
                    />
                  );
                })}
              </div>
            </motion.section>
          )}

          {gallery.length > 1 && (
            <motion.section variants={ui2026RevealChild} className="mt-8">
              <h2 className="mb-3 text-base font-bold text-ds-text">
                {d.gallery}
              </h2>
              <p className="mb-3 text-xs text-ds-text-muted">
                {d.swipeHint ?? "Swipe the gallery above or tap a thumbnail"}
              </p>
              <div className="flex min-w-0 gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => galleryRef.current?.scrollTo(i, false)}
                    className="boat-detail-page__thumb"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="size-full object-cover"
                      loading="lazy"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          <motion.div variants={ui2026RevealChild}>
            <FaqAccordion
              items={faqItems}
              title={cv?.boatDetail?.faqTitle ?? t.nav.faq}
              className="mt-8"
            />
          </motion.div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div className="boat-detail-page__related">
          <ContentRow
            title={d.relatedTitle}
            subtitle={d.relatedSubtitle}
            href="/fleet"
            linkLabel={t.fleetGrid.fullFleet}
            data={boatsToContentRowItems(related)}
            size="large"
          />
        </div>
      )}

      <StickyBookBar boat={boat} />
    </div>
  );
}
