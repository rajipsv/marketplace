export const IST = "Asia/Kolkata";
export const DEFAULT_US_TZ = "America/New_York";

export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_US_TZ;
  } catch {
    return DEFAULT_US_TZ;
  }
}

/** "Sat, Oct 24 · 9:00 AM EDT" */
export function formatSlot(isoUtc: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(isoUtc));
}

/** "6:30 PM IST" — the coach's local time, shown as secondary info */
export function formatIst(isoUtc: string) {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: IST,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoUtc));
  return `${time} IST`;
}

/** Customers can cancel up to this many hours before a class starts. */
export const CANCEL_CUTOFF_HOURS = 24;

/** "Sat, Oct 24" in the given zone. */
export function formatDay(isoUtc: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(new Date(isoUtc));
}

/** "9:00 AM" in the given zone. */
export function formatTime(isoUtc: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(isoUtc));
}

/** Short zone name for labels, e.g. "PDT". */
export function zoneAbbreviation(timeZone: string) {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")
      ?.value ?? timeZone
  );
}

/** Groups UTC start times by calendar day in the viewer's zone (order preserved). */
export function groupByDay(isoTimes: string[], timeZone: string) {
  const key = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
  const days: { key: string; label: string; times: string[] }[] = [];
  for (const iso of isoTimes) {
    const k = key(iso);
    const last = days[days.length - 1];
    if (last?.key === k) last.times.push(iso);
    else days.push({ key: k, label: formatDay(iso, timeZone), times: [iso] });
  }
  return days;
}
