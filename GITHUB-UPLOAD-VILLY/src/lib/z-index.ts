/**
 * Central z-index scale.
 *
 * Chat FAB / toast sit above page content and sticky bars, below open chat + modals.
 */
export const Z = {
  /** Collapsed chat FAB — above sticky bars, below open chat */
  chatFab: 56,
  /** Package teaser popup — above FAB */
  packageTeaser: 57,
  /** Chat entry toast — above FAB */
  chatToast: 58,
  /** Site header — above hero video and page chrome */
  header: 100,
  /** Package builder, boat detail book bar, etc. */
  stickyBar: 55,
  /** Open chat scrim + panel — above site header when open */
  chatScrim: 105,
  chatPanel: 106,
  dropdown: 60,
  pageTransition: 90,
  /** Timed "book now" bar — above the header, below the consent bar so
      consent always wins if both are on screen. */
  bookBanner: 110,
  cookie: 120,
  offerBackdrop: 130,
  offer: 131,
  sheetBackdrop: 140,
  sheet: 141,
  cookieSettings: 150,
  /** Decorative cursor — non-interactive */
  boatCursor: 200,
} as const;
