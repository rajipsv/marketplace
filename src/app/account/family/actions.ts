"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import type { FormState } from "@/lib/validation";
import * as family from "@/server/services/family";

export async function addFamilyMember(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  const r = await family.addFamilyMember(session.user.id, {
    name: String(fd.get("name") ?? ""),
    birthYear: String(fd.get("birthYear") ?? ""),
    notes: String(fd.get("notes") ?? ""),
  });
  if (!r.ok) return { error: r.error };
  revalidatePath("/account/family");
  return { ok: true, message: `${r.name} added.` };
}

export async function removeFamilyMember(fd: FormData) {
  const session = await getSession();
  if (!session) return;
  await family.removeFamilyMember(session.user.id, String(fd.get("id") ?? ""));
  revalidatePath("/account/family");
}
