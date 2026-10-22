import { ScoreTrendChart, type TrendPoint } from "@/components/results/score-trend-chart";
import { StatGrid, StatTile } from "@/components/results/stat-tile";
import { formatPercent } from "@/lib/attempt-stats";
import { pooledAccuracy, scorePercent, summarize } from "@/lib/score-stats";
import type { MyAttemptRow } from "@/services/attempt-service";

const MIN_TREND_POINTS = 2; // one point is not a trend

const none = <span className="text-muted-foreground">None yet</span>;

/**
 * Student's own analytics (v1/04, issue 2.2; D-063). "Tests taken" counts every finished attempt (taking a test
 * reveals no marks); every marks-based number uses RELEASED results only, so nothing shows before release (D-049).
 */
export function ProfileAnalytics({ rows }: { rows: MyAttemptRow[] }) {
  const finished = rows.filter((r) => r.status !== "active");
  const released = finished.flatMap((r) => {
    const ratio = r.score ? scorePercent(r.score.total, r.score.maxPossible) : null;
    return r.score && ratio !== null ? [{ row: r, score: r.score, ratio }] : [];
  });
  const awaiting = finished.length - finished.filter((r) => r.score).length;
  const s = summarize(released.map((x) => x.ratio));
  const acc = pooledAccuracy(released.map((x) => x.score));
  const points: TrendPoint[] = released
    .map(({ row, ratio }) => ({ id: row.id, submittedAt: row.submittedAt ?? row.deadline, quizTitle: row.quizTitle, percent: Math.round(ratio * 100) }))
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  return (
    <section aria-label="Your analytics" className="grid gap-4">
      <StatGrid>
        <StatTile label="Tests taken" value={finished.length} hint={awaiting > 0 ? `${awaiting} awaiting results` : undefined} />
        <StatTile label="Average score" value={s.mean === null ? none : formatPercent(s.mean)} />
        <StatTile label="Best score" value={s.max === null ? none : formatPercent(s.max)} />
        <StatTile label="Accuracy" value={released.length === 0 ? none : acc === null ? "No answers" : formatPercent(acc)} />
      </StatGrid>
      {points.length >= MIN_TREND_POINTS && (
        <div className="rounded-lg border bg-card p-4">
          <ScoreTrendChart points={points} />
        </div>
      )}
    </section>
  );
}
