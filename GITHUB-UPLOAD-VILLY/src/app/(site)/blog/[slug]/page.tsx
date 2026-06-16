import type { Metadata } from "next";
import { BlogArticleView } from "@/components/blog/BlogArticleView";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBlogArticleMetadata } from "@/lib/seo/build-metadata";
import { localizeBlogArticle } from "@/lib/i18n/blog-translations";
import { articleSchema, breadcrumbSchema, schemaGraph } from "@/lib/seo/schemas";
import { notFound } from "next/navigation";
import { getArticleBySlug, getPublishedArticles, getRelatedArticles } from "@/lib/db/blog";
import { getBlogCategory } from "@/lib/blog-categories";
import { isValidSlug } from "@/lib/security/validate";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export async function generateStaticParams() {
  const articles = getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  const locale = await getRequestLocale(lang);
  const localized = localizeBlogArticle(article, locale);
  return buildBlogArticleMetadata(localized, lang);
}

export default async function BlogArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang } = await searchParams;
  if (!isValidSlug(slug)) notFound();
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const locale = await getRequestLocale(lang);
  const localized = localizeBlogArticle(article, locale);
  const date = new Date(article.createdAt).toLocaleDateString(
    locale === "en" ? "en-GB" : locale,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const related = getRelatedArticles(article, 4);
  const categoryMeta = getBlogCategory(article.category);

  return (
    <>
      <JsonLd
        data={schemaGraph(
          articleSchema({
            title: localized.title,
            description: localized.excerpt,
            slug: article.slug,
            publishedAt: article.createdAt,
            updatedAt: article.updatedAt,
            image: article.coverImage,
            locale,
            articleSection: categoryMeta?.seoKeywords[0],
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: localized.title, path: `/blog/${article.slug}` },
          ]),
        )}
      />
      <BlogArticleView article={article} date={date} related={related} />
    </>
  );
}
