"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import type { FormState } from "@/lib/validation";

type Window = { weekday: number; start: string; end: string };
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityEditor({
  action,
  initial,
  timezoneLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial: Window[];
  timezoneLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [windows, setWindows] = useState<Window[]>(initial);

  const update = (i: number, patch: Partial<Window>) =>
    setWindows((w) => w.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="windows" value={JSON.stringify(windows)} />
      <p className="text-sm text-muted">All times are in {timezoneLabel}. Families see them converted to their own time zone.</p>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {days.map((day, d) => {
          const own = windows.map((w, i) => ({ w, i })).filter(({ w }) => w.weekday === d);
          return (
            <li key={day} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
              <span className="w-28 shrink-0 pt-2 font-medium">{day}</span>
              <div className="flex-1 space-y-2">
                {own.length === 0 && <p className="pt-2 text-sm text-muted">Unavailable</p>}
                {own.map(({ w, i }) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <input
                      type="time"
                      aria-label={`${day} start`}
                      value={w.start}
                      onChange={(e) => update(i, { start: e.target.value })}
                      className="rounded-lg border border-border bg-background px-2 py-1.5"
                    />
                    <span className="text-muted">to</span>
                    <input
                      type="time"
                      aria-label={`${day} end`}
                      value={w.end}
                      onChange={(e) => update(i, { end: e.target.value })}
                      className="rounded-lg border border-border bg-background px-2 py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => setWindows((x) => x.filter((_, j) => j !== i))}
                      className="cursor-pointer rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-kumkum"
                      aria-label={`Remove ${day} ${w.start}–${w.end}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setWindows((x) => [...x, { weekday: d, start: "18:00", end: "21:00" }])}
                className="inline-flex cursor-pointer items-center gap-1 self-start rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted"
              >
                <Plus className="size-3.5" aria-hidden /> Add hours
              </button>
            </li>
          );
        })}
      </ul>

      <FormMessage state={state} />
      <SubmitButton>Save weekly hours</SubmitButton>
    </form>
  );
}
