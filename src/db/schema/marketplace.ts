// Marketplace domain tables. Money is stored as integer minor units
// (USD cents for customer prices, INR paise for coach payouts).
// All timestamps are UTC (timestamptz); display converts to the viewer's zone.
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const coachStatus = pgEnum("coach_status", ["pending", "approved", "rejected", "suspended"]);
export const offeringFormat = pgEnum("offering_format", ["group", "one-on-one", "weekly-class"]);
export const audience = pgEnum("audience", ["adults", "kids", "family"]);
export const offeringBadge = pgEnum("offering_badge", ["Most loved", "Free trial", "Festival", "New"]);
export const sessionStatus = pgEnum("session_status", ["scheduled", "live", "completed", "cancelled"]);
export const bookingStatus = pgEnum("booking_status", [
  "pending_payment",
  "confirmed",
  "cancelled",
  "refunded",
  "completed",
  "no_show",
]);
export const paymentProvider = pgEnum("payment_provider", ["razorpay", "paypal"]);
export const paymentStatus = pgEnum("payment_status", ["created", "authorized", "captured", "failed", "refunded"]);
export const payoutStatus = pgEnum("payout_status", ["pending", "processing", "paid", "failed"]);

const createdAt = timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = timestamp({ withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

/** Child (or other family member) profiles managed by a parent account. */
export const familyMember = pgTable(
  "family_member",
  {
    id: uuid().primaryKey().defaultRandom(),
    parentUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    birthYear: smallint(),
    notes: text(),
    createdAt,
    updatedAt,
  },
  (t) => [index().on(t.parentUserId)],
);

export const category = pgTable("category", {
  slug: text().primaryKey(),
  name: text().notNull(),
  blurb: text().notNull(),
  icon: text().notNull(),
  examples: text().array().notNull().default(sql`'{}'::text[]`),
  sortOrder: smallint().notNull().default(0),
});

export const coach = pgTable(
  "coach",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text()
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text().notNull().unique(),
    displayName: text().notNull(),
    title: text().notNull(),
    bio: text(),
    city: text().notNull(),
    languages: text().array().notNull().default(sql`'{}'::text[]`),
    yearsExperience: smallint().notNull().default(0),
    timezone: text().notNull().default("Asia/Kolkata"),
    status: coachStatus().notNull().default("pending"),
    verified: boolean().notNull().default(false),
    photoKey: text(), // R2 object key (public bucket path)
    introVideoKey: text(),
    payoutsEnabled: boolean().notNull().default(false),
    createdAt,
    updatedAt,
  },
  (t) => [index().on(t.status)],
);

export const coachCategory = pgTable(
  "coach_category",
  {
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    categorySlug: text()
      .notNull()
      .references(() => category.slug, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.coachId, t.categorySlug] })],
);

/** Qualifications; documentKey points at a private R2 object reviewed by admins. */
export const credential = pgTable(
  "credential",
  {
    id: uuid().primaryKey().defaultRandom(),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    title: text().notNull(),
    issuer: text(),
    year: smallint(),
    documentKey: text(),
    verifiedAt: timestamp({ withTimezone: true }),
    createdAt,
  },
  (t) => [index().on(t.coachId)],
);

export const offering = pgTable(
  "offering",
  {
    id: uuid().primaryKey().defaultRandom(),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    categorySlug: text()
      .notNull()
      .references(() => category.slug),
    slug: text().notNull().unique(),
    title: text().notNull(),
    description: text(),
    format: offeringFormat().notNull(),
    audience: audience().notNull().default("adults"),
    durationMin: smallint().notNull(),
    priceUsdCents: integer().notNull(),
    capacity: smallint().notNull().default(1),
    languages: text().array().notNull().default(sql`'{}'::text[]`),
    badge: offeringBadge(),
    isActive: boolean().notNull().default(true),
    createdAt,
    updatedAt,
  },
  (t) => [
    index().on(t.coachId),
    index().on(t.categorySlug),
    check("offering_price_nonnegative", sql`${t.priceUsdCents} >= 0`),
    check("offering_duration_positive", sql`${t.durationMin} > 0`),
  ],
);

/** Weekly recurring availability, in the coach's own time zone (minutes from midnight). */
export const availabilityRule = pgTable(
  "availability_rule",
  {
    id: uuid().primaryKey().defaultRandom(),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    weekday: smallint().notNull(), // 0 = Sunday
    startMinute: smallint().notNull(),
    endMinute: smallint().notNull(),
  },
  (t) => [
    index().on(t.coachId),
    check("availability_weekday_range", sql`${t.weekday} between 0 and 6`),
    check("availability_window", sql`${t.startMinute} >= 0 and ${t.endMinute} <= 1440 and ${t.startMinute} < ${t.endMinute}`),
  ],
);

/** One-off changes: a day off (isAvailable=false) or extra hours on a date. */
export const availabilityException = pgTable(
  "availability_exception",
  {
    id: uuid().primaryKey().defaultRandom(),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    date: date().notNull(),
    isAvailable: boolean().notNull().default(false),
    startMinute: smallint(),
    endMinute: smallint(),
  },
  (t) => [index().on(t.coachId, t.date)],
);

/** A scheduled occurrence of an offering (group session, or a booked 1-on-1 slot). */
export const classSession = pgTable(
  "class_session",
  {
    id: uuid().primaryKey().defaultRandom(),
    offeringId: uuid()
      .notNull()
      .references(() => offering.id, { onDelete: "cascade" }),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    startsAt: timestamp({ withTimezone: true }).notNull(),
    endsAt: timestamp({ withTimezone: true }).notNull(),
    capacity: smallint().notNull().default(1),
    status: sessionStatus().notNull().default("scheduled"),
    videoRoomId: text(),
    recordingKey: text(),
    createdAt,
    updatedAt,
  },
  (t) => [
    // A coach can't start two sessions at the same instant; full overlap
    // prevention is enforced in the booking service.
    uniqueIndex().on(t.coachId, t.startsAt),
    index().on(t.startsAt),
    check("session_time_order", sql`${t.startsAt} < ${t.endsAt}`),
  ],
);

export const booking = pgTable(
  "booking",
  {
    id: uuid().primaryKey().defaultRandom(),
    sessionId: uuid()
      .notNull()
      .references(() => classSession.id, { onDelete: "restrict" }),
    customerUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    familyMemberId: uuid().references(() => familyMember.id, { onDelete: "set null" }),
    status: bookingStatus().notNull().default("pending_payment"),
    priceUsdCents: integer().notNull(),
    cancelledAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [index().on(t.customerUserId), index().on(t.sessionId)],
);

export const payment = pgTable(
  "payment",
  {
    id: uuid().primaryKey().defaultRandom(),
    bookingId: uuid()
      .notNull()
      .references(() => booking.id, { onDelete: "restrict" }),
    provider: paymentProvider().notNull(),
    providerOrderId: text().notNull(),
    providerPaymentId: text().unique(),
    amountUsdCents: integer().notNull(),
    status: paymentStatus().notNull().default("created"),
    raw: jsonb(),
    createdAt,
    updatedAt,
  },
  (t) => [index().on(t.bookingId), uniqueIndex().on(t.provider, t.providerOrderId)],
);

export const payout = pgTable(
  "payout",
  {
    id: uuid().primaryKey().defaultRandom(),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "restrict" }),
    periodStart: date().notNull(),
    periodEnd: date().notNull(),
    grossInrPaise: integer().notNull(),
    tdsInrPaise: integer().notNull().default(0),
    netInrPaise: integer().notNull(),
    status: payoutStatus().notNull().default("pending"),
    providerPayoutId: text().unique(),
    createdAt,
    updatedAt,
  },
  (t) => [uniqueIndex().on(t.coachId, t.periodStart, t.periodEnd)],
);

export const review = pgTable(
  "review",
  {
    id: uuid().primaryKey().defaultRandom(),
    bookingId: uuid()
      .notNull()
      .unique()
      .references(() => booking.id, { onDelete: "cascade" }),
    coachId: uuid()
      .notNull()
      .references(() => coach.id, { onDelete: "cascade" }),
    customerUserId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: smallint().notNull(),
    comment: text(),
    isPublished: boolean().notNull().default(true),
    createdAt,
  },
  (t) => [index().on(t.coachId), check("review_rating_range", sql`${t.rating} between 1 and 5`)],
);

export const requestStatus = pgEnum("request_status", ["new", "contacted", "closed"]);

/** Demand capture: a family asks for a time or a class we don't list yet. */
export const classRequest = pgTable(
  "class_request",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().references(() => user.id, { onDelete: "set null" }),
    name: text().notNull(),
    email: text().notNull(),
    offeringId: uuid().references(() => offering.id, { onDelete: "set null" }),
    subject: text(), // what they want to learn, when no specific class
    forWhom: text(), // "me", "child (8)", …
    preferredTimes: text(),
    message: text(),
    timezone: text(),
    status: requestStatus().notNull().default("new"),
    createdAt,
  },
  (t) => [index().on(t.status, t.createdAt)],
);
