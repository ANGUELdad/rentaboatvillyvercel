"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { deleteRequest, postJson, putJson } from "@/lib/client-api";
import { sanitizeBlogHtml } from "@/lib/security/sanitize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BlogArticle } from "@/types";

interface BlogEditorProps {
  article?: BlogArticle;
}

export function BlogEditor({ article }: BlogEditorProps) {
  const router = useRouter();
  const isNew = !article;

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [published, setPublished] = useState(article?.published ?? true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const submittingRef = useRef(false);

  const previewHtml = useMemo(() => sanitizeBlogHtml(content), [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("loading");
    setErrorMsg("");

    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      published,
    };

    try {
      const result = isNew
        ? await postJson("/api/admin/blog", payload)
        : await putJson(`/api/admin/blog/${article!.id}`, payload);

      if (result.ok) {
        router.push("/admin/blog");
        router.refresh();
      } else {
        setStatus("error");
        setErrorMsg(result.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — try again");
    } finally {
      submittingRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (!article || !confirm("Delete this article?")) return;
    const result = await deleteRequest(`/api/admin/blog/${article.id}`);
    if (result.ok) {
      router.push("/admin/blog");
      router.refresh();
    } else {
      setStatus("error");
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={handleSubmit} className="glass-panel space-y-4 rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white">
          {isNew ? "New article" : "Edit article"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[10px] text-white/50 uppercase">Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] text-white/50 uppercase">Slug</Label>
            <Input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
              placeholder="my-article-slug"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] text-white/50 uppercase">Excerpt</Label>
          <Textarea
            required
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="border-white/10 bg-white/5 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] text-white/50 uppercase">
            Content (HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;)
          </Label>
          <Textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-48 border-white/10 bg-white/5 font-mono text-xs text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] text-white/50 uppercase">Cover image URL</Label>
          <Input
            required
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="border-white/10 bg-white/5 text-white"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-white/60">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded"
          />
          Published
        </label>
        {status === "error" && (
          <p className="text-xs text-red-400">{errorMsg || "Save failed."}</p>
        )}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={status === "loading"}
            className="glow-button text-[10px] tracking-[0.15em] text-white uppercase"
          >
            {status === "loading" ? "Saving..." : "Save article"}
          </Button>
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="border-red-400/30 text-red-300 hover:bg-red-400/10"
            >
              Delete
            </Button>
          )}
        </div>
      </form>

      <div className="glass-panel sticky top-6 h-fit space-y-4 rounded-2xl p-6">
        <p className="text-[10px] tracking-[0.2em] text-cyan-300/80 uppercase">
          Live preview
        </p>
        {coverImage && (
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <SafeImage
              src={coverImage}
              alt={title || "Cover"}
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-white">
            {title || "Article title"}
          </h3>
          <p className="mt-2 text-sm text-white/55">
            {excerpt || "Excerpt appears here…"}
          </p>
          <p className="mt-2 text-[10px] text-white/35">
            /blog/{slug || "slug"}
          </p>
        </div>
        <div
          className="prose-invert max-w-none space-y-3 text-sm leading-relaxed text-white/70 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-white [&_li]:ml-4 [&_p]:text-white/65"
          dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Start writing…</p>" }}
        />
      </div>
    </div>
  );
}
