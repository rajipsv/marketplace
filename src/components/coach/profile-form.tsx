"use client";

import { useActionState } from "react";
import { CheckboxGroup, FormMessage, SubmitButton, TextArea, TextField } from "@/components/forms/fields";
import { FileUpload } from "@/components/forms/file-upload";
import { languages } from "@/lib/content";
import type { FormState } from "@/lib/validation";

export type ProfileDefaults = {
  displayName: string;
  title: string;
  city: string;
  bio: string | null;
  yearsExperience: number;
  languages: string[];
  categories: string[];
  photoKey: string | null;
  introVideoKey: string | null;
};

/** Teacher profile fields; used for the application and for later edits. */
export function ProfileForm({
  action,
  categories,
  defaults,
  submitLabel,
  withCredentials = false,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  categories: { value: string; label: string }[];
  defaults?: Partial<ProfileDefaults>;
  submitLabel: string;
  withCredentials?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Name shown to students" name="displayName" required defaultValue={defaults?.displayName} />
        <TextField
          label="What you teach"
          hint="e.g. Chess coach, Bharatanatyam teacher"
          name="title"
          required
          defaultValue={defaults?.title}
        />
        <TextField label="City in India" name="city" defaultValue={defaults?.city} />
        <TextField
          label="Years of teaching experience"
          name="yearsExperience"
          type="number"
          min={0}
          max={70}
          defaultValue={defaults?.yearsExperience ?? 0}
        />
      </div>

      <TextArea
        label="About you"
        hint="Your background, training and how you teach (up to 1500 characters)"
        name="bio"
        maxLength={1500}
        defaultValue={defaults?.bio ?? ""}
      />

      <CheckboxGroup
        legend="Categories"
        hint="Choose up to 3"
        name="categories"
        options={categories}
        defaultValues={defaults?.categories}
      />
      <CheckboxGroup
        legend="Languages you teach in"
        name="languages"
        options={languages.map((l) => ({ value: l, label: l }))}
        defaultValues={defaults?.languages ?? ["English"]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FileUpload
          kind="coach-photo"
          name="photoKey"
          label="Profile photo"
          hint="JPG, PNG or WebP, up to 5 MB. A clear, friendly face photo works best."
          defaultKey={defaults?.photoKey}
        />
        <FileUpload
          kind="intro-video"
          name="introVideoKey"
          label="Intro video (optional)"
          hint="MP4 or WebM, up to 200 MB, ideally 30–90 seconds"
          defaultKey={defaults?.introVideoKey}
        />
      </div>

      {withCredentials && (
        <fieldset className="space-y-4 rounded-2xl border border-border p-5">
          <legend className="px-1 text-sm font-medium">Qualifications (optional, up to 3)</legend>
          <p className="text-xs text-muted">
            Certificates and ID documents are private. Only our review team can see them.
          </p>
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid gap-3 border-t border-border pt-4 first-of-type:border-0 first-of-type:pt-0 sm:grid-cols-2">
              <TextField label={`Qualification ${i + 1}`} name={`credTitle_${i}`} placeholder="e.g. FIDE Instructor" />
              <TextField label="Issued by" name={`credIssuer_${i}`} placeholder="e.g. All India Chess Federation" />
              <TextField label="Year" name={`credYear_${i}`} type="number" min={1950} max={2100} />
              <FileUpload kind="credential-doc" name={`credDoc_${i}`} label="Certificate (PDF or image)" />
            </div>
          ))}
        </fieldset>
      )}

      <FormMessage state={state} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
