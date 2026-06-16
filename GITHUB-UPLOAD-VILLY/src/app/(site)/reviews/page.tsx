import type { Metadata } from "next";
import { ReviewsPageShell } from "@/components/pages/ReviewsPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getTestimonials } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { breadcrumbSchema, reviewSchema, schemaGraph } from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("reviews", "/reviews", { lang });
}

export default function ReviewsPage() {
  const testimonials = getTestimonials();

  return (
    <>
      <JsonLd
        data={schemaGraph(
          reviewSchema(testimonials),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Reviews", path: "/reviews" },
          ]),
        )}
      />
      <ReviewsPageShell testimonials={testimonials} />
    </>
  );
}
