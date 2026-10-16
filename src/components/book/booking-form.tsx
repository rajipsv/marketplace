"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { FormMessage, SubmitButton } from "@/components/forms/fields";
import { DEFAULT_US_TZ, detectTimeZone, formatIst } from "@/lib/time";
import type { FormState } from "@/lib/validation";
import { cn, formatUsd } from "@/lib/utils";

type Session = { id: string; startsAt: string; seatsLeft: number };
type CouponPreview =
  | { ok: true; code: string; description: string; discountCents: number; finalCents: number }
  | { ok: false; error: string };

export function BookingForm({
  action,
  offeringId,
  priceUsd,
  selfName,
  members,
  slots,
  sessions,
  requestHref,
  preview,
  initialCode,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  offeringId: string;
  priceUsd: number;
  selfName: string;
  members: { id: string; name: string }[];
  slots?: string[]; // 1-on-1 start times (UTC ISO)
  sessions?: Session[]; // group / weekly dates
  requestHref: string;
  preview: (code: string, offeringId: string) => Promise<CouponPreview>;
  initialCode?: string;
}) {
  const [state, formAction] = useActionState(action, {});
  const [tz, setTz] = useState(DEFAULT_US_TZ);
  useEffect(() => setTz(detectTimeZone()), []);

  const dayKey = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).format(new Date(iso));
  const timeLabel = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  const tzName =
    new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")
      ?.value ?? tz;

  // 1-on-1: group open start times by the viewer's local date.
  const days = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of slots ?? []) map.set(dayKey(s), [...(map.get(dayKey(s)) ?? []), s]);
    return [...map.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots, tz]);
  const [day, setDay] = useState<string | null>(null);
  const activeDay = day ?? days[0]?.[0] ?? null;
  const [pick, setPick] = useState<string | null>(null);

  const [codeInput, setCodeInput] = useState(initialCode ?? "");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [checking, setChecking] = useState(false);
  async function applyCode(code = codeInput) {
    if (!code.trim()) return;
    setChecking(true);
    setCoupon(await preview(code, offeringId));
    setChecking(false);
  }
  useEffect(() => {
    if (initialCode && priceUsd > 0) void applyCode(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const finalUsd = coupon?.ok ? coupon.finalCents / 100 : priceUsd;

  const attendeeOptions = [{ id: "self", name: `Me (${selfName})` }, ...members];
  const empty = slots ? slots.length === 0 : (sessions ?? []).length === 0;
  const allFull = !slots && !empty && (sessions ?? []).every((s) => s.seatsLeft === 0);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="offeringId" value={offeringId} />
      {slots && <input type="hidden" name="startsAt" value={pick ?? ""} />}
      {sessions && <input type="hidden" name="sessionId" value={pick ?? ""} />}
      <input type="hidden" name="coupon" value={coupon?.ok ? coupon.code : ""} />

      <fieldset>
        <legend className="font-display text-xl font-semibold">1. Who is attending?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {attendeeOptions.map((a, i) => (
            <label
              key={a.id}
              className="cursor-pointer rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
            >
              <input type="radio" name="attendee" value={a.id} defaultChecked={i === 0} className="sr-only" />
              {a.name}
            </label>
          ))}
        </div>
        <Link href="/account/family" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
          + Add a child
        </Link>
      </fieldset>

      <fieldset>
        <legend className="font-display text-xl font-semibold">2. Choose a {slots ? "time" : "date"}</legend>
        <p className="mt-1 text-sm text-muted">Times shown in your time zone ({tzName}).</p>

        {empty ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-muted">
            No open {slots ? "times" : "dates"} right now.{" "}
            <Link href={requestHref} className="font-semibold text-primary hover:underline">
              Request a time that suits you
            </Link>{" "}
            and we&apos;ll arrange it with the teacher.
          </p>
        ) : slots ? (
          <>
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Day">
              {days.map(([key, times]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={key === activeDay}
                  onClick={() => {
                    setDay(key);
                    setPick(null);
                  }}
                  className={cn(
                    "shrink-0 cursor-pointer rounded-2xl border px-4 py-2 text-sm font-medium",
                    key === activeDay ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
                  )}
                >
                  {dayLabel(times[0])}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {(days.find(([k]) => k === activeDay)?.[1] ?? []).map((iso) => (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={pick === iso}
                  onClick={() => setPick(iso)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-2 py-2.5 text-sm font-medium",
                    pick === iso ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary",
                  )}
                >
                  {timeLabel(iso)}
                </button>
              ))}
            </div>
            {pick && <p className="mt-2 text-xs text-muted">That&apos;s {formatIst(pick)} for your teacher.</p>}
          </>
        ) : (
          <ul className="mt-4 space-y-2">
            {(sessions ?? []).map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={s.seatsLeft === 0}
                  aria-pressed={pick === s.id}
                  onClick={() => setPick(s.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50",
                    pick === s.id ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary",
                  )}
                >
                  <span>
                    <span className="block font-medium">
                      {dayLabel(s.startsAt)} · {timeLabel(s.startsAt)}
                    </span>
                    <span className="text-xs text-muted">{formatIst(s.startsAt)} for your teacher</span>
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {s.seatsLeft === 0 ? "Full" : `${s.seatsLeft} seat${s.seatsLeft === 1 ? "" : "s"} left`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {allFull && (
          <p className="mt-3 text-sm text-muted">
            All dates are full.{" "}
            <Link href={requestHref} className="font-semibold text-primary hover:underline">
              Request another date
            </Link>
          </p>
        )}
      </fieldset>

      <div className="rounded-2xl border border-border bg-surface p-5">
        {priceUsd > 0 && (
          <div className="mb-4 border-b border-border pb-4">
            <label htmlFor="coupon-code" className="text-sm font-medium">
              Offer code
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="coupon-code"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setCoupon(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void applyCode();
                  }
                }}
                placeholder="e.g. FIRSTCLASS"
                autoCapitalize="characters"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => applyCode()}
                disabled={checking || !codeInput.trim()}
                className="cursor-pointer rounded-xl border border-border px-4 text-sm font-semibold hover:bg-surface-muted disabled:opacity-50"
              >
                {checking ? "…" : "Apply"}
              </button>
            </div>
            {coupon && (
              <p role="status" className={cn("mt-1 text-xs", coupon.ok ? "text-success" : "text-kumkum")}>
                {coupon.ok ? `✓ ${coupon.description}` : coupon.error}
              </p>
            )}
          </div>
        )}
        <p className="flex items-baseline justify-between">
          <span className="text-muted">Price</span>
          <span className="text-2xl font-semibold">
            {coupon?.ok && <span className="mr-2 text-base font-normal text-muted line-through">{formatUsd(priceUsd)}</span>}
            {formatUsd(finalUsd)}
          </span>
        </p>
        {finalUsd > 0 && (
          <p className="mt-2 text-sm text-muted">
            Online payment is opening soon. We&apos;ll reserve your spot now and send you a payment link before the class.
          </p>
        )}
        <div className="mt-4">
          <FormMessage state={state} />
        </div>
        <div className="mt-3">
          {pick ? (
            <SubmitButton className="w-full py-3">{finalUsd > 0 ? "Reserve my spot" : "Confirm booking"}</SubmitButton>
          ) : (
            <button type="button" disabled className="w-full rounded-full bg-primary/50 px-5 py-3 text-sm font-semibold text-primary-foreground">
              Choose a {slots ? "time" : "date"} to continue
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
