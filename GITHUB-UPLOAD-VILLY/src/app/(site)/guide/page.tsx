import type { Metadata } from "next";
import { GuidePageShell } from "@/components/pages/GuidePageShell";
import { getLocations } from "@/lib/data";
import { getLocalizedLocations } from "@/lib/location-i18n";
import { filterLocationsNearMarina } from "@/lib/map-geo";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildPageMetadata,
  getLocalizedPageSeo,
} from "@/lib/seo/build-metadata";
import { breadcrumbSchema, schemaGraph, webPageSchema } from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("guide", "/guide", { lang });
}

export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const seo = await getLocalizedPageSeo("guide", lang);

  return (
    <>
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: "/guide",
            locale: seo.locale,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Guide", path: "/guide" },
          ]),
        )}
      />
      <GuidePageShell
        locations={filterLocationsNearMarina(
          getLocalizedLocations(getLocations(), locale),
        )}
      />
    </>
  );
}
