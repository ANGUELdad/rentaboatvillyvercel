import type { Metadata } from "next";
import { ExperiencesPageShell } from "@/components/pages/ExperiencesPageShell";
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
  return buildPageMetadata("experiences", "/experiences", { lang });
}

export default async function ExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const seo = await getLocalizedPageSeo("experiences", lang);

  return (
    <>
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: "/experiences",
            locale: seo.locale,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Experiences", path: "/experiences" },
          ]),
        )}
      />
      <ExperiencesPageShell />
    </>
  );
}
