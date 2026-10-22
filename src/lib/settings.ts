import "server-only";
import { db } from "@/db";
import { setting } from "@/db/schema";

/**
 * Business settings, editable in Admin → Settings. Defaults apply until changed.
 * - commissionPct: platform share of each class (coach keeps the rest)
 * - tdsPct: TDS withheld on coach payouts (194-O; confirm the rate with the CA)
 * - holdDays: days after a class before earnings become payable (refund window)
 * - discountBasis: on discounted/free promo bookings, split the "list" price
 *   (platform funds the discount) or the "paid" amount (coach shares the discount)
 */
export type Settings = {
  commissionPct: number;
  tdsPct: number;
  holdDays: number;
  discountBasis: "list" | "paid";
};

export const defaultSettings: Settings = {
  commissionPct: 20,
  tdsPct: 0.1,
  holdDays: 3,
  discountBasis: "list",
};

export async function getSettings(): Promise<Settings> {
  const rows = await db.select().from(setting);
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const num = (k: keyof Settings, min: number, max: number) => {
    const n = Number(raw[k]);
    return Number.isFinite(n) && n >= min && n <= max ? n : (defaultSettings[k] as number);
  };
  return {
    commissionPct: num("commissionPct", 0, 100),
    tdsPct: num("tdsPct", 0, 30),
    holdDays: num("holdDays", 0, 60),
    discountBasis: raw.discountBasis === "paid" ? "paid" : defaultSettings.discountBasis,
  };
}

export async function saveSettings(s: Settings) {
  const entries = Object.entries(s).map(([key, value]) => ({ key, value: String(value) }));
  for (const e of entries) {
    await db
      .insert(setting)
      .values(e)
      .onConflictDoUpdate({ target: setting.key, set: { value: e.value, updatedAt: new Date() } });
  }
}
