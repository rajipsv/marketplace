import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SettingsForm } from "@/components/admin/settings-form";
import { assertRole, requireRole } from "@/lib/authz";
import { getSettings, saveSettings } from "@/lib/settings";
import { firstError, type FormState } from "@/lib/validation";

export const metadata: Metadata = { title: "Settings · Admin" };

const schema = z.object({
  commissionPct: z.coerce.number().int().min(0).max(100),
  tdsPct: z.coerce.number().min(0).max(30),
  holdDays: z.coerce.number().int().min(0).max(60),
  discountBasis: z.enum(["list", "paid"]),
});

async function updateSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  "use server";
  await assertRole(["admin"]);
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: firstError(parsed.error) };
  await saveSettings(parsed.data);
  revalidatePath("/admin", "layout");
  revalidatePath("/coach-agreement");
  return { ok: true, message: "Settings saved. They apply to classes completed from now on." };
}

export default async function AdminSettingsPage() {
  await requireRole(["admin"], "/admin/settings");
  const s = await getSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Used for coach earnings and payouts, and shown in the Coach agreement. Changes don&apos;t alter earnings already recorded.
      </p>
      <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
        <SettingsForm action={updateSettings} defaults={s} />
      </div>
    </div>
  );
}
