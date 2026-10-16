"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

type Kind = "coach-photo" | "intro-video" | "credential-doc";

const accept: Record<Kind, string> = {
  "coach-photo": "image/jpeg,image/png,image/webp",
  "intro-video": "video/mp4,video/webm",
  "credential-doc": "application/pdf,image/jpeg,image/png",
};

/**
 * Uploads straight to R2 via a presigned URL from /api/uploads and stores the
 * resulting object key in a hidden input named `name` for the surrounding form.
 */
export function FileUpload({
  kind,
  name,
  label,
  hint,
  defaultKey,
}: {
  kind: Kind;
  name: string;
  label: string;
  hint?: string;
  defaultKey?: string | null;
}) {
  const [key, setKey] = useState(defaultKey ?? "");
  const [fileName, setFileName] = useState<string | null>(defaultKey ? "Already uploaded" : null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(defaultKey ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError(null);
    setFileName(file.name);
    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, contentType: file.type, size: file.size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("Upload failed — please try again");

      setKey(data.key);
      setStatus("done");
    } catch (err) {
      setKey("");
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  const inputId = `${name}-file`;
  return (
    <div>
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="block text-xs text-muted">{hint}</span>}
      <label
        htmlFor={inputId}
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm hover:border-primary"
      >
        {status === "uploading" ? (
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden />
        ) : status === "done" ? (
          <CheckCircle2 className="size-5 text-success" aria-hidden />
        ) : (
          <Upload className="size-5 text-muted" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate">
          {status === "uploading" ? `Uploading ${fileName}…` : (fileName ?? "Choose a file")}
        </span>
        <span className="text-xs font-semibold text-primary">{status === "done" ? "Replace" : "Browse"}</span>
      </label>
      <input id={inputId} type="file" accept={accept[kind]} onChange={onChange} className="sr-only" />
      <input type="hidden" name={name} value={key} />
      {error && (
        <p role="alert" className="mt-1 text-xs text-kumkum">
          {error}
        </p>
      )}
    </div>
  );
}
