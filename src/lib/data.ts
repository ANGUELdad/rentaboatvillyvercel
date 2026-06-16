import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { MARINA_LOCATION } from "@/lib/site";
import type {
  Boat,
  ChatTree,
  FAQ,
  GalleryData,
  LegalData,
  Location,
  MatchmakerData,
  NavData,
  OffersData,
  RoutesData,
  Testimonial,
} from "@/types";

const dataDir = join(process.cwd(), "data");

const EMPTY_ROUTES: RoutesData = {
  marina: {
    id: "marina",
    name: MARINA_LOCATION.shortName,
    coordinates: MARINA_LOCATION.coordinates,
  },
  routes: [],
};

const EMPTY_OFFERS: OffersData = { offers: [] };
const EMPTY_GALLERY: GalleryData = { items: [] };
const EMPTY_MATCHMAKER: MatchmakerData = {
  start: "start",
  maxSteps: 3,
  nodes: {},
};
const EMPTY_CHAT: ChatTree = {
  start: { message: "Welcome.", options: [] },
};

function logDataError(filename: string, err: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[data] Failed to load ${filename}.json:`, err);
  }
}

function readJsonSafe<T>(filename: string, fallback: T): T {
  const filePath = join(dataDir, `${filename}.json`);
  try {
    if (!existsSync(filePath)) {
      logDataError(filename, new Error("File not found"));
      return fallback;
    }
    const raw = readFileSync(filePath, "utf-8");
    if (!raw.trim()) {
      logDataError(filename, new Error("File is empty"));
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch (err) {
    logDataError(filename, err);
    return fallback;
  }
}

export function getBoats(): Boat[] {
  const boats = readJsonSafe<Boat[]>("boats", []);
  return Array.isArray(boats) ? boats : [];
}

export function getBoatById(id: string): Boat | undefined {
  if (!id) return undefined;
  return getBoats().find((b) => b.id === id);
}

export function getOffers(): OffersData {
  const data = readJsonSafe<OffersData>("offers", EMPTY_OFFERS);
  return data?.offers && Array.isArray(data.offers) ? data : EMPTY_OFFERS;
}

export function getFAQ(): FAQ[] {
  const faq = readJsonSafe<FAQ[]>("faq", []);
  return Array.isArray(faq) ? faq : [];
}

export function getLocations(): Location[] {
  const locations = readJsonSafe<Location[]>("locations", []);
  return Array.isArray(locations) ? locations : [];
}

export function getChatTree(): ChatTree {
  const chat = readJsonSafe<ChatTree>("chat", EMPTY_CHAT);
  return chat && typeof chat === "object" ? chat : EMPTY_CHAT;
}

export function getTestimonials(): Testimonial[] {
  const items = readJsonSafe<Testimonial[]>("testimonials", []);
  return Array.isArray(items) ? items : [];
}

export {
  getPublicTestimonials,
  getLocalizedPublicTestimonials,
  getTestimonialTextForLocale,
  getDisplayRating,
  getGoogleReviewCount,
  sortFeaturedTestimonials,
} from "@/lib/testimonials";

export function getRoutes(): RoutesData {
  const data = readJsonSafe<RoutesData>("routes", EMPTY_ROUTES);
  if (!data || typeof data !== "object") return EMPTY_ROUTES;
  return {
    marina: data.marina ?? EMPTY_ROUTES.marina,
    routes: Array.isArray(data.routes) ? data.routes : [],
  };
}

const EMPTY_LEGAL: LegalData = {
  company: {
    name: "Rent A Boat Villy",
    email: "vilitrifonova245@gmail.com",
    dpoEmail: "vilitrifonova245@gmail.com",
    address: "New Port of Limenaria, Thassos, Greece",
    phone: "+30 698 131 8393",
    phone2: "+40 770 965 041",
  },
  privacy: { title: "Privacy Policy", lastUpdated: "", sections: [] },
  cookies: { title: "Cookie Policy", lastUpdated: "", sections: [] },
  terms: { title: "Terms", lastUpdated: "", sections: [] },
  gdpr: { title: "GDPR", lastUpdated: "", sections: [] },
};

export function getLegal(): LegalData {
  const data = readJsonSafe<LegalData>("legal", EMPTY_LEGAL);
  return data?.company ? data : EMPTY_LEGAL;
}

export function getMatchmaker(): MatchmakerData {
  const data = readJsonSafe<MatchmakerData>("matchmaker", EMPTY_MATCHMAKER);
  return data?.nodes && typeof data.nodes === "object" ? data : EMPTY_MATCHMAKER;
}

export function getGallery(): GalleryData {
  const data = readJsonSafe<GalleryData>("gallery", EMPTY_GALLERY);
  return data?.items && Array.isArray(data.items) ? data : EMPTY_GALLERY;
}

const DEFAULT_NAV: NavData = {
  items: [
    { id: "fleet", href: "/fleet", labelKey: "fleet", enabled: true },
    { id: "map", href: "/map", labelKey: "routes", enabled: true },
    { id: "guide", href: "/guide", labelKey: "guide", enabled: true },
    { id: "experiences", href: "/experiences", labelKey: "experiences", enabled: true },
    { id: "reviews", href: "/reviews", labelKey: "reviews", enabled: true },
  ],
};

export function getNav(): NavData {
  const data = readJsonSafe<NavData>("nav", DEFAULT_NAV);
  if (!data?.items || !Array.isArray(data.items)) return DEFAULT_NAV;
  return {
    items: data.items.filter((i) => i.enabled !== false),
  };
}
