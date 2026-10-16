"use client";

import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    // Mirrors user.additionalFields in src/lib/auth.ts so the client is typed.
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false, input: false },
        phone: { type: "string", required: false },
        timezone: { type: "string", required: false },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
