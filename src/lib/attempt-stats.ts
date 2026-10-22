// Small per-attempt numbers shown on result pages (v1/03). Pure: no DB, so .scratch/ can test it.

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/** Time between start and submit, or null while the attempt is still running. */
export function durationMs(startedAt: string, submittedAt: string | null): number | null {
  return submittedAt ? new Date(submittedAt).getTime() - new Date(startedAt).getTime() : null;
}

/** "42 s", "1 min 5 s", "12 min", "1 h 3 min" (seconds stop mattering past an hour). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / SECOND)) * SECOND;
  const h = Math.floor(total / HOUR);
  const m = Math.floor((total % HOUR) / MINUTE);
  const s = Math.floor((total % MINUTE) / SECOND);
  if (h > 0) return m > 0 ? `${h} h ${m} min` : `${h} h`;
  if (m > 0) return s > 0 ? `${m} min ${s} s` : `${m} min`;
  return `${s} s`;
}

/** Share of ANSWERED questions that were right (0–1). Unanswered ones don't count; null if nothing was answered. */
export function accuracy(score: { correct: number; incorrect: number }): number | null {
  const answered = score.correct + score.incorrect;
  return answered === 0 ? null : score.correct / answered;
}

/** 0.756 → "76%". */
export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;
