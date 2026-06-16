import type { Metadata } from "next";
import { BlogPageShell } from "@/components/pages/BlogPageShell";
import { parseBlogCategoryParam } from "@/lib/blog-categories";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getPublishedArticles,
  getPublishedArticlesByCategory,
} from "@/lib/db/blog";
import { getBlogCategory } from "@/lib/blog-categories";
import {
  buildPageMetadata,
  getLocalizedPageSeo,
} from "@/lib/seo/build-metadata";
import { breadcrumbSchema, schemaGraph, webPageSchema } from "@/lib/seo/schemas";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string }>;
}): Promise<Metadata> {
  const { lang, category: categoryParam } = await searchParams;
  const category = parseBlogCategoryParam(categoryParam);
  const base = await buildPageMetadata("blog", "/blog", { lang });

  if (category === "all") return base;

  const cat = getBlogCategory(category);
  if (!cat) return base;

  const baseKeywords = Array.isArray(base.keywords)
    ? base.keywords
    : typeof base.keywords === "string"
      ? base.keywords.split(",").map((k) => k.trim())
      : [];

  return {
    ...base,
    title: `${cat.seoKeywords[0]} | Rent A Boat Villy`,
    description: `Thassos boat rental ${category} — ${cat.seoKeywords.join(", ")}. Guides from New Port of Limenaria.`,
    keywords: [...baseKeywords, ...cat.seoKeywords],
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string }>;
}) {
  const { lang, category: categoryParam } = await searchParams;
  const category = parseBlogCategoryParam(categoryParam);
  const seo = await getLocalizedPageSeo("blog", lang);
  const articles =
    category === "all"
      ? getPublishedArticles()
      : getPublishedArticlesByCategory(category);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ];
  if (category !== "all") {
    const cat = getBlogCategory(category);
    if (cat) breadcrumbItems.push({ name: cat.seoKeywords[0], path: `/blog?category=${category}` });
  }

  return (
    <>
      <JsonLd
        data={schemaGraph(
          webPageSchema({
            name: seo.title,
            description: seo.description,
            path: category === "all" ? "/blog" : `/blog?category=${category}`,
            locale: seo.locale,
          }),
          breadcrumbSchema(breadcrumbItems),
        )}
      />
      <BlogPageShell articles={articles} activeCategory={category} />
    </>
  );
}
