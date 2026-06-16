"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Phone, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { LanguagePicker } from "./LanguagePicker";
import { Logo } from "./Logo";
import { SITE_CONTACT } from "@/lib/site";
import { appleSpring, staggerStep } from "@/lib/motion";
import { iconForKey } from "@/lib/site-icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useI18n } from "@/providers/LanguageProvider";
import { useNavItems } from "@/providers/NavProvider";
import { playFeedback } from "@/lib/feedback";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function NavRow({
  href,
  label,
  iconKey,
  active,
  onClick,
  index = 0,
}: {
  href: string;
  label: string;
  iconKey: string;
  active: boolean;
  onClick: () => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...appleSpring, delay: index * staggerStep }}
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "mobile-nav-2026__row tap-target",
          active && "mobile-nav-2026__row--active",
        )}
      >
        <span className="mobile-nav-2026__row-icon" aria-hidden>
          <SiteIcon name={iconForKey(iconKey)} size={17} />
        </span>
        <span className="mobile-nav-2026__row-label">{label}</span>
        <ChevronRight className="mobile-nav-2026__row-chevron size-4 shrink-0" aria-hidden />
      </Link>
    </motion.div>
  );
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const navItems = useNavItems();

  const explore =
    navItems.length > 0
      ? navItems.map((item) => ({
          href: item.href,
          label: (t.nav as Record<string, string>)[item.labelKey] ?? item.labelKey,
          key: item.icon ?? item.id,
        }))
      : [
          { href: "/fleet", label: t.nav.fleet, key: "fleet" },
          { href: "/map", label: t.nav.routes, key: "map" },
          { href: "/guide", label: t.nav.guide, key: "guide" },
          { href: "/reviews", label: t.nav.reviews, key: "reviews" },
        ];

  const company = [{ href: "/faq", label: t.nav.faq, key: "faq" }];

  const close = () => onOpenChange(false);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.setAttribute("data-mobile-nav-open", "");
    } else {
      root.removeAttribute("data-mobile-nav-open");
    }
    return () => root.removeAttribute("data-mobile-nav-open");
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next && open) playFeedback("dismiss", "light");
    onOpenChange(next);
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mobile-nav-2026 mobile-nav-sheet border-0 bg-transparent p-0 shadow-none"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={appleSpring}
          className="mobile-nav-2026__panel flex h-full min-h-0 flex-col"
        >
          <div className="mobile-nav-2026__grab" aria-hidden />

          <SheetHeader className="mobile-nav-2026__header">
            <SheetTitle className="sr-only">
              {t.common.navMenu ?? "Navigation menu"}
            </SheetTitle>
            <div className="mobile-nav-2026__header-row">
              <div className="min-w-0">
                <Logo size="xs" className="shrink-0" />
                <p className="mobile-nav-2026__tagline">
                  {t.seo?.siteName ?? "Rent A Boat Villy"} · Limenaria
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="mobile-nav-2026__close tap-target"
                aria-label={t.common.closeMenu ?? "Close menu"}
              >
                <X className="size-5" />
              </button>
            </div>
          </SheetHeader>

          <div className="mobile-nav-2026__quick-dock">
            <div className="mobile-nav-2026__quick-phones">
              <motion.a
                href={`tel:${SITE_CONTACT.phoneTel}`}
                whileTap={{ scale: 0.97 }}
                transition={appleSpring}
                className="mobile-nav-2026__quick-item tap-target"
                aria-label={
                  t.common.callPhone?.replace("{phone}", SITE_CONTACT.phone) ??
                  SITE_CONTACT.phone
                }
              >
                <span className="mobile-nav-2026__quick-icon" aria-hidden>
                  <Phone className="size-4" />
                </span>
                <span className="mobile-nav-2026__quick-text">{SITE_CONTACT.phone}</span>
              </motion.a>
              <motion.a
                href={`tel:${SITE_CONTACT.phone2Tel}`}
                whileTap={{ scale: 0.97 }}
                transition={appleSpring}
                className="mobile-nav-2026__quick-item tap-target"
                aria-label={
                  t.common.callPhone?.replace("{phone}", SITE_CONTACT.phone2) ??
                  SITE_CONTACT.phone2
                }
              >
                <span className="mobile-nav-2026__quick-icon" aria-hidden>
                  <Phone className="size-4" />
                </span>
                <span className="mobile-nav-2026__quick-text">{SITE_CONTACT.phone2}</span>
              </motion.a>
            </div>
            <div className="mobile-nav-2026__quick-lang">
              <LanguagePicker variant="footer" />
            </div>
          </div>

          <nav className="mobile-nav-2026__body orientation-fill min-h-0 flex-1 overflow-y-auto">
            <div className="mobile-nav-2026__menu-card">
              <p className="mobile-nav-2026__section-label">{t.footer.explore}</p>
              <div className="mobile-nav-2026__list">
                {explore.map((item, i) => (
                  <NavRow
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    iconKey={item.key}
                    active={isActive(item.href)}
                    onClick={close}
                    index={i}
                  />
                ))}
              </div>

              <div className="mobile-nav-2026__menu-divider" aria-hidden />

              <p className="mobile-nav-2026__section-label">{t.footer.company}</p>
              <div className="mobile-nav-2026__list">
                {company.map((item, i) => (
                  <NavRow
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    iconKey={item.key}
                    active={isActive(item.href)}
                    onClick={close}
                    index={explore.length + i}
                  />
                ))}
              </div>
            </div>
          </nav>

          <div className="mobile-nav-2026__footer">
            <Link
              href="/booking"
              onClick={close}
              className="mobile-nav-2026__cta btn-app-primary ui-btn-label tap-target"
            >
              <SiteIcon name="booking" size={18} className="text-ds-base" />
              <span>{t.nav.bookNow}</span>
              <ArrowRight className="size-4 shrink-0 opacity-90" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
