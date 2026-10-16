"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormMessage, SubmitButton, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";

export function AddMemberForm({ action }: { action: (prev: FormState, fd: FormData) => Promise<FormState> }) {
  const [state, formAction] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
        <TextField label="Child's name" name="name" required maxLength={60} />
        <TextField label="Birth year (optional)" name="birthYear" type="number" min={1926} max={2100} />
      </div>
      <TextField label="Notes for teachers (optional)" name="notes" maxLength={300} placeholder="e.g. beginner, shy at first" />
      <FormMessage state={state} />
      <SubmitButton>Add to family</SubmitButton>
    </form>
  );
}
