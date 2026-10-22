import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { bearer } from "better-auth/plugins";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { siteConfig } from "@/config/site";

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

// Origins allowed to call the auth API. Besides BETTER_AUTH_URL, trust this
// project's own Vercel URLs (production alias, branch and per-deployment), which
// Vercel exposes as system environment variables without the scheme.
const vercelHosts = [
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_URL,
].filter(Boolean) as string[];

const trustedOrigins = [
  `${siteConfig.appScheme}://`, // mobile app (see app/api/auth/[...all]/route.ts)
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_SITE_URL,
  ...vercelHosts.map((host) => `https://${host}`),
].filter(Boolean) as string[];

export const auth = betterAuth({
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // TODO: requireEmailVerification once Resend is configured.
  },
  socialProviders: google,
  user: {
    additionalFields: {
      // input: false — users can never set their own role at sign-up.
      role: { type: "string", required: false, defaultValue: "customer", input: false },
      phone: { type: "string", required: false },
      timezone: { type: "string", required: false, defaultValue: "America/New_York" },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: { enabled: true },
  // bearer(): the mobile app sends "Authorization: Bearer <token>" (returned in the
  // set-auth-token header on sign-in) instead of cookies.
  plugins: [bearer(), nextCookies()], // nextCookies must stay last
});

export type Session = typeof auth.$Infer.Session;

export const googleSignInEnabled = Boolean(google);

/** Current session in a server component / route handler, or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
