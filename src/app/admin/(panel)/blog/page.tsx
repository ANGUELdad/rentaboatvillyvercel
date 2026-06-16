import Link from "next/link";
import { getAllArticles } from "@/lib/db/blog";

export default function AdminBlogPage() {
  const articles = getAllArticles();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm tracking-[0.15em] text-white uppercase">
          Blog Articles
        </h2>
        <Link
          href="/admin/blog/new"
          className="glow-button rounded-xl px-4 py-2 text-[10px] tracking-[0.15em] text-white uppercase"
        >
          New article
        </Link>
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
          >
            <div>
              <p className="text-sm text-white">{article.title}</p>
              <p className="text-[10px] text-white/40">
                /blog/{article.slug} · {article.published ? "Published" : "Draft"}
              </p>
            </div>
            <Link
              href={`/admin/blog/${article.id}`}
              className="text-[10px] tracking-[0.15em] text-cyan-300/70 uppercase hover:text-cyan-300"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
