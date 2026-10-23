"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { coach, credential, user } from "@/db/schema";
import { assertRole } from "@/lib/authz";
import { revalidateCatalog } from "@/lib/catalog";
import { setPayoutVerified } from "@/server/services/payout-account";

const id = z.string().uuid();
const status = z.enum(["approved", "rejected", "suspended", "pending"]);

export async function setCoachStatus(fd: FormData) {
  await assertRole(["admin"]);
  const coachId = id.parse(fd.get("coachId"));
  const next = status.parse(fd.get("status"));

  const [c] = await db
    .update(coach)
    .set({ status: next })
    .where(eq(coach.id, coachId))
    .returning({ userId: coach.userId, slug: coach.slug });
  if (!c) return;

  // Approved teachers get the coach role (admins keep theirs).
  const [u] = await db.select({ role: user.role }).from(user).where(eq(user.id, c.userId));
  if (u && u.role !== "admin") {
    await db
      .update(user)
      .set({ role: next === "approved" ? "coach" : "customer" })
      .where(eq(user.id, c.userId));
  }

  revalidatePath("/admin", "layout");
  revalidateCatalog(c.slug);
}

export async function setCoachVerified(fd: FormData) {
  await assertRole(["admin"]);
  const coachId = id.parse(fd.get("coachId"));
  const verified = fd.get("verified") === "true";
  const [c] = await db.update(coach).set({ verified }).where(eq(coach.id, coachId)).returning({ slug: coach.slug });
  revalidatePath("/admin", "layout");
  if (c) revalidateCatalog(c.slug);
}

export async function setCredentialVerified(fd: FormData) {
  await assertRole(["admin"]);
  const credentialId = id.parse(fd.get("credentialId"));
  const verified = fd.get("verified") === "true";
  const [c] = await db
    .update(credential)
    .set({ verifiedAt: verified ? new Date() : null })
    .where(eq(credential.id, credentialId))
    .returning({ coachId: credential.coachId });
  revalidatePath("/admin", "layout");
  if (c) {
    const [row] = await db.select({ slug: coach.slug }).from(coach).where(eq(coach.id, c.coachId));
    if (row) revalidateCatalog(row.slug);
  }
}

export async function setCoachPayoutVerified(fd: FormData) {
  await assertRole(["admin"]);
  const coachId = id.parse(fd.get("coachId"));
  await setPayoutVerified(coachId, fd.get("verified") === "true");
  revalidatePath("/admin", "layout");
}
