import type { Metadata } from "next";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CouponForm } from "@/components/admin/coupon-form";
import { db } from "@/db";
import { booking, coupon } from "@/db/schema";
import { assertRole, requireRole } from "@/lib/authz";
import { normalizeCode } from "@/lib/coupons";
import { firstError, type FormState } from "@/lib/validation";

export const metadata: Metadata = { title: "Offer codes · Admin" };

const schema = z.object({
  code: z
    .string()
    .transform(normalizeCode)
    .pipe(z.string().regex(/^[A-Z0-9_-]{3,30}$/, "Code: 3–30 letters, numbers, - or _")),
  description: z.string().trim().min(3, "Add a short description").max(120),
  percentOff: z.coerce.number().int().min(1).max(100),
  maxRedemptions: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0), "Limit must be a whole number"),
  validUntil: z
    .string()
    .trim()
    .transform((v) => (v ? new Date(`${v}T23:59:59Z`) : null)),
  firstBookingOnly: z.boolean(),
});

async function createCoupon(_prev: FormState, fd: FormData): Promise<FormState> {
  "use server";
  await assertRole(["admin"]);
  const parsed = schema.safeParse({
    code: String(fd.get("code") ?? ""),
    description: String(fd.get("description") ?? ""),
    percentOff: String(fd.get("percentOff") ?? ""),
    maxRedemptions: String(fd.get("maxRedemptions") ?? ""),
    validUntil: String(fd.get("validUntil") ?? ""),
    firstBookingOnly: fd.get("firstBookingOnly") === "on",
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const [exists] = await db.select({ id: coupon.id }).from(coupon).where(eq(coupon.code, parsed.data.code));
  if (exists) return { error: "That code already exists." };
  await db.insert(coupon).values(parsed.data);
  revalidatePath("/admin/coupons");
  revalidatePath("/");
  return { ok: true, message: `Code ${parsed.data.code} created.` };
}

async function toggleCoupon(fd: FormData) {
  "use server";
  await assertRole(["admin"]);
  const id = z.string().uuid().parse(fd.get("id"));
  await db.update(coupon).set({ isActive: fd.get("active") === "true" }).where(eq(coupon.id, id));
  revalidatePath("/admin/coupons");
  revalidatePath("/");
}

export default async function AdminCouponsPage() {
  await requireRole(["admin"], "/admin/coupons");
  const rows = await db.select().from(coupon).orderBy(desc(coupon.createdAt));
  const used = await db
    .select({ id: booking.couponId, n: sql<number>`count(*)::int` })
    .from(booking)
    .where(inArray(booking.status, ["pending_payment", "confirmed", "completed", "no_show"]))
    .groupBy(booking.couponId);
  const usedBy = new Map(used.map((u) => [u.id, u.n]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Offer codes</h1>
        <p className="mt-1 text-sm text-muted">
          Share a code, or a link like <code>/book/&lt;class&gt;?code=CODE</code>, which applies it automatically.
        </p>
      </div>

      {rows.length > 0 && (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm">
              <span className="min-w-0 flex-1">
                <span className="font-mono font-semibold">{c.code}</span>{" "}
                <span className={c.isActive ? "text-success" : "text-muted"}>· {c.isActive ? "active" : "off"}</span>
                <span className="block text-muted">
                  {c.description} · {c.percentOff}% off
                  {c.firstBookingOnly && " · first booking only"}
                  {c.validUntil && ` · until ${c.validUntil.toISOString().slice(0, 10)}`}
                </span>
              </span>
              <span className="text-muted">
                Used {usedBy.get(c.id) ?? 0}
                {c.maxRedemptions != null && ` / ${c.maxRedemptions}`}
              </span>
              <form action={toggleCoupon}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="active" value={c.isActive ? "false" : "true"} />
                <button className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted">
                  {c.isActive ? "Turn off" : "Turn on"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <section className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">New code</h2>
        <CouponForm action={createCoupon} />
      </section>
    </div>
  );
}
