import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { presignUpload, publicUrl, r2Configured } from "@/lib/r2";

// What can be uploaded, where it lands in the bucket, and limits.
// public/* is served via the public R2 URL; private/* only via signed links.
const kinds = {
  "coach-photo": {
    prefix: "public/coaches",
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
    maxBytes: 5 * 1024 * 1024,
  },
  "intro-video": {
    prefix: "public/intro-videos",
    types: { "video/mp4": "mp4", "video/webm": "webm" },
    maxBytes: 200 * 1024 * 1024,
  },
  "credential-doc": {
    prefix: "private/credentials",
    types: { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png" },
    maxBytes: 10 * 1024 * 1024,
  },
} as const;

const body = z.object({
  kind: z.enum(Object.keys(kinds) as [keyof typeof kinds, ...(keyof typeof kinds)[]]),
  contentType: z.string(),
  size: z.number().int().positive(),
});

/** Returns a presigned PUT URL; the browser uploads straight to R2. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!r2Configured()) return NextResponse.json({ error: "Uploads are not configured yet" }, { status: 503 });

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { kind, contentType, size } = parsed.data;
  const rule = kinds[kind];
  const ext = (rule.types as Record<string, string>)[contentType];
  if (!ext) return NextResponse.json({ error: `Unsupported file type for ${kind}` }, { status: 415 });
  if (size > rule.maxBytes) return NextResponse.json({ error: "File is too large" }, { status: 413 });

  const key = `${rule.prefix}/${session.user.id}/${randomUUID()}.${ext}`;
  const uploadUrl = await presignUpload(key, contentType, size);

  return NextResponse.json({
    key,
    uploadUrl,
    publicUrl: rule.prefix.startsWith("public/") ? publicUrl(key) : null,
  });
}
