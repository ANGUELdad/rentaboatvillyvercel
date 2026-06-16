"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { SafeImage } from "@/components/SafeImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  appleSpring,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { iconForKey, type SiteIconName } from "@/lib/site-icons";
import { useI18n } from "@/providers/LanguageProvider";

const CARD_ORDER = [
  "marina",
  "fleet",
  "fuel",
  "routes",
  "booking",
  "safety",
] as const;

type ExploreCardKey = (typeof CARD_ORDER)[number];

/** Boat & coastal imagery from project pool — no scuba/stock mismatches */
const panelImages: Partial<Record<ExploreCardKey, string>> = {
  marina:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
  fleet:
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=80",
  fuel:
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=900&q=80",
  routes:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  booking:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  safety:
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=900&q=80",
};

const hrefs: Record<ExploreCardKey, string> = {
  marina: "/map",
  fleet: "/fleet",
  safety: "/faq",
  fuel: "/booking",
  routes: "/map",
  booking: "/booking",
};

function ExploreCard({
  cardKey,
  title,
  desc,
  index,
  reduceMotion,
  safetyRules,
}: {
  cardKey: ExploreCardKey;
  title: string;
  desc: string;
  index: number;
  reduceMotion: boolean | null;
  safetyRules?: string[];
}) {
  const imageSrc = panelImages[cardKey];
  const icon = iconForKey(cardKey) as SiteIconName;
  const isSafety = cardKey === "safety";
  const isIconOnly = !imageSrc;

  const contentPadding = isSafety
    ? "gap-4 p-5 sm:p-6"
    : isIconOnly
      ? "gap-4 p-5 sm:p-6"
      : "gap-3 p-5 sm:p-5 lg:p-6";

  return (
    <Link href={hrefs[cardKey]} className="group block h-full">
      <motion.div
        whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={appleSpring}
        className={`glass-card layout-safe panel-fit h-full overflow-hidden rounded-2xl ${
          isSafety ? "ring-1 ring-ds-brand/30" : ""
        }`}
      >
        {imageSrc && (
          <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
            <SafeImage
              src={imageSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ds-base via-ds-base/35 to-transparent" />
            <span
              className="icon-badge absolute top-3 left-3 flex size-10 items-center justify-center"
            >
              <SiteIcon name={icon} size={18} />
            </span>
          </div>
        )}

        <div
          className={`flex min-w-0 flex-1 flex-col ${contentPadding}`}
        >
          {isIconOnly && (
            <span
              className="icon-badge flex size-11 items-center justify-center self-start"
            >
              <SiteIcon name={icon} size={20} />
            </span>
          )}

          <div className="min-w-0">
            <h3
              className={`font-semibold text-ds-text ${
                isSafety ? "text-lg sm:text-xl" : "text-base"
              }`}
            >
              {title}
            </h3>
            <p
              className={`mt-1.5 text-ds-text-secondary ${
                isSafety ? "text-sm sm:text-base" : "text-sm leading-relaxed"
              }`}
            >
              {desc}
            </p>
          </div>

          {isSafety && safetyRules && safetyRules.length > 0 && (
            <ul
              className="mt-1 grid grid-cols-2 gap-2.5"
              aria-label={title}
            >
              {safetyRules.slice(0, 4).map((rule) => (
                <li key={rule} className="flex min-w-0 items-start gap-2.5">
                  <span
                    className="icon-badge flex size-6 shrink-0 items-center justify-center"
                    aria-hidden
                  >
                    <SiteIcon
                      name="safety"
                      size={12}
                      className="text-ds-brand"
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-snug text-pretty text-ds-text [hyphens:auto]">
                    {rule}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {!isSafety && (
            <span className="icon-badge mt-auto flex size-9 items-center justify-center self-end opacity-80 transition-opacity group-hover:opacity-100">
              <SiteIcon name="sailboat" size={16} />
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export function ExploreGrid() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const skipMotion = reduceMotion;

  const grid = (
    <>
      <SectionHeader
        eyebrow={t.home.exploreEyebrow}
        title={t.home.exploreTitle}
        subtitle={t.home.exploreSubtitle}
        align="center"
        icon="marina"
        className="mb-10"
      />
      <div className="card-grid">
        {CARD_ORDER.map((key, i) => {
          const card = t.home.cards[key];
          if (!card) return null;

          return (
            <div key={key} className="min-w-0">
              <ExploreCard
                cardKey={key}
                title={card.title}
                desc={card.desc}
                index={i}
                reduceMotion={skipMotion}
                safetyRules={key === "safety" ? t.home.safetyRules : undefined}
              />
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <section className="relative w-full min-w-0">
      <div className="w-full min-w-0">
        {skipMotion ? (
          grid
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-32px 0px" }}
            variants={staggerContainer}
          >
            <motion.div variants={staggerItem}>
              <SectionHeader
                eyebrow={t.home.exploreEyebrow}
                title={t.home.exploreTitle}
                subtitle={t.home.exploreSubtitle}
                align="center"
                icon="marina"
                className="mb-10"
              />
            </motion.div>

            <div className="card-grid">
              {CARD_ORDER.map((key, i) => {
                const card = t.home.cards[key];
                if (!card) return null;

                return (
                  <motion.div
                    key={key}
                    variants={staggerItem}
                    className="min-w-0"
                  >
                    <ExploreCard
                      cardKey={key}
                      title={card.title}
                      desc={card.desc}
                      index={i}
                      reduceMotion={reduceMotion}
                      safetyRules={
                        key === "safety" ? t.home.safetyRules : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
