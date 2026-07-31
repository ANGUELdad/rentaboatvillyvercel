type ApiFail = { ok: false; error: string; status: number; code?: string };
type ApiOk<T> = { ok: true; data: T };

async function parseResponse(res: Response): Promise<Record<string, unknown>> {
  try {
    const text = await res.text();
    if (!text) return {};
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function fail(res: Response, body: Record<string, unknown>): ApiFail {
  return {
    ok: false,
    error: String(body.error ?? "Request failed"),
    status: res.status,
    code: typeof body.code === "string" ? body.code : undefined,
  };
}

export async function postJson<T = Record<string, unknown>>(
  url: string,
  payload: unknown,
): Promise<ApiOk<T> | ApiFail> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await parseResponse(res);
    if (!res.ok) return fail(res, body);
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "Network error — check your connection", status: 0 };
  }
}

export async function patchJson<T = Record<string, unknown>>(
  url: string,
  payload: unknown,
): Promise<ApiOk<T> | ApiFail> {
  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await parseResponse(res);
    if (!res.ok) return fail(res, body);
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "Network error — check your connection", status: 0 };
  }
}

export async function putJson<T = Record<string, unknown>>(
  url: string,
  payload: unknown,
): Promise<ApiOk<T> | ApiFail> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await parseResponse(res);
    if (!res.ok) return fail(res, body);
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "Network error — check your connection", status: 0 };
  }
}

export async function getJson<T = unknown>(url: string): Promise<ApiOk<T> | ApiFail> {
  try {
    const res = await fetch(url);
    const body = await parseResponse(res);
    if (!res.ok) return fail(res, body);
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "Network error — check your connection", status: 0 };
  }
}

export async function deleteRequest(url: string): Promise<ApiOk<{ success: boolean }> | ApiFail> {
  try {
    const res = await fetch(url, { method: "DELETE" });
    const body = await parseResponse(res);
    if (!res.ok) return fail(res, body);
    return { ok: true, data: { success: true } };
  } catch {
    return { ok: false, error: "Network error — check your connection", status: 0 };
  }
}
