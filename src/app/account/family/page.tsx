import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { AddMemberForm } from "@/components/account/add-member-form";
import { db } from "@/db";
import { familyMember } from "@/db/schema";
import { requireUser } from "@/lib/authz";
import { addFamilyMember, removeFamilyMember } from "./actions";

export const metadata: Metadata = { title: "My family" };

export default async function FamilyPage() {
  const user = await requireUser("/account/family");
  const members = await db
    .select()
    .from(familyMember)
    .where(eq(familyMember.parentUserId, user.id))
    .orderBy(asc(familyMember.createdAt));
  const year = new Date().getUTCFullYear();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/account" className="text-sm text-muted hover:text-foreground">
        ← My account
      </Link>
      <h1 className="mt-2 font-display text-3xl font-semibold">My family</h1>
      <p className="mt-2 text-muted">
        Add your children so you can book classes for them. Teachers only see the child&apos;s first name and your notes.
      </p>

      {members.length > 0 && (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <span>
                <span className="block font-semibold">{m.name}</span>
                <span className="text-sm text-muted">
                  {m.birthYear ? `About ${year - m.birthYear} years old` : "Age not set"}
                  {m.notes && ` · ${m.notes}`}
                </span>
              </span>
              <form action={removeFamilyMember}>
                <input type="hidden" name="id" value={m.id} />
                <button className="cursor-pointer text-sm font-semibold text-muted hover:text-kumkum">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">Add a child</h2>
        <AddMemberForm action={addFamilyMember} />
      </div>
    </div>
  );
}
