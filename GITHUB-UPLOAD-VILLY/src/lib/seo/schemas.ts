import type { Boat, Testimonial } from "@/types";
import type { Locale } from "@/lib/i18n/types";
import { GOOGLE_REVIEWS, SITE_CONTACT } from "@/lib/site";
import { GEO, HREFLANG_LOCALES, SITE_NAME, SITE_URL } from "./config";

function businessRef() {
  return { "@id": `${SITE_URL}/#business` };
}

export function aggregateRatingFromReviews(testimonials: Testimonial[]) {
  if (GOOGLE_REVIEWS.rating > 0 && GOOGLE_REVIEWS.count > 0) {
    return {
      "@type": "AggregateRating",
      ratingValue: GOOGLE_REVIEWS.rating.toFixed(1),
      reviewCount: GOOGLE_REVIEWS.count,
      bestRating: "5",
      worstRating: "1",
    };
  }
  if (testimonials.length === 0) return undefined;
  const sum = testimonials.reduce((a, t) => a + t.rating, 0);
  return {
    "@type": "AggregateRating",
    ratingValue: (sum / testimonials.length).toFixed(1),
    reviewCount: testimonials.length,
    bestRating: "5",
    worstRating: "1",
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [
      "Rent a Boat Thassos",
      "Boat Rental Thassos",
      "Rent a Boat in Thassos",
      "Rent a Boat Limenaria",
      "Ενοικίαση βάρκας Θάσος",
      "Villy Boat Rentals",
    ],
    url: SITE_URL,
    logo: `${SITE_URL}/brand/villy-logo.png`,
    email: SITE_CONTACT.email,
    telephone: [SITE_CONTACT.phoneSchema, SITE_CONTACT.phone2Schema],
    sameAs: [SITE_URL, GOOGLE_REVIEWS.url],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: [
      "Rent a Boat Thassos",
      "Boat Rental Thassos",
      "Rent a Boat in Thassos",
      "Rent a Boat Limenaria",
      "Ενοικίαση βάρκας Θάσος",
      "Villy Boat Rentals",
    ],
    description:
      "Rent a boat in Thassos, Greece — private boat rental and day trips from New Port of Limenaria.",
    inLanguage: [...HREFLANG_LOCALES],
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "ReadAction",
      target: `${SITE_URL}/fleet`,
    },
  };
}

export function localBusinessSchema(testimonials: Testimonial[] = []) {
  const aggregateRating = aggregateRatingFromReviews(testimonials);
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "BoatRentalBusiness", "Service"],
    "@id": `${SITE_URL}/#business`,
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    name: SITE_NAME,
    alternateName: [
      "Rent a Boat Thassos",
      "Boat Rental Thassos",
      "Rent a Boat in Thassos",
      "Rent a Boat Limenaria",
      "Ενοικίαση βάρκας Θάσος",
      "Villy Boat Rentals",
    ],
    description:
      "Rent a boat in Thassos from New Port of Limenaria. Speedboats and day cruisers with safety gear & GPS routes. No licence up to 30HP. Contact us for rates.",
    slogan: "Rent a boat in Thassos — New Port of Limenaria",
    url: SITE_URL,
    telephone: [SITE_CONTACT.phoneSchema, SITE_CONTACT.phone2Schema],
    email: SITE_CONTACT.email,
    image: `${SITE_URL}/opengraph-image`,
    logo: `${SITE_URL}/brand/villy-logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "New Port of Limenaria",
      addressLocality: GEO.locality,
      addressRegion: GEO.region,
      postalCode: "64002",
      addressCountry: GEO.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: GEO.latitude,
      longitude: GEO.longitude,
    },
    areaServed: [
      { "@type": "Place", name: "Thassos Island, Greece" },
      { "@type": "Place", name: "North Aegean, Greece" },
    ],
    currenciesAccepted: "EUR",
    paymentAccepted: ["Cash", "Credit Card"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    serviceType: "Boat Rental",
    knowsLanguage: ["en", "el", "de", "ro", "bg", "sr"],
    hasMap: GOOGLE_REVIEWS.url,
    sameAs: [SITE_URL, GOOGLE_REVIEWS.url],
    ...(aggregateRating ? { aggregateRating } : {}),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Rent A Boat Villy Fleet",
      itemListElement: {
        "@type": "OfferCatalog",
        name: "Hourly boat rentals",
        url: `${SITE_URL}/fleet`,
      },
    },
  };
}

export function boatProductSchema(boat: Boat) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/fleet/${boat.id}#product`,
    name: `${boat.name} — Rent A Boat Villy`,
    description: boat.longDescription ?? boat.description,
    image: boat.gallery ?? [boat.image],
    sku: boat.id,
    category: "Boat Rental",
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      name: `Rent ${boat.name} in Thassos`,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/fleet/${boat.id}`,
      seller: businessRef(),
    },
  };
}

export function boatServiceSchema(boat: Boat) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/fleet/${boat.id}#service`,
    name: `${boat.name} Private Boat Rental — Thassos`,
    description: boat.longDescription ?? boat.description,
    provider: businessRef(),
    areaServed: "Thassos Island, Greece",
    serviceType: "Boat Rental",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/booking?boat=${boat.id}`,
    },
  };
}

export function fleetItemListSchema(boats: Boat[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rent A Boat Villy — Fleet",
    description:
      "Speedboats and day cruisers to rent in Thassos at New Port of Limenaria",
    numberOfItems: boats.length,
    itemListElement: boats.map((boat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: boat.name,
      url: `${SITE_URL}/fleet/${boat.id}`,
    })),
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function articleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  locale?: Locale;
  articleSection?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: businessRef(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${article.slug}`,
    },
    image: article.image,
    inLanguage: article.locale ?? "en",
    ...(article.articleSection
      ? { articleSection: article.articleSection }
      : {}),
  };
}

export function reviewSchema(testimonials: Testimonial[]) {
  const publicItems = testimonials.filter((t) => t.rating >= 4 && t.text.trim().length > 0);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rent A Boat Villy Reviews",
    itemListElement: publicItems.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: t.name,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: t.rating,
          bestRating: 5,
        },
        reviewBody: t.text,
        itemReviewed: businessRef(),
      },
    })),
  };
}

export function rentBoatThassosServiceSchema(offerCount = 5) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#rent-a-boat-thassos`,
    name: "Rent a Boat in Thassos — Rent A Boat Villy",
    alternateName: ["Boat Rental Thassos", "Thassos Boat Hire"],
    description:
      "Rent a boat in Thassos from New Port of Limenaria. Hourly speedboat and day-cruiser boat rentals. No licence up to 30HP. Contact us for rates.",
    provider: businessRef(),
    areaServed: { "@type": "Place", name: "Thassos Island, Greece" },
    serviceType: "Boat Rental",
    url: `${SITE_URL}/rent-a-boat-thassos`,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/fleet`,
      availability: "https://schema.org/InStock",
    },
  };
}

export function touristTripSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "@id": `${SITE_URL}/#thassos-boat-day`,
    name: "Self-Drive Boat Rental Day Trip — Thassos",
    description:
      "Hourly self-drive boat rental from New Port of Limenaria, Thassos. Explore Tripiti Cave, Metalia, Marble Beach and secret coves — safety briefing included, no licence up to 30HP.",
    touristType: "Self-drive boat rental",
    provider: businessRef(),
    url: `${SITE_URL}/rent-a-boat-thassos`,
    itinerary: {
      "@type": "ItemList",
      name: "Popular Thassos boat routes from Limenaria",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Tripiti Cave & Metalia Beach",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Marble Beach (Saliara)",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Golden Beach (Chrisi Akti)",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Aliki Ancient Quarry",
        },
      ],
    },
  };
}

export function bookingServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Rent A Boat Villy — Online Booking",
    description:
      "Book and rent a boat in Thassos online. Depart from New Port of Limenaria — we confirm availability with you.",
    provider: businessRef(),
    areaServed: "Thassos Island",
    serviceType: "Boat Rental",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/booking`,
      availability: "https://schema.org/InStock",
    },
  };
}

export function webPageSchema(page: {
  name: string;
  description: string;
  path: string;
  locale?: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: `${SITE_URL}${page.path}`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: businessRef(),
    inLanguage: page.locale ?? "en",
  };
}

/** Combine multiple schema objects for one script tag */
export function schemaGraph(...nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map((node) => {
      const { "@context": _c, ...rest } = node as Record<string, unknown>;
      return rest;
    }),
  };
}
