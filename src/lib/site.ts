/** Google Business Profile — Rent a boat / Villy at New Port of Limenaria. */
export const MARINA_LOCATION = {
  name: "Rent a boat / Villy",
  shortName: "New Port of Limenaria",
  coordinates: { lat: 40.62575, lng: 24.57506 },
  googleMapsUrl: "https://share.google/cSndqERo0GHEWsEle",
} as const;

export const GOOGLE_REVIEWS = {
  url: MARINA_LOCATION.googleMapsUrl,
  /** SEO-only aggregate rating (not shown on site). */
  rating: 4.7,
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
  email: "vilitrifonova245@gmail.com",
  privacyEmail: "vilitrifonova245@gmail.com",
  dpoEmail: "vilitrifonova245@gmail.com",
  marina: "New Port of Limenaria, Thassos, Greece",
  hours: "Daily 08:00 – 20:00",
} as const;
