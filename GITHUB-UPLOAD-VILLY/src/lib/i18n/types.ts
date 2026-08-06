import type { ChatTree } from "@/types";

export type Locale = "en" | "ro" | "el" | "de" | "sr" | "bg";

/* All six ship. The four beyond en/el had been dropped from this array even
   though their locale files and legal translations were complete and still in
   the repo — so the translations existed but no visitor could reach them.
   Each label is written in its own language, which is what someone scanning
   for their own reads first. */
export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "bg", label: "Български", flag: "🇧🇬" },
  { code: "sr", label: "Српски", flag: "🇷🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export const LANG_COOKIE = "tbc-lang";

/** Bump when snapshot shape or merge rules change to invalidate cached translations. */
export const LOCALE_SNAPSHOT_CACHE_VERSION = 10;

export interface FaqItem {
  q: string;
  a: string;
}

export interface ExperienceItem {
  title: string;
  desc: string;
}

export interface FleetBandCopy {
  title: string;
  eyebrow: string;
  blurb: string;
  size: string;
  combos: string;
}

export interface FleetCatalogCopy {
  introEyebrow: string;
  introTitle: string;
  introText: string;
  ribbonAria: string;
  ribbonBoats: string;
  ribbonBands: string;
  ribbonFuel: string;
  ribbonRequest: string;
  namesAria: string;
  bands: Record<string, FleetBandCopy>;
}

export interface FleetStrings {
  eyebrow: string;
  title: string;
  subtitle: string;
  stat1: string;
  stat2: string;
  stat3: string;
  viewVessel: string;
  empty: string;
  vesselCount: string;
  pageStats?: {
    boatsLabel: string;
    capacityLabel: string;
    licenseValue: string;
    licenseLabel: string;
  };
  catalog?: FleetCatalogCopy;
}

export interface GuideSpotCopy {
  name: string;
  tagline: string;
  description: string;
}

export interface BlogPageCopy {
  trailAria?: string;
  trailHome?: string;
  trailBlog?: string;
  quickLinksAria?: string;
  quickGuide?: string;
  quickBooking?: string;
  quickFaq?: string;
}

export interface BlogStrings {
  [key: string]: string | BlogPageCopy | undefined;
  eyebrow: string;
  title: string;
  subtitle: string;
  back: string;
  backHome: string;
  featured: string;
  readArticle: string;
  readTime: string;
  empty: string;
  articleCta: string;
  newsKicker: string;
  newsTagline: string;
  categoryAll: string;
  categoryGuides: string;
  categoryGuidesDesc: string;
  categoryBeaches: string;
  categoryBeachesDesc: string;
  categoryRoutes: string;
  categoryRoutesDesc: string;
  categoryRental: string;
  categoryRentalDesc: string;
  categoryThassos: string;
  categoryThassosDesc: string;
  categoriesAria: string;
  headlines: string;
  headlinesAria: string;
  latest: string;
  latestAria: string;
  sidebarAria: string;
  sidebarCta: string;
  viewAll: string;
  relatedTitle: string;
  page?: BlogPageCopy;
}

export interface GuideStrings {
  eyebrow: string;
  title: string;
  subtitle: string;
  mapCta?: string;
  destinationsTitle?: string;
  categoryBeach?: string;
  categoryLagoon?: string;
  categoryCulture?: string;
  categoryHarbor?: string;
  spots?: Record<string, GuideSpotCopy>;
  page?: {
    filterAll?: string;
    timelineTitle?: string;
    routesTitle?: string;
    scrollHint?: string;
    spotCount?: string;
    ctaMap?: string;
    ctaBook?: string;
    routes?: { title: string; desc: string; hours: string }[];
  };
}

export interface SeoHomeSection {
  title: string;
  items?: string[];
  paragraphs?: string[];
}

export interface SeoHomeLink {
  href: string;
  label: string;
}

export interface LocaleStrings {
  nav: Record<string, string>;
  hero: Record<string, string>;
  home: {
    trustBar?: {
      ariaLabel: string;
      licence: string;
      briefing: string;
      deposit: string;
    };
    bento?: {
      ariaLabel: string;
      weatherTitle: string;
      calm: string;
      moderate: string;
      rough: string;
      captainTitle: string;
      captainBody: string;
      reviewsTitle: string;
    };
    exploreEyebrow: string;
    exploreTitle: string;
    exploreSubtitle: string;
    safetyRules: string[];
    cards: Record<string, { title: string; desc: string }>;
    quickNav?: Record<string, string>;
    fleetTeaser?: {
      badge?: string;
      title: string;
      subtitle: string;
      chip1?: string;
      chip2?: string;
      chip3?: string;
      cta: string;
      ctaHint?: string;
      ariaLabel: string;
      paxLabel?: string;
      tiersAria?: string;
      tiers?: Record<string, { label: string; hint: string }>;
    };
    seasonDock?: Record<string, string>;
    whyChoose?: {
      title: string;
      subtitle: string;
      items: Record<
        string,
        {
          title: string;
          desc: string;
        }
      >;
    };
  };
  fleet: FleetStrings;
  map: Record<string, string>;
  guide: GuideStrings;
  experiences: {
    eyebrow: string;
    title: string;
    subtitle: string;
    buildCta?: string;
    estimateCta?: string;
    customTitle?: string;
    customDesc?: string;
    customCta?: string;
    items: ExperienceItem[];
  };
  reviews: Record<string, string>;
  booking: {
    eyebrow: string;
    title: string;
    subtitle: string;
    disclaimer?: string;
    requestTitle?: string;
    expectTitle: string;
    expect1: string;
    expect2: string;
    expect3: string;
    successTitle: string;
    successDesc: string;
    successMessage?: string;
    successEmailNote?: string;
    successAgain: string;
    summaryTitle?: string;
    summaryBoatEmpty?: string;
    emailSubject?: string;
    emailIntro?: string;
    emailNotConfirmed?: string;
    emailReference?: string;
    emailQuestions?: string;
    emailAnyBoat?: string;
    submit: string;
    submitting: string;
    consentCheckbox?: string;
    consentCheckboxError?: string;
    form: Record<string, string>;
  };
  faq: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: FaqItem[];
    page?: {
      carouselAria?: string;
      highlightsTitle?: string;
      highlights?: { title: string; desc: string; image?: string }[];
      tips?: string[];
      tipsAria?: string;
      allQuestions?: string;
      ctaBook?: string;
      ctaPrices?: string;
      ctaFleet?: string;
      slides?: { src: string; caption: string }[];
    };
  };
  cookies: Record<string, string>;
  footer: Record<string, string>;
  blog: BlogStrings;
  common: Record<string, string>;
  matchmaker: Record<string, string>;
  showcase: Record<string, string>;
  gallery?: Record<string, string>;
  packageBuilder?: Record<string, string>;
  package?: Record<string, string>;
  fleetGrid: Record<string, string>;
  yachtUi?: {
    search: Record<string, string>;
    results: Record<string, string>;
    nearYou: Record<string, string>;
    specs?: Record<string, string>;
  };
  boatDetail: Record<string, string>;
  legal: Record<string, string>;
  termsPage: {
    title: string;
    intro: string;
    phoneLabel: string;
    officeLabel: string;
    office: string;
    bullets: string[];
    bookingNote: string;
    bookingCta: string;
  };
  gdpr: Record<string, string>;
  offers: Record<string, string>;
  seo: {
    siteName: string;
    defaultTitle: string;
    titleTemplate: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    locale: string;
    boat: {
      title: string;
      description: string;
      keywords: string;
    };
    blogArticle: {
      titleSuffix: string;
    };
    homeContent: {
      eyebrow: string;
      title: string;
      intro: string;
      features: Record<string, { title: string; desc: string }>;
      sections: SeoHomeSection[];
      linksTitle: string;
      linksEyebrow?: string;
      linksSubtitle?: string;
      linksAria: string;
      links: SeoHomeLink[];
    };
    rentBoatPillar: {
      eyebrow: string;
      title: string;
      subtitle: string;
      lead: string;
      sections: SeoHomeSection[];
      ctaPrimary: string;
      ctaSecondary: string;
      linksTitle: string;
      linksAria: string;
      links: SeoHomeLink[];
    };
    pages: Record<
      | "home"
      | "fleet"
      | "booking"
      | "package"
      | "map"
      | "guide"
      | "experiences"
      | "reviews"
      | "faq"
      | "blog"
      | "rentBoatThassos"
      | "matchmaker"
      | "privacy"
      | "terms"
      | "cookies"
      | "gdpr",
      { title: string; description: string; keywords: string }
    >;
  };
  chat: {
    title: string;
    subtitle: string;
    menuGroups?: {
      bookBoat: string;
      ourBoats: string;
      goodToKnow: string;
      contact: string;
    };
    banner?: {
      title: string;
      body: string;
      cta: string;
      dismiss: string;
      badge?: string;
      userPrompt?: string;
      reply?: string;
      followUp?: string;
      typing?: string;
    };
    humanContact?: {
      title: string;
      subtitle: string;
      whatsapp: string;
      viber: string;
      email: string;
      close: string;
      prefill?: string;
      emailSubject?: string;
      optionLabel?: string;
    };
    [key: string]:
      | string
      | string[]
      | ChatTree[string]
      | {
          bookBoat: string;
          ourBoats: string;
          goodToKnow: string;
          contact: string;
        }
      | {
          title: string;
          body: string;
          cta: string;
          dismiss: string;
        }
      | {
          title: string;
          subtitle: string;
          whatsapp: string;
          viber: string;
          email: string;
          close: string;
          prefill?: string;
          emailSubject?: string;
          optionLabel?: string;
        }
      | undefined;
  };
  errors: {
    notFound: Record<string, string>;
    route: Record<string, string>;
    global: Record<string, string>;
    unauthorized: Record<string, string>;
    admin: {
      notFound: Record<string, string>;
      route: Record<string, string>;
    };
  };
  conversion?: {
    trust: Record<string, string>;
    steps: Record<string, string>;
    stepsAria: string;
    social: Record<string, string>;
    bookingBadges: Record<string, string>;
    funnel: Record<string, string>;
    fleet: Record<string, string>;
    lossAversion: string;
    popularSeason: string;
    package: {
      fromPrice: string;
      includedTitle: string;
      included: string[];
      excludedTitle: string;
      excluded: string[];
      mobileSummary: string;
    };
    booking: Record<string, string>;
    boatDetail: Record<string, string>;
    skipLink: string;
  };
}
