"use client";

import { useEffect, useState } from "react";
import { DEFAULT_US_TZ, detectTimeZone, formatIst, formatSlot } from "@/lib/time";

/**
 * Shows a UTC slot in the viewer's time zone with the coach's IST time beneath.
 * Server render uses US Eastern; the client swaps in the detected zone.
 */
export function LocalTime({ iso, className }: { iso: string; className?: string }) {
  const [tz, setTz] = useState(DEFAULT_US_TZ);

  useEffect(() => {
    setTz(detectTimeZone());
  }, []);

  return (
    <span className={className}>
      <span className="block font-medium">{formatSlot(iso, tz)}</span>
      <span className="block text-xs text-muted">{formatIst(iso)} for your teacher</span>
    </span>
  );
}
