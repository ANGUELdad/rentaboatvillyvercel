import { BlogEditor } from "@/components/admin/BlogEditor";
import { getArticleById } from "@/lib/db/blog";
import { notFound } from "next/navigation";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();
  return <BlogEditor article={article} />;
}
