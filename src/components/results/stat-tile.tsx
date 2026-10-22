import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One labelled number/value. Used in attempt summaries and analytics. */
export function StatTile({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn("grid content-start gap-1 rounded-lg border bg-card px-4 py-3", className)}>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}

/** Responsive grid of StatTiles (a <dl>, so label/value pairs are announced together). */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>{children}</dl>;
}
