import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { AvailabilityEditor } from "@/components/coach/availability-editor";
import { db } from "@/db";
import { availabilityRule } from "@/db/schema";
import { requireApprovedCoach } from "@/lib/authz";
import { saveAvailability } from "../actions";

export const metadata: Metadata = { title: "Weekly hours" };

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default async function AvailabilityPage() {
  const { coach } = await requireApprovedCoach("/coach/availability");
  const rules = await db
    .select()
    .from(availabilityRule)
    .where(eq(availabilityRule.coachId, coach.id))
    .orderBy(asc(availabilityRule.weekday), asc(availabilityRule.startMinute));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Weekly hours</h1>
      <p className="mt-1 max-w-2xl text-muted">
        When can families book 1-on-1 sessions with you? Tip: US evenings (6–10 pm Eastern) are early mornings in India,
        and US weekend mornings are Indian evenings.
      </p>
      <div className="mt-6">
        <AvailabilityEditor
          action={saveAvailability}
          timezoneLabel={coach.timezone === "Asia/Kolkata" ? "India time (IST)" : coach.timezone}
          initial={rules.map((r) => ({ weekday: r.weekday, start: hhmm(r.startMinute), end: hhmm(r.endMinute) }))}
        />
      </div>
    </div>
  );
}
