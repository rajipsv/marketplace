"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import type { FormState } from "@/lib/validation";
import { submitClassRequest } from "@/server/services/requests";

export async function submitRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: real people never fill this hidden field.
  if (String(fd.get("website") ?? "")) return { ok: true, message: "Thank you! We'll be in touch." };

  const session = await getSession();
  const r = await submitClassRequest(
    {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      offeringId: String(fd.get("offeringId") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      forWhom: String(fd.get("forWhom") ?? ""),
      preferredTimes: String(fd.get("preferredTimes") ?? ""),
      message: String(fd.get("message") ?? ""),
      timezone: String(fd.get("timezone") ?? ""),
    },
    session?.user.id ?? null,
  );
  if (!r.ok) return { error: r.error };
  revalidatePath("/admin/requests");
  return { ok: true, message: "Thank you! We've got your request and will get back to you by email." };
}
