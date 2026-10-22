"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";

type Defaults = { commissionPct: number; tdsPct: number; holdDays: number; discountBasis: "list" | "paid" };

export function SettingsForm({
  action,
  defaults,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaults: Defaults;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Platform commission (%)" name="commissionPct" type="number" min={0} max={100} required defaultValue={defaults.commissionPct} />
        <TextField label="TDS on payouts (%)" hint="Confirm with your CA" name="tdsPct" type="number" min={0} max={30} step="0.01" required defaultValue={defaults.tdsPct} />
        <TextField label="Refund hold (days)" name="holdDays" type="number" min={0} max={60} required defaultValue={defaults.holdDays} />
      </div>
      <fieldset>
        <legend className="text-sm font-medium">On discounted or free promo bookings (e.g. FIRSTCLASS), coach earnings are based on…</legend>
        <div className="mt-2 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input type="radio" name="discountBasis" value="list" defaultChecked={defaults.discountBasis === "list"} className="mt-0.5" />
            <span>
              <strong>Full class price</strong> — the platform pays for the discount; the coach earns as normal.
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="discountBasis" value="paid" defaultChecked={defaults.discountBasis === "paid"} className="mt-0.5" />
            <span>
              <strong>Amount the family paid</strong> — the coach shares the discount (a free class earns nothing).
            </span>
          </label>
        </div>
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
