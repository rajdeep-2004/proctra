"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// One shared 1-second ticker for every countdown on the page.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
function subscribe(cb: () => void) {
  listeners.add(cb);
  timer ??= setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
const nowSecond = () => Math.floor(Date.now() / 1000);

function formatSpan(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${m}m ${pad(s)}s`;
}

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
  // How far this device's clock is from the server's, measured once when the component first renders here.
  const [offsetMs] = useState(() => Date.parse(serverNow) - Date.now());
  const second = useSyncExternalStore(subscribe, nowSecond, () => null); // null during server render/hydration

  const now = second === null ? null : second * 1000 + offsetMs;
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
