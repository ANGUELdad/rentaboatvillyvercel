import { BookNowBanner } from "@/components/conversion/BookNowBanner";
import { CookieConsent } from "@/components/gdpr/CookieConsent";
import { ConsentGatedScripts } from "@/components/gdpr/ConsentGatedScripts";
import { SkipLink } from "@/components/layout/SkipLink";
import { SfxProvider } from "@/components/feedback/SfxProvider";
import { BoatCursorProvider } from "@/components/ui/BoatCursorProvider";
import { ConciergeChatWrapper } from "@/components/ConciergeChatWrapper";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollUnlock } from "@/components/layout/ScrollUnlock";
import { OfferPopupWrapper } from "@/components/offers/OfferPopupWrapper";
import { SeoHeadUpdater } from "@/components/seo/SeoHeadUpdater";
import { getBoats, getFAQ, getNav, getOffers } from "@/lib/data";
import { NavProvider } from "@/providers/NavProvider";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { offers } = getOffers();
  const nav = getNav();
  const boats = getBoats();
  const faq = getFAQ();

  return (
    <NavProvider items={nav.items}>
      <SeoHeadUpdater />
      <ScrollUnlock />
      <SkipLink />
      <Header />
      <PageTransition />
      <main
        id="main-content"
        className="ui-contain flex min-h-dvh min-w-0 flex-col pt-[4.5rem] pb-fab-clearance lg:pt-16 xl:pt-[4.5rem]"
      >
        {children}
      </main>
      <Footer />
      <CookieConsent />
      <BookNowBanner />
      <ConsentGatedScripts />
      <SfxProvider />
      <BoatCursorProvider />
      <ConciergeChatWrapper boats={boats} faq={faq} />
      <OfferPopupWrapper offers={offers} />
    </NavProvider>
  );
}
