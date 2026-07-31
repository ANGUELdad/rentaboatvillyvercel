"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { appleSpringSoft, homeScrollViewport, staggerStep } from "@/lib/motion";
import { type SiteIconName } from "@/lib/site-icons";
import { cn } from "@/lib/utils";
import { FaqAnswerText } from "@/components/faq/FaqAnswerText";
import { getEnglishDictionary } from "@/lib/i18n/dictionary";
import type { SeoHomeSection } from "@/lib/i18n/types";
import { useI18n } from "@/providers/LanguageProvider";

const seoLinkIcons: Record<string, SiteIconName> = {
  "/rent-a-boat-thassos": "explore",
  "/fleet": "fleet",
  "/map": "map",
  "/guide": "guide",
  "/booking": "booking",
  "/faq": "faq",
  "/reviews": "reviews",
};

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

const headerVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: staggerStep, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: appleSpringSoft },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

function SectionBody({ section }: { section: SeoHomeSection }) {
  if (section.items?.length) {
    return (
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ds-text-secondary">
        {section.items.map((item) => (
          <li key={item}>
            <FaqAnswerText text={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-relaxed text-ds-text-secondary">
          <FaqAnswerText text={paragraph} />
        </p>
      ))}
    </div>
  );
}

/**
 * Crawlable copy targeting "rent a boat Thassos" and related long-tail queries.
 * Long-form detail lives in accordions (always in DOM); above-the-fold stays scannable.
 */
export function SeoHomeContent() {
  const { t } = useI18n();
  const content = t.seo.homeContent ?? getEnglishDictionary().seo.homeContent;
  const reduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const panelTransition = reduceMotion
    ? { duration: 0 }
    : { ...appleSpringSoft, opacity: { duration: 0.25 } };

  return (
    <section
      aria-labelledby="seo-home-heading"
      className="seo-home__content relative w-full min-w-0 box-border"
    >
      <article className="w-full min-w-0">
        <motion.div
          initial={false}
          whileInView="visible"
          viewport={homeScrollViewport}
          variants={reduceMotion ? headerVariantsReduced : headerVariants}
          className="seo-home__content-head mb-8 text-center sm:mb-10 lg:text-left"
        >
          <p className="section-eyebrow mb-3 inline-flex items-center justify-center gap-2 lg:justify-start">
            <span className="icon-badge flex size-7 items-center justify-center rounded-lg">
              <SiteIcon name="marina" size={14} />
            </span>
            {content.eyebrow}
          </p>
          <h2 id="seo-home-heading" className="section-title">
            {content.title}
          </h2>
          <p className="section-subtitle mx-auto mt-3 max-w-2xl lg:mx-0">{content.intro}</p>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={false}
          whileInView="visible"
          viewport={homeScrollViewport}
          variants={reduceMotion ? gridVariants : gridVariants}
        >
          {content.sections.map((section, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={section.title}
                variants={reduceMotion ? itemVariantsReduced : itemVariants}
                className="glass-card layout-safe overflow-hidden rounded-2xl border-ds-border/60"
              >
                <button
                  type="button"
                  id={`seo-section-q-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`seo-section-a-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="tap-target flex w-full min-h-[48px] items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-brand/50"
                >
                  <h3 className="min-w-0 flex-1 text-sm font-semibold text-ds-text sm:text-base">
                    {section.title}
                  </h3>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={reduceMotion ? { duration: 0 } : appleSpringSoft}
                    className="shrink-0 text-ds-text-secondary"
                    aria-hidden
                  >
                    <ChevronDown className="size-5" />
                  </motion.span>
                </button>

                <motion.div
                  id={`seo-section-a-${index}`}
                  role="region"
                  aria-labelledby={`seo-section-q-${index}`}
                  initial={false}
                  animate={
                    isOpen
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: reduceMotion ? 0 : 0.72 }
                  }
                  transition={panelTransition}
                  className="overflow-hidden"
                >
                  <div className="border-t border-ds-border px-5 py-4">
                    <SectionBody section={section} />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </article>
    </section>
  );
}

const LINK_ORDER = ["/booking", "/fleet", "/map", "/guide", "/faq", "/reviews"] as const;
const FEATURED_LINKS = ["/booking", "/fleet", "/guide"] as const;

function sortExploreLinks(links: { href: string; label: string }[]) {
  const order = new Map(LINK_ORDER.map((href, index) => [href, index]));
  return [...links].sort((a, b) => {
    const ai = order.get(a.href as (typeof LINK_ORDER)[number]) ?? 99;
    const bi = order.get(b.href as (typeof LINK_ORDER)[number]) ?? 99;
    return ai - bi;
  });
}

function pickFeaturedLinks(links: { href: string; label: string }[]) {
  const featured = new Map(FEATURED_LINKS.map((href) => [href, true]));
  return links.filter((link) => featured.has(link.href as (typeof FEATURED_LINKS)[number]));
}

/** Compact explore links — pinned to the bottom of the home page. */
export function SeoHomeLinksNav() {
  const { t } = useI18n();
  const content = t.seo.homeContent ?? getEnglishDictionary().seo.homeContent;
  const reduceMotion = useReducedMotion();
  const links = sortExploreLinks(content.links ?? []);
  const featuredLinks = pickFeaturedLinks(links);
  const remainingLinks = links.filter((link) => !FEATURED_LINKS.includes(link.href as (typeof FEATURED_LINKS)[number]));
  const eyebrow = content.linksEyebrow ?? content.eyebrow ?? "Explore";

  const Header = reduceMotion ? "div" : motion.div;

  return (
    <nav
      aria-label={content.linksAria}
      className="seo-home__explore relative w-full min-w-0 box-border"
    >
      <div className="seo-home__explore-panel layout-safe overflow-hidden rounded-2xl border border-ds-border/60 bg-ds-surface/95">
        <Header
          className="seo-home__explore-head"
          {...(!reduceMotion && {
            initial: { opacity: 0, y: 14 },
            whileInView: { opacity: 1, y: 0 },
            viewport: homeScrollViewport,
            transition: appleSpringSoft,
          })}
        >
          <p className="seo-home__explore-eyebrow">
            <SiteIcon name="explore" size={14} aria-hidden />
            {eyebrow}
          </p>
          <h3 className="seo-home__nav-title">{content.linksTitle}</h3>
          {content.linksSubtitle ? (
            <p className="seo-home__explore-sub">{content.linksSubtitle}</p>
          ) : null}
        </Header>

        <div className="seo-home__featured" aria-label={content.linksAria}>
          {featuredLinks.map((link, index) => {
            const icon = seoLinkIcons[link.href] ?? "explore";
            const isBooking = link.href === "/booking";
            const featuredClass = cn(
              "seo-home__featured-card",
              isBooking && "seo-home__featured-card--primary",
            );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={featuredClass}
                aria-label={link.label}
                data-featured={index === 0 ? "primary" : "secondary"}
              >
                <span className="seo-home__featured-icon" aria-hidden>
                  <SiteIcon name={icon} size={17} />
                </span>
                <span className="seo-home__featured-label">{link.label}</span>
                <ArrowRight className="seo-home__featured-arrow size-4 shrink-0" aria-hidden />
              </Link>
            );
          })}
        </div>

        <ul className="seo-home__links seo-home__links--unified" aria-label={content.linksAria}>
          {remainingLinks.map((link) => {
            const icon = seoLinkIcons[link.href] ?? "explore";
            const isBooking = link.href === "/booking";

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "seo-home__link tap-target group",
                    isBooking && "seo-home__link--cta",
                  )}
                >
                  <span className="seo-home__link-icon" aria-hidden>
                    <SiteIcon name={icon} size={15} />
                  </span>
                  <span className="seo-home__link-label">{link.label}</span>
                  <ArrowRight className="seo-home__link-arrow size-3.5 shrink-0" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
