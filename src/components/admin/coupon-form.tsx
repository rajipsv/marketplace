"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";

export function CouponForm({ action }: { action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Code" name="code" required placeholder="e.g. DIWALI25" className="uppercase" />
        <TextField label="Percent off" name="percentOff" type="number" min={1} max={100} required defaultValue={100} />
        <TextField label="Description (shown to families)" name="description" required maxLength={120} placeholder="Your first class is free" />
        <TextField label="Max uses (blank = unlimited)" name="maxRedemptions" type="number" min={1} />
        <TextField label="Valid until (optional)" name="validUntil" type="date" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="firstBookingOnly" defaultChecked className="size-4 accent-[var(--primary)]" />
        First booking only (new families)
      </label>
      <FormMessage state={state} />
      <SubmitButton>Create code</SubmitButton>
    </form>
  );
}
