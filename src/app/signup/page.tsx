import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { googleSignInEnabled } from "@/lib/auth";

export const metadata: Metadata = { title: "Join free" };

export default function SignupPage() {
  return (
    <div className="px-4 py-16">
      <Suspense>
        <AuthForm mode="sign-up" googleEnabled={googleSignInEnabled} />
      </Suspense>
    </div>
  );
}
