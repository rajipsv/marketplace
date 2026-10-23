"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function PayoutForm({
  action,
  defaultName,
  defaultMethod = "bank",
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  defaultName: string;
  defaultMethod?: "bank" | "upi";
}) {
  const [state, formAction] = useActionState(action, {});
  const [method, setMethod] = useState<"bank" | "upi">(defaultMethod);

  return (
    <form action={formAction} className="space-y-5" autoComplete="off">
      <input type="hidden" name="method" value={method} />
      <div role="radiogroup" aria-label="How should we pay you?" className="flex gap-2">
        {(["bank", "upi"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={method === m}
            onClick={() => setMethod(m)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium",
              method === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
            )}
          >
            {m === "bank" ? "Bank account" : "UPI"}
          </button>
        ))}
      </div>

      <TextField label="Account holder name (as per bank)" name="accountHolderName" required defaultValue={defaultName} />
      {method === "bank" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Bank account number" name="bankAccount" inputMode="numeric" required autoComplete="off" />
          <TextField label="IFSC" name="ifsc" required placeholder="HDFC0001234" className="uppercase" />
        </div>
      ) : (
        <TextField label="UPI ID" name="upi" required placeholder="name@okicici" autoComplete="off" />
      )}
      <TextField
        label="PAN"
        hint="Needed for TDS. Without PAN the law requires a much higher TDS rate."
        name="pan"
        required
        placeholder="ABCDE1234F"
        className="uppercase"
        autoComplete="off"
      />

      <p className="text-xs text-muted">
        Your details are encrypted and only used to pay you. After you save, we confirm the account with a small test transfer.
      </p>
      <FormMessage state={state} />
      <SubmitButton>Save payout details</SubmitButton>
    </form>
  );
}
