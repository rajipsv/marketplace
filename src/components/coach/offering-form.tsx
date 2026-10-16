"use client";

import { useActionState, useState } from "react";
import { CheckboxGroup, FormMessage, SelectField, SubmitButton, TextArea, TextField } from "@/components/forms/fields";
import { languages } from "@/lib/content";
import type { FormState } from "@/lib/validation";

export type OfferingDefaults = {
  id?: string;
  title: string;
  categorySlug: string;
  description: string | null;
  format: "one-on-one" | "group" | "weekly-class";
  audience: "adults" | "kids" | "family";
  durationMin: number;
  priceUsd: number;
  capacity: number;
  languages: string[];
  isActive: boolean;
};

export function OfferingForm({
  action,
  categories,
  defaults,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  categories: { value: string; label: string }[];
  defaults?: OfferingDefaults;
}) {
  const [state, formAction] = useActionState(action, {});
  const [format, setFormat] = useState(defaults?.format ?? "one-on-one");

  return (
    <form action={formAction} className="space-y-5">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <TextField label="Class title" name="title" required maxLength={100} defaultValue={defaults?.title} placeholder="e.g. Chess for Beginners (Ages 7–12)" />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Category" name="categorySlug" defaultValue={defaults?.categorySlug} options={categories} />
        <SelectField
          label="Who is it for?"
          name="audience"
          defaultValue={defaults?.audience ?? "family"}
          options={[
            { value: "kids", label: "Children" },
            { value: "adults", label: "Adults" },
            { value: "family", label: "All ages" },
          ]}
        />
        <SelectField
          label="Format"
          name="format"
          value={format}
          onChange={(e) => setFormat(e.target.value as OfferingDefaults["format"])}
          options={[
            { value: "one-on-one", label: "1-on-1 (booked from your weekly hours)" },
            { value: "group", label: "Live group session (you set the dates)" },
            { value: "weekly-class", label: "Weekly class (you set the dates)" },
          ]}
        />
        <TextField
          label="Length (minutes)"
          name="durationMin"
          type="number"
          min={15}
          max={240}
          step={5}
          required
          defaultValue={defaults?.durationMin ?? 60}
        />
        <TextField
          label="Price per session (USD)"
          hint="Enter 0 for a free session"
          name="priceUsd"
          type="number"
          min={0}
          max={1000}
          step="0.01"
          required
          defaultValue={defaults?.priceUsd ?? 10}
        />
        {format !== "one-on-one" && (
          <TextField
            label="Maximum students"
            name="capacity"
            type="number"
            min={1}
            max={50}
            defaultValue={defaults?.capacity && defaults.capacity > 1 ? defaults.capacity : 10}
          />
        )}
      </div>

      <TextArea
        label="Description"
        hint="What students will learn, level, what to prepare"
        name="description"
        maxLength={2000}
        defaultValue={defaults?.description ?? ""}
      />

      <CheckboxGroup
        legend="Taught in"
        name="languages"
        options={languages.map((l) => ({ value: l, label: l }))}
        defaultValues={defaults?.languages ?? ["English"]}
      />

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="isActive" defaultChecked={defaults?.isActive ?? true} className="size-4 accent-[var(--primary)]" />
        Show this class to families
      </label>

      <FormMessage state={state} />
      <SubmitButton>{defaults?.id ? "Save changes" : "Create class"}</SubmitButton>
    </form>
  );
}
