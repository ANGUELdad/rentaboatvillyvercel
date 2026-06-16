import type { Metadata } from "next";
import { FleetPageShell } from "@/components/pages/FleetPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { toPublicBoats } from "@/lib/boats-public";
import { getBoats } from "@/lib/data";
import {
  buildPageMetadata,
  getLocalizedPageSeo,
} from "@/lib/seo/build-metadata";
import {
  breadcrumbSchema,
  fleetItemListSchema,
  schemaGraph,
  webPageSchema,
} from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("fleet", "/fleet", { lang });
}

export default async function FleetPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const seo = await getLocalizedPageSeo("fleet", lang);
  const boats = getBoats();

  return (
    <>
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: "/fleet",
            locale: seo.locale,
          }),
          fleetItemListSchema(boats),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Fleet", path: "/fleet" },
          ]),
        )}
      />
      <FleetPageShell boats={toPublicBoats(boats)} />
    </>
  );
}
