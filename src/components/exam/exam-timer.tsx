"use client";

import { useEffect, useRef } from "react";
import { formatSpan, useServerNow } from "@/lib/server-clock";
import { cn } from "@/lib/utils";

/** Remaining time to the SERVER deadline. Calls onExpire once when it reaches zero. */
export function ExamTimer({ deadline, serverNow, onExpire }: { deadline: string; serverNow: string; onExpire: () => void }) {
  const now = useServerNow(serverNow);
  const remaining = now === null ? null : Date.parse(deadline) - now;
  const fired = useRef(false);
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !fired.current) {
      fired.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  const low = remaining !== null && remaining <= 5 * 60_000;
  return (
    <div role="timer" aria-live="off" aria-label="Time remaining"
      className={cn("rounded-md px-3 py-1.5 font-mono text-lg font-semibold tabular-nums", low ? "bg-destructive/10 text-destructive" : "bg-muted")}>
      {remaining === null ? "--:--" : formatSpan(remaining)}
    </div>
  );
}
