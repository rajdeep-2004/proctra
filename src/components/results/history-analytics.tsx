import { ScoreTrendChart } from "@/components/results/score-trend-chart";
import { StatGrid, StatTile } from "@/components/results/stat-tile";
import { formatPercent } from "@/lib/attempt-stats";
import { historyStats, type HistoryRow } from "@/lib/score-stats";

const MIN_TREND_POINTS = 2; // one point is not a trend

const none = <span className="text-muted-foreground">None yet</span>;

/**
 * One student's history as four tiles + a score trend (D-063/D-064). Used on the student's own profile (rows have no
 * score before release, so nothing leaks) and on the teacher's student page (rows limited to that teacher's quizzes).
 */
export function HistoryAnalytics({ rows, label }: { rows: HistoryRow[]; label: string }) {
  const s = historyStats(rows);
  const accuracy = s.scored === 0 ? none : s.accuracy === null ? "No answers" : formatPercent(s.accuracy);

  return (
    <section aria-label={label} className="grid gap-4">
      <StatGrid>
        <StatTile label="Tests taken" value={s.taken} hint={s.awaiting > 0 ? `${s.awaiting} awaiting results` : undefined} />
        <StatTile label="Average score" value={s.average === null ? none : formatPercent(s.average)} />
        <StatTile label="Best score" value={s.best === null ? none : formatPercent(s.best)} />
        <StatTile label="Accuracy" value={accuracy} />
      </StatGrid>
      {s.points.length >= MIN_TREND_POINTS && (
        <div className="rounded-lg border bg-card p-4">
          <ScoreTrendChart points={s.points} />
        </div>
      )}
    </section>
  );
}
