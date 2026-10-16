"use client";

import { useActionState } from "react";
import { FormMessage, SelectField, SubmitButton, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";

export function SessionScheduler({
  action,
  offeringId,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  offeringId: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="offeringId" value={offeringId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Date (India)" name="date" type="date" required />
        <TextField label="Start time (IST)" name="time" type="time" required />
        <SelectField
          label="Repeat"
          name="repeatWeeks"
          defaultValue="1"
          options={[
            { value: "1", label: "Just once" },
            { value: "4", label: "Weekly × 4" },
            { value: "8", label: "Weekly × 8" },
            { value: "12", label: "Weekly × 12" },
          ]}
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton>Add session</SubmitButton>
    </form>
  );
}
