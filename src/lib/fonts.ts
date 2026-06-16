import { Cormorant_Garamond, Caveat, Open_Sans } from "next/font/google";

/**
 * Open Sans — per boat rental app design spec.
 * Full multilingual: en, ro, de (latin-ext), el (greek), sr, bg (cyrillic).
 */
export const fontApp = Open_Sans({
  subsets: ["latin", "latin-ext", "greek", "cyrillic", "cyrillic-ext"],
  variable: "--font-app",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/** Serif display — hero headlines, boat names, editorial moments. */
export const fontDisplay = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/** Handwritten wordmark — matches orange cursive in brand logo. */
export const fontLogo = Caveat({
  subsets: ["latin"],
  variable: "--font-logo",
  display: "swap",
  weight: ["600", "700"],
});

export const fontVariables = `${fontApp.variable} ${fontLogo.variable} ${fontDisplay.variable}`;
