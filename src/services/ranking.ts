// Pure leaderboard ranking (D-059, supersedes D-025). No DB, no "server-only", so .scratch/ can check it by hand.
// Order: marks high → low, then finish time early → late. A rank is shared only on an exact tie of both (1, 1, 3).

export type Rankable = { name: string; score: number; finishedAt: number }; // finishedAt = submittedAt in ms

const tied = (a: Rankable, b: Rankable) => a.score === b.score && a.finishedAt === b.finishedAt;

export function rankEntries<T extends Rankable>(items: T[]): (T & { rank: number })[] {
  const sorted = [...items].sort(
    (a, b) => b.score - a.score || a.finishedAt - b.finishedAt || a.name.localeCompare(b.name), // exact ties: by name
  );
  let rank = 0;
  return sorted.map((item, i) => {
    if (i === 0 || !tied(item, sorted[i - 1])) rank = i + 1; // not tied with the one above → rank = 1-based position
    return { ...item, rank };
  });
}
