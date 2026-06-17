import type { Metadata } from "next";
import { PackagePageShell } from "@/components/pages/PackagePageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { toPublicBoats } from "@/lib/boats-public";
import { getBoats } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { breadcrumbSchema, schemaGraph } from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("package", "/package", { lang });
}

export default function PackagePage() {
  const boats = getBoats();

  return (
    <>
      <JsonLd
        data={schemaGraph(
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Request pricing", path: "/package" },
          ]),
        )}
      />
      <PackagePageShell boats={toPublicBoats(boats)} />
    </>
  );
}
