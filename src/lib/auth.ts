import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

export const auth = betterAuth({
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
  plugins: [nextCookies()], // must stay last
});

export type Session = typeof auth.$Infer.Session;

export const googleSignInEnabled = Boolean(google);

/** Current session in a server component / route handler, or null. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
