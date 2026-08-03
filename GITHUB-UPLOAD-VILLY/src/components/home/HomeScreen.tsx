"use client";

import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { ImmersiveSection } from "@/components/home/ImmersiveSection";
import type { PublicBoat, BoatRoute, GalleryItem, MatchmakerData, Testimonial } from "@/types";

const SocialProofCarousel = dynamic(
  () => import("@/components/SocialProofCarousel").then((mod) => mod.SocialProofCarousel),
);
const ChatPromoBanner = dynamic(
  () => import("@/components/chat/ChatPromoBanner").then((mod) => mod.ChatPromoBanner),
);
const WhyChooseSection = dynamic(
  () => import("@/components/home/WhyChooseSection").then((mod) => mod.WhyChooseSection),
);
const HomeMomentsMarquee = dynamic(
  () => import("@/components/home/HomeMomentsMarquee").then((mod) => mod.HomeMomentsMarquee),
);
const FleetShowcase = dynamic(
  () => import("@/components/fleet/FleetShowcase").then((mod) => mod.FleetShowcase),
);
const FAQSection = dynamic(
  () => import("@/components/FAQSection").then((mod) => mod.FAQSection),
);
export function HomeScreen({
  boats,
  routes: _routes,
  testimonials: _testimonials,
  matchmaker: _matchmaker,
  recentBookings: _recentBookings = 0,
  galleryItems = [],
}: {
  boats: PublicBoat[];
  routes: BoatRoute[];
  testimonials: Testimonial[];
  matchmaker: MatchmakerData;
  recentBookings?: number;
  galleryItems?: GalleryItem[];
}) {
  const showMoments = galleryItems.length >= 4;

  return (
    <div className="home-2026 home-immersive-flow home-ambient-bg ui-2026-page">
      <Hero />

      <div className="home-2026__body">
        <ImmersiveSection
          variant="up"
          className="home-2026__section home-2026__section--reviews"
        >
          <div className="home-section-inset">
            <SocialProofCarousel
              testimonials={_testimonials}
              variant="home"
              recentBookings={_recentBookings}
            />
          </div>
        </ImmersiveSection>

        <ImmersiveSection
          variant="up"
          delay={0.01}
          className="home-2026__section home-2026__section--fleet"
        >
          <div
            id="home-start"
            className="home-section-inset home-fleet-jump scroll-mt-14"
          >
            <FleetShowcase boats={boats} variant="home" />
          </div>
        </ImmersiveSection>

        <ImmersiveSection variant="up" className="home-2026__section home-2026__section--why">
          <div className="home-section-inset">
            <WhyChooseSection />
          </div>
        </ImmersiveSection>

        {showMoments ? (
          <ImmersiveSection
            variant="up"
            delay={0.02}
            className="home-2026__section home-2026__section--moments"
          >
            <HomeMomentsMarquee items={galleryItems} />
          </ImmersiveSection>
        ) : null}

        <ImmersiveSection
          variant="scale"
          delay={0.04}
          className="home-2026__section home-2026__section--faq"
        >
          <div className="home-section-inset">
            <FAQSection />
          </div>
        </ImmersiveSection>

        <ImmersiveSection
          variant="scale"
          delay={0.05}
          className="home-2026__section home-2026__section--chat-promo"
        >
          <div className="home-section-inset">
            <ChatPromoBanner />
          </div>
        </ImmersiveSection>

        {/* The "Boat rental guide" link block that closed the page is gone.
            It was an internal-link list landing straight after eight FAQ
            answers, and every destination it offered is still reachable from
            the footer and the nav — /guide, /map and /rent-a-boat-thassos each
            keep two to three other links on this page, so nothing is orphaned
            and no crawl path is lost. Just less to read. */}
      </div>
    </div>
  );
}
