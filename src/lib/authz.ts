import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { coach } from "@/db/schema";
import { getSession } from "@/lib/auth";

export type Role = "customer" | "coach" | "admin";

/** Signed-in user or redirect to sign-in (returning to `next` afterwards). */
export async function requireUser(next: string) {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session.user;
}

/** Signed-in user with one of `roles`, otherwise redirect home. */
export async function requireRole(roles: Role[], next: string) {
  const user = await requireUser(next);
  if (!roles.includes(user.role as Role)) redirect("/");
  return user;
}

/** For server actions: throws instead of redirecting. */
export async function assertRole(roles: Role[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.user.role as Role)) throw new Error("Not allowed");
  return session.user;
}

/** The coach profile owned by the current user (any status), or null. */
export async function getOwnCoach(userId: string) {
  const [row] = await db.select().from(coach).where(eq(coach.userId, userId));
  return row ?? null;
}

/** Signed-in user with an approved teacher profile; others go to the application page. */
export async function requireApprovedCoach(next: string) {
  const user = await requireUser(next);
  const own = await getOwnCoach(user.id);
  if (!own || own.status !== "approved") redirect("/teach/apply");
  return { user, coach: own };
}

/** For server actions: the caller's approved coach row, or throws. */
export async function assertApprovedCoach() {
  const session = await getSession();
  if (!session) throw new Error("Not allowed");
  const own = await getOwnCoach(session.user.id);
  if (!own || own.status !== "approved") throw new Error("Not allowed");
  return { user: session.user, coach: own };
}
