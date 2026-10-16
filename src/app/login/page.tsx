import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { googleSignInEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="px-4 py-16">
      <Suspense>
        <AuthForm mode="sign-in" googleEnabled={googleSignInEnabled} />
      </Suspense>
    </div>
  );
}
