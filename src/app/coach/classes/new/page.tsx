import type { Metadata } from "next";
import { OfferingForm } from "@/components/coach/offering-form";
import { requireApprovedCoach } from "@/lib/authz";
import { getCategories } from "@/lib/queries";
import { saveOffering } from "../../actions";

export const metadata: Metadata = { title: "New class" };

export default async function NewClassPage() {
  await requireApprovedCoach("/coach/classes/new");
  const categories = await getCategories();
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">New class</h1>
      <div className="mt-6 rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <OfferingForm action={saveOffering} categories={categories.map((c) => ({ value: c.slug, label: c.name }))} />
      </div>
    </div>
  );
}
