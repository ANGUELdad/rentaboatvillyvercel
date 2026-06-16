import type { Metadata } from "next";
import { BoatDetailShell } from "@/components/pages/BoatDetailShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { toPublicBoat, toPublicBoats } from "@/lib/boats-public";
import { getBoatById, getBoats } from "@/lib/data";
import { buildBoatMetadata } from "@/lib/seo/build-metadata";
import {
  boatProductSchema,
  boatServiceSchema,
  breadcrumbSchema,
  schemaGraph,
} from "@/lib/seo/schemas";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return getBoats().map((b) => ({ id: b.id }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { lang } = await searchParams;
  const boat = getBoatById(id);
  if (!boat) return { title: "Boat not found" };
  return buildBoatMetadata(boat, lang);
}

export default async function BoatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boat = getBoatById(id);
  if (!boat) notFound();

  const related = getBoats().filter((b) => b.id !== id).slice(0, 4);

  return (
    <>
      <JsonLd
        data={schemaGraph(
          boatProductSchema(boat),
          boatServiceSchema(boat),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Fleet", path: "/fleet" },
            { name: boat.name, path: `/fleet/${id}` },
          ]),
        )}
      />
      <BoatDetailShell boat={toPublicBoat(boat)} related={toPublicBoats(related)} />
    </>
  );
}
