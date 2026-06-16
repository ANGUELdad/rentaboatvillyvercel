"use client";

import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { HomeMomentsMarquee } from "@/components/home/HomeMomentsMarquee";
import { FleetShowcase } from "@/components/fleet/FleetShowcase";
import { ImmersiveSection } from "@/components/home/ImmersiveSection";
import { FAQSection } from "@/components/FAQSection";
import { SeoHomeContent, SeoHomeLinksNav } from "@/components/seo/SeoHomeContent";
import { Hero } from "@/components/Hero";
import { ChatPromoBanner } from "@/components/chat/ChatPromoBanner";
import { SocialProofCarousel } from "@/components/SocialProofCarousel";
import type { PublicBoat, BoatRoute, GalleryItem, MatchmakerData, Testimonial } from "@/types";

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
          variant="scale"
          delay={0.02}
          className="home-2026__section home-2026__section--chat-promo"
        >
          <div className="home-section-inset">
            <ChatPromoBanner />
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
          variant="up"
          delay={0.03}
          className="home-2026__section home-2026__section--fleet"
        >
          <div
            id="home-start"
            className="home-section-inset home-fleet-jump scroll-mt-14"
          >
            <FleetShowcase boats={boats} variant="home" />
          </div>
        </ImmersiveSection>

        <ImmersiveSection
          variant="scale"
          delay={0.04}
          className="home-2026__section home-2026__section--faq"
        >
          <div className="home-section-inset">
            <FAQSection />
          </div>
        </ImmersiveSection>

        <ImmersiveSection variant="up" delay={0.035} className="home-2026__section home-2026__section--seo">
          <div className="home-section-inset">
            <SeoHomeContent />
          </div>
        </ImmersiveSection>

        <ImmersiveSection
          variant="up"
          delay={0.04}
          className="home-2026__section home-2026__section--explore"
        >
          <div className="home-section-inset pb-2">
            <SeoHomeLinksNav />
          </div>
        </ImmersiveSection>
      </div>
    </div>
  );
}
