/** Public API address. Set in frontend/.env.local (NEXT_PUBLIC_API_URL). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/**
 * Browser-side GET for dashboards. Accepts either { data } or a bare array/object.
 * Errors are returned as values so pages can show a clear message instead of crashing.
 */
export async function apiGet<T = unknown>(path: string): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    });
    if (!res.ok) {
      const signIn = res.status === 401 || res.status === 403;
      return {
        ok: false,
        status: res.status,
        message: signIn ? "Sign in to view this data." : `The API returned an error (${res.status}).`
      };
    }
    const body = (await res.json()) as { data?: T } | T;
    const data = (body && typeof body === "object" && "data" in body ? (body as { data?: T }).data : body) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, message: "The API is not reachable. Start the backend with npm run dev." };
  }
}
