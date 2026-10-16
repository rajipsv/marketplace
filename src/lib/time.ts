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
