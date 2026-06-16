import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getTestimonials } from "@/lib/data";
import { fontApp, fontVariables } from "@/lib/fonts";
import { AppProviders } from "@/providers/AppProviders";
import { SITE_BRAND, SITE_URL } from "@/lib/seo/config";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  hreflangAlternates,
} from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/page-meta";
import {
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo/schemas";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_BRAND,
  title: {
    default: PAGE_SEO.home.title,
    template: "%s",
  },
  description: PAGE_SEO.home.description,
  keywords: DEFAULT_KEYWORDS,
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: SITE_BRAND,
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Rent a boat Thassos — private boat rentals from New Port of Limenaria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_SEO.home.title,
    description: PAGE_SEO.home.description,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: hreflangAlternates(""),
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/brand/villy-logo.png", type: "image/png", sizes: "882x779" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  // Set GOOGLE_SITE_VERIFICATION in .env for Search Console ownership.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVariables} min-h-full antialiased`}
    >
      <body
        className={`${fontApp.className} min-h-full bg-ds-base text-ds-text`}
      >
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema(getTestimonials())} />
        <JsonLd data={websiteSchema()} />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
