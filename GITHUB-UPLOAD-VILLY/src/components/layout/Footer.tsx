"use client";

import { motion } from "framer-motion";
import { SoundMuteToggle } from "@/components/feedback/SoundMuteToggle";
import { CookieSettingsButton } from "@/components/gdpr/CookieConsent";
import { SiteIcon } from "@/components/ui/SiteIcon";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/config";
import { LanguagePicker } from "./LanguagePicker";
import { Logo } from "./Logo";
import { appleSpring, staggerStep } from "@/lib/motion";
import type { SiteIconName } from "@/lib/site-icons";
import { useI18n } from "@/providers/LanguageProvider";
import { SITE_CONTACT, MARINA_LOCATION } from "@/lib/site";

export function Footer() {
  const { t } = useI18n();
  const f = t.footer;

  const explore: { href: string; label: string; icon: SiteIconName }[] = [
    { href: "/rent-a-boat-thassos", label: f.rentBoatThassos ?? "Rent a boat in Thassos", icon: "explore" },
    { href: "/fleet", label: f.fleet, icon: "fleet" },
    { href: "/map", label: f.map, icon: "map" },
    { href: "/guide", label: f.guide, icon: "guide" },
    { href: "/reviews", label: f.reviews, icon: "reviews" },
    { href: "/booking", label: f.book, icon: "booking" },
  ];

  const company: { href: string; label: string; icon: SiteIconName }[] = [
    { href: "/faq", label: f.faq ?? t.nav.faq, icon: "faq" },
    { href: "/privacy", label: f.privacy, icon: "safety" },
    { href: "/terms", label: f.terms, icon: "blog" },
    { href: "/cookies", label: f.cookies, icon: "explore" },
    { href: "/gdpr", label: f.gdpr, icon: "safety" },
  ];

  const trust: { icon: SiteIconName; label: string }[] = [
    { icon: "fleet", label: t.fleet.stat1 },
    { icon: "safety", label: f.trustFuel ?? "Fuel not included" },
    { icon: "safety", label: t.fleet.stat3 },
    { icon: "clock", label: f.hours ?? "Daily 08:00 – 20:00" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-ds-border bg-ds-base">
      <div className="relative mx-auto w-full max-w-7xl min-w-0 box-border px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-ds-border pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md min-w-0">
            <Logo size="xl" />
            <p className="mt-4 text-sm leading-relaxed text-ds-text-secondary">
              {f.tagline}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`tel:${SITE_CONTACT.phoneTel}`}
              className="btn-app-secondary ui-text-fit inline-flex min-h-[48px] min-w-0 max-w-full items-center justify-center gap-2 px-6"
            >
              <SiteIcon name="phone" size={16} className="text-ds-brand" />
              {SITE_CONTACT.phone}
            </a>
            <a
              href={`tel:${SITE_CONTACT.phone2Tel}`}
              className="btn-app-secondary ui-text-fit inline-flex min-h-[48px] min-w-0 max-w-full items-center justify-center gap-2 px-6"
            >
              <SiteIcon name="phone" size={16} className="text-ds-brand" />
              {SITE_CONTACT.phone2}
            </a>
            <Link
              href="/booking"
              className="btn-app-primary ui-btn-label inline-flex min-h-[48px] items-center justify-center gap-2 px-8"
            >
              <SiteIcon name="booking" size={16} className="text-ds-base" />
              {f.cta ?? t.nav.bookNow}
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="section-eyebrow mb-4">{f.explore ?? "Explore"}</p>
            <ul className="space-y-1">
              {explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex min-h-[40px] items-center gap-2.5 rounded-lg px-2 text-sm text-ds-text-secondary transition-colors hover:bg-ds-surface/40 hover:text-ds-text"
                  >
                    <SiteIcon
                      name={link.icon}
                      size={16}
                      className="shrink-0 text-ds-text-muted transition-colors group-hover:text-ds-brand"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="section-eyebrow mb-4">{f.company ?? "Company"}</p>
            <ul className="space-y-1">
              {company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex min-h-[40px] items-center gap-2.5 rounded-lg px-2 text-sm text-ds-text-secondary transition-colors hover:bg-ds-surface/40 hover:text-ds-text"
                  >
                    <SiteIcon
                      name={link.icon}
                      size={16}
                      className="shrink-0 text-ds-text-muted transition-colors group-hover:text-ds-brand"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className="flex min-h-[40px] items-center rounded-lg px-2 text-sm text-ds-text-secondary transition-colors hover:bg-ds-surface/40 hover:text-ds-text" />
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className="section-eyebrow mb-4">{f.contact ?? "Contact"}</p>
            <ul className="space-y-2 text-sm text-ds-text-secondary">
              <li className="flex items-start gap-2.5 rounded-lg px-2 py-1">
                <SiteIcon
                  name="marina"
                  size={16}
                  className="mt-0.5 shrink-0 text-ds-brand"
                />
                <a
                  href={MARINA_LOCATION.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-line transition-colors hover:text-ds-text"
                >
                  {f.marina ?? SITE_CONTACT.marina}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_CONTACT.phoneTel}`}
                  className="contact-line flex min-h-[40px] min-w-0 items-center gap-2.5 rounded-lg px-2 transition-colors hover:bg-ds-surface/40 hover:text-ds-text"
                >
                  <SiteIcon name="phone" size={16} className="shrink-0 text-ds-brand" />
                  {SITE_CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_CONTACT.phone2Tel}`}
                  className="contact-line flex min-h-[40px] min-w-0 items-center gap-2.5 rounded-lg px-2 transition-colors hover:bg-ds-surface/40 hover:text-ds-text"
                >
                  <SiteIcon name="phone" size={16} className="shrink-0 text-ds-brand" />
                  {SITE_CONTACT.phone2}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="contact-line flex min-h-[40px] min-w-0 items-center gap-2.5 rounded-lg px-2 transition-colors hover:bg-ds-surface/40 hover:text-ds-text"
                >
                  <SiteIcon name="mail" size={16} className="shrink-0 text-ds-brand" />
                  {SITE_CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="section-eyebrow mb-4">
              {t.common?.language ?? "Language"}
            </p>
            <LanguagePicker variant="footer" />
          </div>
        </div>

        <div className="footer-bottom border-t border-ds-border pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-ds-text-muted">
              © {new Date().getFullYear()} {SITE_NAME}
            </p>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
              <SoundMuteToggle />
              <p className="contact-line text-sm text-ds-text-muted">
                {f.locationLine ?? "New Port of Limenaria · Thassos · Greece"}
              </p>
            </div>
          </div>

          <motion.div
            className="footer-trust-strip"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={appleSpring}
            role="list"
            aria-label={f.trustAria ?? "Trust highlights"}
          >
            {trust.map(({ icon, label }, i) => (
              <motion.span
                key={label}
                role="listitem"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ ...appleSpring, delay: i * staggerStep }}
                className="footer-trust-chip"
              >
                <SiteIcon name={icon} size={12} className="shrink-0 text-ds-brand" aria-hidden />
                <span>{label}</span>
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
