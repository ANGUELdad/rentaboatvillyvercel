import type { Metadata } from "next";
import { FaqPageShell } from "@/components/pages/FaqPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFAQ } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo/build-metadata";
import { breadcrumbSchema, faqPageSchema, schemaGraph } from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildPageMetadata("faq", "/faq", { lang });
}

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={schemaGraph(
          faqPageSchema(
            getFAQ().map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          ),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        )}
      />
      <FaqPageShell />
    </>
  );
}
