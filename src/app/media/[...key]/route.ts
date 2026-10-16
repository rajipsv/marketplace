import { NextResponse } from "next/server";
import { presignDownload, publicUrl, r2Configured } from "@/lib/r2";

// Serves public R2 objects (coach photos, intro videos) without making the
// bucket public: redirects to a short-lived signed URL. private/* is refused.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!key.startsWith("public/") || key.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const direct = publicUrl(key);
  if (direct) return NextResponse.redirect(direct, 308);
  if (!r2Configured()) return new NextResponse("Not found", { status: 404 });

  const url = await presignDownload(key, 3600);
  return NextResponse.redirect(url, {
    status: 302,
    // Browsers/CDN may reuse the redirect for a while, well inside the URL's 1h lifetime.
    headers: { "Cache-Control": "public, max-age=1800" },
  });
}
