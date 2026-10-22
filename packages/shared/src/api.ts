// Shapes returned by /api/v1 (see docs/api.md). Dates arrive as ISO strings (UTC).
import type { Badge, Category, CoachSummary, Format, OfferingCard } from "./types";

export type ApiSuccess<T> = { data: T };
export type ApiFailure = { error: { code: string; message: string } };

export type { Category, CoachSummary, OfferingCard };

export type OfferingDetail = OfferingCard & {
  description: string | null;
  capacity: number;
  category: { slug: string; name: string };
  coachBio: string | null;
  upcoming: { id: string; startsAt: string; endsAt: string }[];
};

export type Availability =
  | { format: "one-on-one"; slots: string[] }
  | { format: Exclude<Format, "one-on-one">; sessions: { id: string; startsAt: string; seatsLeft: number }[] };

export type CoachDetail = CoachSummary & {
  bio: string | null;
  categories: { slug: string; name: string }[];
  credentials: { title: string; issuer: string | null; year: number | null; verifiedAt: string | null }[];
  offerings: OfferingCard[];
};

export type Me = { id: string; name: string; email: string; role: "customer" | "coach" | "admin"; timezone: string };

export type FamilyMember = { id: string; name: string; birthYear: number | null; notes: string | null };

export type BookingStatus = "pending_payment" | "confirmed" | "cancelled" | "refunded" | "completed" | "no_show";

export type BookingItem = {
  id: string;
  status: BookingStatus;
  priceInrPaise: number;
  discountInrPaise: number;
  startsAt: string;
  endsAt: string;
  offering: { slug: string; title: string; durationMin: number; format: Format };
  coach: { slug: string; name: string };
  attendee: { id: string; name: string } | null;
  canCancel: boolean;
};

export type BookingRequest = {
  offeringId: string;
  attendee: "self" | string;
  startsAt?: string;
  sessionId?: string;
  coupon?: string;
};

export type BookingCreated = { bookingId: string; status: "confirmed" | "pending_payment" };

export type CouponPreview = { code: string; description: string; discountPaise: number; finalPaise: number };

export type { Badge, Format };
