// Browser-side helper for calling our /api/v1 endpoints with the standard { data } / { error } shapes.

export type ApiIssue = { path: string; message: string };
export type ApiError = { code: string; message: string; details?: { issues?: ApiIssue[] } };
export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: ApiError };

export async function api<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json && "data" in json) return { ok: true, data: json.data as T };
    return {
      ok: false,
      status: res.status,
      error: json?.error ?? { code: "INTERNAL", message: `Request failed (${res.status})` },
    };
  } catch {
    return { ok: false, status: 0, error: { code: "NETWORK", message: "Can't reach the server. Check your connection." } };
  }
}

/** Turns API validation issues into { "questions.0.text": "message" } for showing next to fields. */
export function issuesByPath(error: ApiError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of error.details?.issues ?? []) out[i.path] ??= i.message;
  return out;
}
