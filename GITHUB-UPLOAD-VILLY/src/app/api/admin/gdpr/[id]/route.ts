import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { updateGdprRequestStatus } from "@/lib/db/gdpr";
import { parseJsonBody } from "@/lib/security/request";
import { isValidEntityId } from "@/lib/security/validate";
import type { GdprRequest } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!isValidEntityId(id)) {
      return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
    }

    const parsed = await parseJsonBody<{ status?: GdprRequest["status"] }>(
      request,
      1024,
    );
    if (!parsed.ok) return parsed.response;

    const valid = ["pending", "completed", "rejected"] as const;
    if (!parsed.body.status || !valid.includes(parsed.body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = updateGdprRequestStatus(id, parsed.body.status);
    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
