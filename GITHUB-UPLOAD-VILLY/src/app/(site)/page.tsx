import type { Metadata } from "next";
import { HomeSections } from "@/components/home/HomeSections";
import { JsonLd } from "@/components/seo/JsonLd";
import { toPublicBoats } from "@/lib/boats-public";
import {
  getBoats,
  getFAQ,
  getGallery,
  getMatchmaker,
  getRoutes,
  getTestimonials,
} from "@/lib/data";
import {
  buildPageMetadata,
  getLocalizedPageSeo,
} from "@/lib/seo/build-metadata";
import {
  faqPageSchema,
  fleetItemListSchema,
  localBusinessSchema,
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
  return buildPageMetadata("home", "", { lang });
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const seo = await getLocalizedPageSeo("home", lang);
  const boats = getBoats();
  const testimonials = getTestimonials();
  const matchmaker = getMatchmaker();
  const routesData = getRoutes();
  const gallery = getGallery();

  return (
    <>
      <link
        rel="preload"
        href="/videos/posters/rent-a-boat-villy.jpg"
        as="image"
        fetchPriority="high"
      />
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: "",
            locale: seo.locale,
          }),
          localBusinessSchema(testimonials),
          rentBoatThassosServiceSchema(boats.length),
          touristTripSchema(),
          fleetItemListSchema(boats),
          faqPageSchema(
            getFAQ().slice(0, 5).map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          ),
        )}
      />
      <HomeSections
        boats={toPublicBoats(boats)}
        routes={routesData.routes}
        testimonials={testimonials}
        matchmaker={matchmaker}
        galleryItems={gallery.items}
      />
    </>
  );
}
