export interface BoatAmenity {
  id: string;
  label: string;
}

export interface Boat {
  id: string;
  name: string;
  pax: number;
  hp?: number;
  length?: string;
  pricePerHour: number;
  currency: string;
  image: string;
  description: string;
  longDescription?: string;
  tagline?: string;
  gallery?: string[];
  amenities?: BoatAmenity[];
  featured: boolean;
}

/** Fleet data safe to serialize to browser bundles (no internal pricing). */
export type PublicBoat = Omit<Boat, "pricePerHour" | "currency">;

export interface Offer {
  id: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  cta: string;
  ctaLink: string;
  image: string;
  delaySeconds?: number;
  showOnce?: boolean;
}

export interface OffersData {
  offers: Offer[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Location {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  coordinates: { lat: number; lng: number };
  category: "beach" | "lagoon" | "culture" | "harbor";
}

export interface ChatOption {
  id: string;
  label: string;
  next: string;
}

export interface ChatNode {
  message: string;
  options: ChatOption[];
}

export type ChatTree = Record<string, ChatNode>;

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  /** Original review text (author's language). */
  text: string;
  /** ISO-style locale of the original `text` (e.g. en, ru, bg). */
  locale?: string;
  /** Localized display text keyed by site locale. */
  textByLocale?: Partial<Record<import("@/lib/i18n/types").Locale, string>>;
  trip: string;
  date: string;
  image: string;
  source?: "google";
}

export interface MapPoint {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
}

export interface BoatRoute {
  id: string;
  name: string;
  description: string;
  duration: string;
  color: string;
  waypointIds: string[];
  /** Offshore GPS track following the coastline — used for map polylines */
  marinePath?: { lat: number; lng: number }[];
}

export interface RoutesData {
  marina: MapPoint;
  routes: BoatRoute[];
}

export interface BookingRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  date: string;
  time: string;
  boatId: string;
  guests: number;
  routeId: string;
  notes: string;
  createdAt: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentPreferences {
  consentId: string;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  policyVersion?: string;
  timestamp: string;
}

export interface ConsentRecord {
  id: string;
  consentId: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  policyVersion: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface GdprRequest {
  id: string;
  email: string;
  requestType:
    | "access"
    | "delete"
    | "portability"
    | "rectification"
    | "restriction"
    | "objection"
    | "withdraw_consent";
  status: "pending" | "completed" | "rejected";
  message: string;
  createdAt: string;
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  sections: { heading: string; body: string }[];
}

export interface LegalData {
  policyVersion?: string;
  company: {
    name: string;
    email: string;
    dpoEmail: string;
    address: string;
    phone: string;
    phone2?: string;
  };
  privacy: LegalDocument;
  cookies: LegalDocument;
  terms: LegalDocument;
  gdpr: LegalDocument;
}

export interface MatchmakerOption {
  id: string;
  label: string;
  icon?: string;
  next?: string;
  boatId?: string;
}

export interface MatchmakerNode {
  id: string;
  question: string;
  subtitle?: string;
  options: MatchmakerOption[];
}

export interface MatchmakerData {
  start: string;
  maxSteps: number;
  nodes: Record<string, MatchmakerNode>;
}

export type GalleryAspect = "16:9" | "9:16";
export type GalleryMediaType = "image" | "video";

export interface GalleryItem {
  id: string;
  type: GalleryMediaType;
  aspect: GalleryAspect;
  src: string;
  /** Optional strip/lightbox thumb when `src` shares pixels with another item */
  thumb?: string;
  poster?: string;
  alt: string;
  caption?: string;
}

export interface GalleryData {
  items: GalleryItem[];
}

export interface NavItem {
  id: string;
  href: string;
  labelKey: string;
  icon?: string;
  enabled: boolean;
}

export interface NavData {
  items: NavItem[];
}

export type DataFile =
  | "boats"
  | "faq"
  | "locations"
  | "chat"
  | "testimonials"
  | "routes"
  | "bookings"
  | "legal"
  | "offers"
  | "matchmaker"
  | "gallery"
  | "nav";
