import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { CheckCircle2, Clock3 } from "lucide-react";
import { PayoutForm } from "@/components/coach/payout-form";
import { assertApprovedCoach, requireApprovedCoach } from "@/lib/authz";
import type { FormState } from "@/lib/validation";
import { getPayoutSummary, savePayoutAccount } from "@/server/services/payout-account";

export const metadata: Metadata = { title: "Payout details" };

async function savePayout(_prev: FormState, fd: FormData): Promise<FormState> {
  "use server";
  const { coach } = await assertApprovedCoach();
  const r = await savePayoutAccount(coach.id, {
    method: String(fd.get("method") ?? "") as "bank" | "upi",
    accountHolderName: String(fd.get("accountHolderName") ?? ""),
    bankAccount: String(fd.get("bankAccount") ?? ""),
    ifsc: String(fd.get("ifsc") ?? ""),
    upi: String(fd.get("upi") ?? ""),
    pan: String(fd.get("pan") ?? ""),
  });
  if (!r.ok) return { error: r.error };
  revalidatePath("/coach", "layout");
  revalidatePath("/admin/payouts");
  return { ok: true, message: "Saved. We'll confirm your account with a small test transfer." };
}

export default async function PayoutDetailsPage() {
  const { coach } = await requireApprovedCoach("/coach/payout-details");
  const current = await getPayoutSummary(coach.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Payout details</h1>
        <p className="mt-1 text-muted">Where we send your earnings, in rupees.</p>
      </div>

      {current && (
        <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            {current.verified ? (
              <>
                <CheckCircle2 className="size-5 text-success" aria-hidden /> Verified
              </>
            ) : (
              <>
                <Clock3 className="size-5 text-accent-strong" aria-hidden /> Waiting for verification
              </>
            )}
          </p>
          <p className="mt-2 text-muted">
            {current.accountHolderName} · {current.destination} · PAN {current.pan}
          </p>
          <p className="mt-1 text-xs text-muted">To change these details, fill in the form again. Changes need re-verification.</p>
        </div>
      )}

      <div className="rounded-3xl border border-border bg-surface p-6">
        <PayoutForm action={savePayout} defaultName={current?.accountHolderName ?? coach.displayName} defaultMethod={current?.method} />
      </div>
    </div>
  );
}
