"use client";

import { useState, useSyncExternalStore } from "react";

// One shared 1-second ticker for every timer on the page.
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

/**
 * Current SERVER time in ms, updated every second, or null during the server render / hydration.
 * `serverNow` is the server's clock when the data was produced; the offset to this device's clock is
 * measured once, so a laptop with a wrong clock still counts down correctly (D-041).
 */
export function useServerNow(serverNow: string): number | null {
  const [offsetMs] = useState(() => Date.parse(serverNow) - Date.now());
  const second = useSyncExternalStore(subscribe, nowSecond, () => null);
  return second === null ? null : second * 1000 + offsetMs;
}

/** "1h 05m 09s" / "4m 07s" — never negative. */
export function formatSpan(ms: number): string {
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
