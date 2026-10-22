import "server-only";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Result } from "@/server/services/result";

// Helpers for the JSON API under /api/v1 (used by the mobile app).

const statusFor = { invalid_input: 400, forbidden: 403, not_found: 404, conflict: 409, rate_limited: 429 } as const;

export function ok<T>(data: T, init?: { status?: number; cache?: "public" | "private" }) {
  return NextResponse.json(
    { data },
    {
      status: init?.status ?? 200,
      headers: {
        "Cache-Control": init?.cache === "public" ? "public, s-maxage=60, stale-while-revalidate=300" : "private, no-store",
      },
    },
  );
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Turns a service Result into a JSON response. */
export function fromResult<T extends object>(r: Result<T>, okStatus = 200) {
  if (r.ok) {
    const { ok: _ok, ...data } = r as { ok: true } & T;
    void _ok;
    return ok(data, { status: okStatus });
  }
  return fail(statusFor[r.code], r.code, r.error);
}

/** Signed-in user from a session cookie or "Authorization: Bearer <token>", else null. */
export async function apiUser(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  return session?.user ?? null;
}

export const unauthorized = () => fail(401, "unauthorized", "Please sign in.");

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
