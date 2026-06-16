import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createArticle, isSlugTaken, isSqliteUniqueViolation } from "@/lib/db/blog";
import { parseBlogInput } from "@/lib/security/blog";
import { newId } from "@/lib/security/ids";
import { parseJsonBody } from "@/lib/security/request";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = await parseJsonBody<Record<string, unknown>>(request, 128 * 1024);
    if (!parsed.ok) return parsed.response;

    const blog = parseBlogInput(parsed.body);
    if (!blog.ok) {
      return NextResponse.json({ error: blog.error }, { status: 400 });
    }

    if (isSlugTaken(blog.data.slug)) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const now = new Date().toISOString();
    createArticle({
      id: newId("blog"),
      ...blog.data,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (isSqliteUniqueViolation(err)) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
