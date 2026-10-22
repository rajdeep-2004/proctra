// Numbers across MANY attempts (v1/04 analytics). Pure: no DB, so .scratch/ can test it.
// Per-attempt helpers (duration, accuracy of one attempt) live in attempt-stats.ts.

import { accuracy } from "@/lib/attempt-stats";

export type Summary = { count: number; mean: number | null; median: number | null; min: number | null; max: number | null };

/** count / mean / median / min / max of a list. Empty list → count 0 and nulls (never NaN or Infinity). */
export function summarize(values: readonly number[]): Summary {
  if (values.length === 0) return { count: 0, mean: null, median: null, min: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return {
    count: sorted.length,
    mean: sorted.reduce((sum, v) => sum + v, 0) / sorted.length,
    median: sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

/** Marks as a share of the maximum (0.9 = 90%). Can be negative with negative marking; null if the max is 0. */
export function scorePercent(total: number, maxPossible: number): number | null {
  return maxPossible === 0 ? null : total / maxPossible;
}

/**
 * Accuracy over several attempts: all correct answers ÷ all answered questions.
 * Pooled (not an average of per-attempt percentages) so a 1-question quiz can't swing it as much as a 40-question one.
 */
export function pooledAccuracy(scores: readonly { correct: number; incorrect: number }[]): number | null {
  const correct = scores.reduce((sum, s) => sum + s.correct, 0);
  const incorrect = scores.reduce((sum, s) => sum + s.incorrect, 0);
  return accuracy({ correct, incorrect });
}

export type Bucket = { label: string; count: number };

const BUCKETS = 10;
// Tiny nudge so a ratio like 0.7 that multiplies to 6.999… still lands in the 70–80% bucket.
const EPSILON = 1e-9;

/**
 * Score-% distribution in ten 10% buckets ("0–10%" … "90–100%"). A bucket holds its lower edge,
 * so exactly 10% counts in "10–20%"; exactly 100% (or more) counts in the last one.
 * Negative scores get one extra "Below 0%" bucket in front, only when there are any.
 */
export function histogram(ratios: readonly number[]): Bucket[] {
  const counts = Array.from({ length: BUCKETS }, () => 0);
  let below = 0;
  for (const r of ratios) {
    if (r < 0) below += 1;
    else counts[Math.min(BUCKETS - 1, Math.floor(r * BUCKETS + EPSILON))] += 1;
  }
  const buckets = counts.map((count, i) => ({ label: `${i * 10}–${(i + 1) * 10}%`, count }));
  return below > 0 ? [{ label: "Below 0%", count: below }, ...buckets] : buckets;
}
