"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { formatSpan, useServerNow } from "@/lib/server-clock";

type Props = {
  startsAt: string;
  endsAt: string;
  /** Server time when the page was rendered; corrects for a wrong local clock (D-041). */
  serverNow: string;
  className?: string;
  /** Refresh server data when the exam opens/closes (updates badges and the Start button). */
  refreshOnChange?: boolean;
};

/**
 * "Starts in 1h 23m 10s" → "Ends in 42m 05s" → "Ended", ticking every second on SERVER time.
 * Display only: the server still decides whether an attempt may start.
 */
export function Countdown({ startsAt, endsAt, serverNow, className, refreshOnChange = false }: Props) {
  const router = useRouter();
  const now = useServerNow(serverNow);
  const start = Date.parse(startsAt);
  const end = Date.parse(endsAt);
  const phase = now === null ? null : now < start ? "upcoming" : now < end ? "open" : "closed";

  // When the phase changes while the page is open (e.g. the exam just started), refetch the server parts.
  const lastPhase = useRef(phase);
  useEffect(() => {
    if (refreshOnChange && lastPhase.current !== null && phase !== null && phase !== lastPhase.current) router.refresh();
    lastPhase.current = phase;
  }, [phase, refreshOnChange, router]);

  let text = "…";
  if (now !== null) {
    text = phase === "upcoming" ? `Starts in ${formatSpan(start - now)}` : phase === "open" ? `Ends in ${formatSpan(end - now)}` : "Ended";
  }
  return (
    <span role="timer" aria-live="off" className={className} data-phase={phase ?? "pending"}>
      {text}
    </span>
  );
}
