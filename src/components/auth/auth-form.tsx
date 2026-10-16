"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { detectTimeZone } from "@/lib/time";

type Mode = "sign-in" | "sign-up";

/** Only allow same-site relative redirects after sign-in. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export function AuthForm({ mode, googleEnabled }: { mode: Mode; googleEnabled: boolean }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const { error } =
      mode === "sign-up"
        ? await signUp.email({
            name: String(form.get("name")),
            email,
            password,
            timezone: detectTimeZone(),
          })
        : await signIn.email({ email, password });

    setPending(false);
    if (error) {
      setError(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function google() {
    setError(null);
    await signIn.social({ provider: "google", callbackURL: next });
  }

  const isSignUp = mode === "sign-up";

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-sm">
      <h1 className="font-display text-3xl font-semibold">{isSignUp ? "Join free" : "Welcome back"}</h1>
      <p className="mt-2 text-sm text-muted">
        {isSignUp
          ? "Create your family account. You only pay when you book a class."
          : "Sign in to manage your bookings and family profiles."}
      </p>

      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={google}
            className="mt-6 w-full cursor-pointer rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-surface-muted"
          >
            Continue with Google
          </button>
          <p className="my-5 text-center text-xs uppercase tracking-wide text-muted">or with email</p>
        </>
      )}

      <form onSubmit={onSubmit} className={googleEnabled ? "space-y-4" : "mt-6 space-y-4"}>
        {isSignUp && (
          <Field label="Your name" name="name" autoComplete="name" required />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={8}
          required
        />

        {error && (
          <p role="alert" className="rounded-xl bg-kumkum/10 px-3 py-2 text-sm text-kumkum">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full cursor-pointer rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-strong disabled:opacity-60"
        >
          {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignUp ? "Already have an account? " : "New here? "}
        <Link
          href={`${isSignUp ? "/login" : "/signup"}${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-primary hover:underline"
        >
          {isSignUp ? "Sign in" : "Join free"}
        </Link>
      </p>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-primary"
      />
    </label>
  );
}
