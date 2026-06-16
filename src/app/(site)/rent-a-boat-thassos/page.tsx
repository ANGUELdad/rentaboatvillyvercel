import type { Metadata } from "next";
import { RentBoatThassosShell } from "@/components/pages/RentBoatThassosShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBoats, getFAQ } from "@/lib/data";
import { getTranslatedDictionary } from "@/lib/i18n/server";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  buildPageMetadata,
  getLocalizedPageSeo,
} from "@/lib/seo/build-metadata";
import {
  breadcrumbSchema,
  faqPageSchema,
  rentBoatThassosServiceSchema,
  schemaGraph,
  touristTripSchema,
  webPageSchema,
} from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("rentBoatThassos", "/rent-a-boat-thassos", { lang });
}

export default async function RentBoatThassosPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = await getRequestLocale(lang);
  const dict = await getTranslatedDictionary(locale);
  const seo = await getLocalizedPageSeo("rentBoatThassos", lang);
  const boats = getBoats();
  const pillar = dict.seo.rentBoatPillar;
  const faqItems = getFAQ().slice(0, 6);

  return (
    <>
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: "/rent-a-boat-thassos",
            locale: seo.locale,
          }),
          breadcrumbSchema([
            { name: "Home", path: "" },
            { name: pillar.title, path: "/rent-a-boat-thassos" },
          ]),
          rentBoatThassosServiceSchema(boats.length || 5),
          touristTripSchema(),
          faqPageSchema(
            faqItems.map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          ),
        )}
      />
      <RentBoatThassosShell content={pillar} />
    </>
  );
}
