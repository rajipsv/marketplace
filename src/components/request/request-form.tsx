"use client";

import { useActionState, useEffect, useState } from "react";
import { FormMessage, SubmitButton, TextArea, TextField } from "@/components/forms/fields";
import { detectTimeZone } from "@/lib/time";
import type { FormState } from "@/lib/validation";

export function RequestForm({
  action,
  offering,
  defaults,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  offering?: { id: string; title: string } | null;
  defaults?: { name?: string; email?: string };
}) {
  const [state, formAction] = useActionState(action, {});
  const [tz, setTz] = useState("");
  useEffect(() => setTz(detectTimeZone()), []);

  if (state.ok) return <FormMessage state={state} />;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="offeringId" value={offering?.id ?? ""} />
      <input type="hidden" name="timezone" value={tz} />
      {/* Honeypot for bots — hidden from people and screen readers */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Your name" name="name" required maxLength={80} defaultValue={defaults?.name} autoComplete="name" />
        <TextField label="Email" name="email" type="email" required maxLength={120} defaultValue={defaults?.email} autoComplete="email" />
      </div>
      {offering ? (
        <p className="text-sm">
          Class: <span className="font-semibold">{offering.title}</span>
        </p>
      ) : (
        <TextField label="What would you like to learn?" name="subject" required maxLength={120} placeholder="e.g. Kuchipudi, Telugu reading, Vedic maths" />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Who is it for?" name="forWhom" maxLength={80} placeholder="e.g. My daughter, age 8" />
        <TextField label="Preferred days & times" name="preferredTimes" maxLength={200} placeholder="e.g. Weekday evenings ET, Sat mornings" />
      </div>
      <TextArea label="Anything else? (optional)" name="message" rows={3} maxLength={1000} />
      <FormMessage state={state} />
      <SubmitButton>Send request</SubmitButton>
    </form>
  );
}
