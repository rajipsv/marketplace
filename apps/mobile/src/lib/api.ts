import type { ApiFailure, ApiSuccess } from "@shared/api";
import { authClient } from "./auth-client";
import { API_URL } from "./config";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Calls the website's /api/v1 JSON API with the signed-in session (sent as a
 * cookie, as recommended for Better Auth on Expo). Returns `data` or throws ApiError.
 */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const cookie = await authClient.getCookie();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method: init.method ?? "GET",
    credentials: "omit", // cookies are set manually below
    headers: {
      Accept: "application/json",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;
  if (!res.ok || !json || "error" in json) {
    const err = json && "error" in json ? json.error : { code: "network", message: "Something went wrong. Please try again." };
    throw new ApiError(res.status, err.code, err.message);
  }
  return json.data;
}
