import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  deleteArticle,
  getArticleById,
  isSlugTaken,
  isSqliteUniqueViolation,
  updateArticle,
} from "@/lib/db/blog";
import { parseBlogInput } from "@/lib/security/blog";
import { parseJsonBody } from "@/lib/security/request";
import { isValidEntityId } from "@/lib/security/validate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidEntityId(id)) {
    return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
  }

  if (!getArticleById(id)) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const parsed = await parseJsonBody<Record<string, unknown>>(request, 128 * 1024);
  if (!parsed.ok) return parsed.response;

  const blog = parseBlogInput(parsed.body);
  if (!blog.ok) {
    return NextResponse.json({ error: blog.error }, { status: 400 });
  }

  if (isSlugTaken(blog.data.slug, id)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }

  try {
    const ok = updateArticle(id, blog.data);
    if (!ok) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    if (isSqliteUniqueViolation(err)) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidEntityId(id)) {
    return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
  }

  try {
    const ok = deleteArticle(id);
    if (!ok) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}
