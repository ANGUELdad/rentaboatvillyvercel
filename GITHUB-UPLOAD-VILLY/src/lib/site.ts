/** Google Business Profile — Rent a boat / Villy at New Port of Limenaria. */
export const MARINA_LOCATION = {
  name: "Rent a boat / Villy",
  shortName: "New Port of Limenaria",
  coordinates: { lat: 40.62575, lng: 24.57506 },
  googleMapsUrl: "https://share.google/cSndqERo0GHEWsEle",
} as const;

export const GOOGLE_REVIEWS = {
  url: MARINA_LOCATION.googleMapsUrl,
  /**
   * Aggregate guest rating. Displayed on the site (hero, reviews, footer) AND
   * emitted in LocalBusiness JSON-LD — the two MUST match, and both must match
   * the live Google Business Profile, or Google may flag the rich result.
   */
  rating: 4.9,
  count: 32,
} as const;

/** Central site contact — update before launch. */
export const SITE_CONTACT = {
  phone: "+30 698 131 8393",
  phoneTel: "+306981318393",
  phoneSchema: "+30-698-131-8393",
  phone2: "+40 770 965 041",
  phone2Tel: "+40770965041",
  phone2Schema: "+40-770-965-041",
  // Public-facing address. Inbound is forwarded to the owner's inbox; lead
  // notifications also fan out via BOOKING_NOTIFICATION_EMAIL (see .env.example).
  email: "info@rentaboatvilly.com",
  privacyEmail: "info@rentaboatvilly.com",
  dpoEmail: "info@rentaboatvilly.com",
  marina: "New Port of Limenaria, Thassos, Greece",
  hours: "Daily 08:00 – 20:00",
} as const;
