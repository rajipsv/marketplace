import "server-only";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coachPayoutAccount } from "@/db/schema";
import { decrypt, encrypt, encryptionConfigured } from "@/lib/crypto";
import { firstError } from "@/lib/validation";
import type { Result } from "./result";

const upper = (v: string) => v.trim().toUpperCase().replace(/\s+/g, "");

export const payoutAccountInput = z
  .object({
    method: z.enum(["bank", "upi"]),
    accountHolderName: z.string().trim().min(2, "Enter the account holder's name").max(100),
    bankAccount: z.string().optional(),
    ifsc: z.string().optional(),
    upi: z.string().optional(),
    pan: z
      .string()
      .transform(upper)
      .pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "PAN should look like ABCDE1234F")),
  })
  .superRefine((v, ctx) => {
    if (v.method === "bank") {
      if (!/^\d{9,18}$/.test((v.bankAccount ?? "").replace(/\s+/g, "")))
        ctx.addIssue({ code: "custom", message: "Bank account number should be 9–18 digits", path: ["bankAccount"] });
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(upper(v.ifsc ?? "")))
        ctx.addIssue({ code: "custom", message: "IFSC should look like HDFC0001234", path: ["ifsc"] });
    } else if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test((v.upi ?? "").trim())) {
      ctx.addIssue({ code: "custom", message: "UPI ID should look like name@okicici", path: ["upi"] });
    }
  });
export type PayoutAccountInput = z.input<typeof payoutAccountInput>;

const upiHint = (upi: string) => {
  const [name, bank] = upi.split("@");
  return `${name.slice(0, 2)}…@${bank}`;
};

export async function savePayoutAccount(coachId: string, raw: PayoutAccountInput): Promise<Result> {
  if (!encryptionConfigured())
    return { ok: false, error: "Payout details can't be saved yet — please contact support.", code: "conflict" };
  const parsed = payoutAccountInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error), code: "invalid_input" };
  const v = parsed.data;

  const bank = v.method === "bank" ? (v.bankAccount ?? "").replace(/\s+/g, "") : null;
  const upi = v.method === "upi" ? (v.upi ?? "").trim() : null;
  const values = {
    method: v.method,
    accountHolderName: v.accountHolderName,
    bankAccountEnc: bank ? encrypt(bank) : null,
    bankAccountLast4: bank ? bank.slice(-4) : null,
    ifsc: v.method === "bank" ? upper(v.ifsc ?? "") : null,
    upiEnc: upi ? encrypt(upi) : null,
    upiHint: upi ? upiHint(upi) : null,
    panEnc: encrypt(v.pan),
    panLast4: v.pan.slice(-4),
    verifiedAt: null, // any change needs re-verification
  };
  await db
    .insert(coachPayoutAccount)
    .values({ coachId, ...values })
    .onConflictDoUpdate({ target: coachPayoutAccount.coachId, set: values });
  return { ok: true };
}

/** Safe-to-display summary (no secrets). */
export async function getPayoutSummary(coachId: string) {
  const [a] = await db.select().from(coachPayoutAccount).where(eq(coachPayoutAccount.coachId, coachId));
  if (!a) return null;
  return {
    method: a.method,
    accountHolderName: a.accountHolderName,
    destination: a.method === "bank" ? `A/c ••••${a.bankAccountLast4} · ${a.ifsc}` : `UPI ${a.upiHint}`,
    pan: `•••••${a.panLast4}`,
    verified: Boolean(a.verifiedAt),
    updatedAt: a.updatedAt,
  };
}

/** Full details for an admin making the transfer. Never call this for non-admins. */
export async function getPayoutDetailsForAdmin(coachId: string) {
  const [a] = await db.select().from(coachPayoutAccount).where(eq(coachPayoutAccount.coachId, coachId));
  if (!a) return null;
  return {
    method: a.method,
    accountHolderName: a.accountHolderName,
    bankAccount: a.bankAccountEnc ? decrypt(a.bankAccountEnc) : null,
    ifsc: a.ifsc,
    upi: a.upiEnc ? decrypt(a.upiEnc) : null,
    pan: decrypt(a.panEnc),
    verifiedAt: a.verifiedAt,
  };
}

export async function setPayoutVerified(coachId: string, verified: boolean) {
  await db
    .update(coachPayoutAccount)
    .set({ verifiedAt: verified ? new Date() : null })
    .where(eq(coachPayoutAccount.coachId, coachId));
}
