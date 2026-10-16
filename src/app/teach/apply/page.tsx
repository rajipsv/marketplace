import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, XCircle } from "lucide-react";
import { ProfileForm } from "@/components/coach/profile-form";
import { getOwnCoach, requireUser } from "@/lib/authz";
import { getCategories } from "@/lib/queries";
import { submitApplication } from "./actions";

export const metadata: Metadata = { title: "Apply to teach" };

export default async function ApplyPage() {
  const user = await requireUser("/teach/apply");
  const existing = await getOwnCoach(user.id);

  if (existing?.status === "approved") {
    return (
      <Shell>
        <h1 className="font-display text-3xl font-semibold">You&apos;re approved 🎉</h1>
        <p className="mt-3 text-muted">Set up your classes and availability from your teacher dashboard.</p>
        <Link
          href="/coach"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Go to dashboard
        </Link>
      </Shell>
    );
  }

  if (existing) {
    const rejected = existing.status === "rejected" || existing.status === "suspended";
    return (
      <Shell>
        {rejected ? (
          <XCircle className="size-10 text-kumkum" aria-hidden />
        ) : (
          <Clock3 className="size-10 text-accent-strong" aria-hidden />
        )}
        <h1 className="mt-4 font-display text-3xl font-semibold">
          {rejected ? "Application not approved" : "Application received"}
        </h1>
        <p className="mt-3 text-muted">
          {rejected
            ? "Thank you for applying. We're unable to approve your application at this time. Please contact us if you have questions."
            : "Thank you! Our team is reviewing your profile and documents. You'll be able to set up classes as soon as you're approved."}
        </p>
      </Shell>
    );
  }

  const categories = (await getCategories()).map((c) => ({ value: c.slug, label: c.name }));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Apply to teach</h1>
      <p className="mt-2 text-muted">
        Tell families in the USA about you. We review every application before a profile goes live.
      </p>
      <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <ProfileForm
          action={submitApplication}
          categories={categories}
          defaults={{ displayName: user.name }}
          submitLabel="Submit application"
          withCredentials
        />
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center [&>svg]:mx-auto">{children}</div>
  );
}
