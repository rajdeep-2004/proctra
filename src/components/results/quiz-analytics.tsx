import { ScoreDistributionChart } from "@/components/results/score-distribution-chart";
import { StatGrid, StatTile } from "@/components/results/stat-tile";
import { histogram, scorePercent, summarize } from "@/lib/score-stats";
import type { SubmissionRow } from "@/services/results-service";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** "7.5 / 10", or "None yet" before anyone has finished. */
function Marks({ value, max }: { value: number | null; max: number }) {
  if (value === null) return <span className="text-muted-foreground">None yet</span>;
  return <>{fmt(value)} <span className="text-sm font-normal text-muted-foreground">/ {fmt(max)}</span></>;
}

/**
 * Teacher's at-a-glance view of one quiz (v1/04, issue 1.6). Marks stats and the chart use finished attempts only;
 * an attempt still being written has no final score yet.
 */
export function QuizAnalytics({ rows, maxPossible }: { rows: SubmissionRow[]; maxPossible: number }) {
  const totals = rows.flatMap((r) => (r.status !== "active" && r.score ? [r.score.total] : []));
  const inProgress = rows.filter((r) => r.status === "active").length;
  const s = summarize(totals);
  const ratios = totals.flatMap((t) => {
    const p = scorePercent(t, maxPossible);
    return p === null ? [] : [p];
  });

  return (
    <section aria-label="Quiz analytics" className="grid gap-4">
      <StatGrid className="sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Submitted" value={s.count} />
        <StatTile label="In progress" value={inProgress} />
        <StatTile label="Average" value={<Marks value={s.mean} max={maxPossible} />} />
        <StatTile label="Median" value={<Marks value={s.median} max={maxPossible} />} />
        <StatTile label="Highest" value={<Marks value={s.max} max={maxPossible} />} />
        <StatTile label="Lowest" value={<Marks value={s.min} max={maxPossible} />} />
      </StatGrid>
      {ratios.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <ScoreDistributionChart buckets={histogram(ratios)} />
        </div>
      )}
    </section>
  );
}
