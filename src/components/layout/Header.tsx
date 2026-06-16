"use client";

import { motion } from "framer-motion";
import { Calendar, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SiteIcon } from "@/components/ui/SiteIcon";
import { LanguagePicker } from "./LanguagePicker";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { useI18n } from "@/providers/LanguageProvider";
import { useNavItems } from "@/providers/NavProvider";
import { SITE_CONTACT } from "@/lib/site";
import { playFeedback } from "@/lib/feedback";
import { appleSpringSnappy } from "@/lib/motion";
import { Z } from "@/lib/z-index";
import { cn } from "@/lib/utils";

function HeaderIconButton({
  href,
  label,
  icon,
  onClick,
  active,
  className,
  children,
  skipSfx,
  inDock = false,
}: {
  href?: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  children?: ReactNode;
  skipSfx?: boolean;
  inDock?: boolean;
}) {
  const inner = (
    <>
      {icon}
      {children}
    </>
  );

  const classes = cn(
    "header-icon-btn tap-target tap-target--icon btn-center box-border shrink-0 overflow-visible rounded-xl p-0 transition-colors",
    inDock
      ? "header-icon-btn--dock text-ds-text-secondary hover:text-ds-text"
      : "glass-subtle text-ds-text-secondary hover:text-ds-text active:scale-[0.94]",
    children && "header-icon-btn--wide sm:gap-1.5",
    active &&
      (inDock
        ? "header-icon-btn--dock-active text-ds-brand"
        : "border-ds-brand/35 bg-ds-brand-subtle text-ds-brand"),
    className,
  );

  if (href) {
    return (
      <motion.div
        className="shrink-0 overflow-visible"
        whileTap={{ scale: 0.97 }}
        transition={appleSpringSnappy}
      >
        <a href={href} aria-label={label} className={classes}>
          {inner}
        </a>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={active}
      className={classes}
      whileTap={{ scale: 0.97 }}
      transition={appleSpringSnappy}
      {...(skipSfx ? { "data-sfx-skip": true } : {})}
    >
      {inner}
    </motion.button>
  );
}

export function Header() {
  const { t } = useI18n();
  const navItems = useNavItems();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    let lastScrolled = window.scrollY > 24;

    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      const next = y > 24 ? true : y < 6 ? false : lastScrolled;
      if (next !== lastScrolled) {
        lastScrolled = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (menuOpen) {
      root.dataset.mobileNavOpen = "true";
      root.style.overflow = "hidden";
      root.style.overscrollBehavior = "none";
    } else {
      delete root.dataset.mobileNavOpen;
      root.style.overflow = "";
      root.style.overscrollBehavior = "";
    }
    return () => {
      delete root.dataset.mobileNavOpen;
      root.style.overflow = "";
      root.style.overscrollBehavior = "";
    };
  }, [menuOpen]);

  const isBoatDetail =
    pathname.startsWith("/fleet/") && pathname !== "/fleet";

  if (isBoatDetail) return null;

  const navLinks =
    navItems.length > 0
      ? navItems.map((item) => ({
          href: item.href,
          label:
            (t.nav as Record<string, string>)[item.labelKey] ?? item.labelKey,
        }))
      : [
          { href: "/fleet", label: t.nav.fleet },
          { href: "/map", label: t.nav.routes },
          { href: "/guide", label: t.nav.guide },
          { href: "/reviews", label: t.nav.reviews },
        ];

  const fleetActive =
    pathname === "/fleet" || pathname.startsWith("/fleet/");

  const navShell = cn(
    "glass-nav-shell w-full glass-nav-mobile transition-[box-shadow,background-color] duration-300 lg:glass-nav lg:border-b lg:border-ds-border/50",
    scrolled && "glass-nav-scrolled",
  );

  const desktopNavLinks = navLinks;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 right-0 left-0 z-[100] isolate w-full max-w-full overflow-x-clip overflow-y-visible glass-nav-shell-promoted"
        style={{ zIndex: Z.header }}
      >
        {/* Mobile */}
        <div className={cn(navShell, "glass-nav-mobile min-h-[4.5rem] overflow-visible lg:hidden")}>
          <div className="header-mobile-inner mx-auto flex min-h-[4.5rem] max-w-7xl min-w-0 items-center justify-between gap-2 overflow-visible px-3.5 py-1 sm:px-4">
            <Logo size="header" />

            <div
              className="header-mobile-dock"
              role="group"
              aria-label={t.common.navMenu ?? "Navigation"}
            >
              <HeaderIconButton
                inDock
                href={`tel:${SITE_CONTACT.phoneTel}`}
                label={(t.common.callPhone ?? "Call {phone}").replace(
                  "{phone}",
                  SITE_CONTACT.phone,
                )}
                icon={
                  <SiteIcon
                    name="phone"
                    size={18}
                    className="shrink-0 text-ds-brand"
                    label={t.common.phoneLabel ?? "Phone"}
                  />
                }
              />
              <HeaderIconButton
                inDock
                href="/fleet"
                label={t.nav.fleet}
                active={fleetActive}
                icon={
                  <SiteIcon
                    name="fleet"
                    size={18}
                    className="shrink-0"
                    label={t.nav.fleet}
                  />
                }
              />
              <LanguagePicker variant="header" compact inDock />
              <HeaderIconButton
                inDock
                href="/booking"
                label={t.nav.bookNow}
              >
                <Calendar className="size-[18px] shrink-0" strokeWidth={2.5} />
              </HeaderIconButton>
              <HeaderIconButton
                inDock
                label={
                  menuOpen
                    ? t.common.closeMenu ?? "Close menu"
                    : t.common.openMenu ?? "Open menu"
                }
                active={menuOpen}
                onClick={() => {
                  playFeedback(menuOpen ? "dismiss" : "open", "light");
                  setMenuOpen((o) => !o);
                }}
                skipSfx
                icon={
                  <motion.span
                    initial={false}
                    animate={{ rotate: menuOpen ? 90 : 0 }}
                    transition={appleSpringSnappy}
                    className="flex items-center justify-center"
                  >
                    {menuOpen ? (
                      <X className="size-5" strokeWidth={2.5} />
                    ) : (
                      <Menu className="size-5" strokeWidth={2.5} />
                    )}
                  </motion.span>
                }
              />
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className={cn(navShell, "hidden lg:block")}>
          <div
            className={cn(
              "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-[height] duration-300 sm:px-6",
              scrolled ? "h-14" : "h-16 sm:h-[4.5rem]",
            )}
          >
            <Logo
              size="header"
              className={scrolled ? "site-logo--header-compact" : undefined}
            />

            <nav className="flex flex-1 items-center justify-center">
              <ul className="glass-subtle flex items-center gap-0.5 rounded-full p-1">
                {desktopNavLinks.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "ui-nav-label relative block min-w-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors xl:px-4",
                          active
                            ? "bg-ds-brand-subtle text-ds-brand"
                            : "text-ds-text-secondary hover:bg-ds-surface/70 hover:text-ds-text",
                        )}
                      >
                        {link.label}
                        {active && (
                          <motion.span
                            layoutId="nav-dot"
                            className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ds-brand"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <LanguagePicker variant="header" />
              <MagneticButton
                href="/booking"
                className="btn-app-primary ui-btn-label inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 px-5 text-sm"
              >
                <Calendar className="size-4" />
                {t.nav.bookNow}
              </MagneticButton>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileNav open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
