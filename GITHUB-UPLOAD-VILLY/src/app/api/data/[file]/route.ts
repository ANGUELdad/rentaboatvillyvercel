import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { atomicWriteFile } from "@/lib/security/atomic-write";
import { validateDataFile } from "@/lib/security/data-schemas";
import { parseJsonBody } from "@/lib/security/request";
import type { DataFile } from "@/types";

const ALLOWED_FILES: DataFile[] = [
  "boats",
  "faq",
  "locations",
  "chat",
  "testimonials",
  "routes",
  "legal",
  "offers",
  "gallery",
  "nav",
];

const EDITABLE_FILES = new Set<DataFile>([
  "boats",
  "faq",
  "legal",
  "offers",
  "gallery",
  "nav",
]);

function getFilePath(file: string) {
  if (!ALLOWED_FILES.includes(file as DataFile)) {
    return null;
  }
  return join(process.cwd(), "data", `${file}.json`);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { file } = await params;
  const filePath = getFilePath(file);

  if (!filePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { file } = await params;
  const filePath = getFilePath(file);

  if (!filePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  if (!EDITABLE_FILES.has(file as DataFile)) {
    return NextResponse.json(
      { error: "File is not editable via admin" },
      { status: 403 },
    );
  }

  const parsed = await parseJsonBody(request, 512 * 1024);
  if (!parsed.ok) return parsed.response;

  const validation = validateDataFile(file, parsed.body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const formatted = JSON.stringify(parsed.body, null, 2);
    if (formatted.length > 512 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }
    atomicWriteFile(filePath, `${formatted}\n`);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
