import type { Metadata } from "next";
import { MatchmakerPageShell } from "@/components/pages/MatchmakerPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { toPublicBoats } from "@/lib/boats-public";
import { getBoats, getMatchmaker } from "@/lib/data";
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
  return buildPageMetadata("matchmaker", "/matchmaker", { lang });
}

export default async function MatchmakerPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const seo = await getLocalizedPageSeo("matchmaker", lang);
  const boats = getBoats();
  const matchmaker = getMatchmaker();

  return (
    <>
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: "/matchmaker",
            locale: seo.locale,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Find your boat", path: "/matchmaker" },
          ]),
        )}
      />
      <MatchmakerPageShell boats={toPublicBoats(boats)} matchmaker={matchmaker} />
    </>
  );
}
