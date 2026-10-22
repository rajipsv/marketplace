import { toNextJsHandler } from "better-auth/next-js";
import { siteConfig } from "@/config/site";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);
const appOrigin = `${siteConfig.appScheme}://`;

/**
 * Native apps don't send an Origin header, which Better Auth requires on sign-in.
 * Like the official @better-auth/expo server plugin, accept the app's own
 * "expo-origin" header as the origin — only when the request has no Origin
 * (browsers always send one, so web CSRF protection is unchanged) and only for
 * this app's scheme.
 */
async function withAppOrigin(req: Request) {
  const appHeader = req.headers.get("expo-origin");
  if (req.headers.get("origin") || !appHeader?.startsWith(appOrigin)) return req;
  const headers = new Headers(req.headers);
  headers.set("origin", appHeader);
  // Copy the body explicitly: re-wrapping a streamed body is not allowed in Node.
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();
  return new Request(req.url, { method: req.method, headers, body });
}

export const GET = async (req: Request) => handler.GET(await withAppOrigin(req));
export const POST = async (req: Request) => handler.POST(await withAppOrigin(req));
