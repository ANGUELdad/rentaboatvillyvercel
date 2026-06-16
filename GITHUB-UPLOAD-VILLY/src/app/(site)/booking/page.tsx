import type { Metadata } from "next";
import { BookingPageShell } from "@/components/pages/BookingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { toPublicBoats } from "@/lib/boats-public";
import { getBoats } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { bookingServiceSchema, breadcrumbSchema, schemaGraph } from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("booking", "/booking", { lang });
}

export default function BookingPage() {
  const boats = getBoats();

  return (
    <>
      <JsonLd
        data={schemaGraph(
          bookingServiceSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Book", path: "/booking" },
          ]),
        )}
      />
      <BookingPageShell boats={toPublicBoats(boats)} />
    </>
  );
}
