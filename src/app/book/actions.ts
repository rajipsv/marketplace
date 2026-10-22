"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { FormState } from "@/lib/validation";
import * as bookings from "@/server/services/bookings";

// Website wrappers; the rules live in server/services/bookings (shared with /api/v1).

export async function createBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const auth = await getSession();
  if (!auth) return { error: "Please sign in again." };
  const r = await bookings.createBooking(auth.user.id, {
    offeringId: String(fd.get("offeringId") ?? ""),
    attendee: String(fd.get("attendee") || "self"),
    startsAt: String(fd.get("startsAt") ?? "") || undefined,
    sessionId: String(fd.get("sessionId") ?? "") || undefined,
    coupon: String(fd.get("coupon") ?? "") || undefined,
  });
  if (!r.ok) return { error: r.error };
  revalidatePath("/my-sessions");
  redirect(`/my-sessions?booked=${r.bookingId}`);
}

export async function cancelBooking(fd: FormData) {
  const auth = await getSession();
  if (!auth) return;
  await bookings.cancelBooking(auth.user.id, String(fd.get("bookingId") ?? ""));
  revalidatePath("/my-sessions");
}

/** Lets the booking page show the discount before the customer books. */
export async function previewCoupon(code: string, offeringId: string) {
  const auth = await getSession();
  if (!auth) return { ok: false as const, error: "Please sign in again." };
  return bookings.previewCoupon(auth.user.id, code, offeringId);
}
