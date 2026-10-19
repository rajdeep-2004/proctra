"use client";

import { useSyncExternalStore } from "react";
import { formatLocal } from "@/lib/datetime";

const noSubscribe = () => () => {};

/**
 * Shows an instant in the VIEWER's time zone. The server (UTC on Vercel) can't know it, so the server
 * render shows a placeholder and the browser swaps in local time right after hydration
 * (useSyncExternalStore uses the server snapshot during hydration, then the client snapshot).
 */
export function LocalTime({ iso, className }: { iso: string; className?: string }) {
  const text = useSyncExternalStore(noSubscribe, () => formatLocal(iso), () => null);
  return (
    <time dateTime={iso} className={className}>
      {text ?? "…"}
    </time>
  );
}
