import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/coach/profile-form";
import { db } from "@/db";
import { coachCategory } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";
import { getCategories } from "@/lib/queries";
import { updateProfile } from "../actions";

export const metadata: Metadata = { title: "Edit profile" };

export default async function CoachProfilePage() {
  const { coach } = await requireApprovedCoach("/coach/profile");
  const [categories, own] = await Promise.all([
    getCategories(),
    db.select({ slug: coachCategory.categorySlug }).from(coachCategory).where(eq(coachCategory.coachId, coach.id)),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Your profile</h1>
      <p className="mt-1 text-muted">This is what families see on your public page.</p>
      <div className="mt-6 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <ProfileForm
          action={updateProfile}
          categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
          defaults={{
            displayName: coach.displayName,
            title: coach.title,
            city: coach.city,
            bio: coach.bio,
            yearsExperience: coach.yearsExperience,
            languages: coach.languages,
            categories: own.map((c) => c.slug),
            photoKey: coach.photoKey,
            introVideoKey: coach.introVideoKey,
          }}
          submitLabel="Save profile"
        />
      </div>
    </div>
  );
}
