// Pure "standard competition ranking" (D-025): equal scores share a rank and the next rank skips (1, 1, 3).
// No DB, no "server-only", so .scratch/ can check it by hand.

export type Rankable = { name: string; score: number };

export function competitionRank<T extends Rankable>(items: T[]): (T & { rank: number })[] {
  const sorted = [...items].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)); // ties alphabetical
  let rank = 0;
  return sorted.map((item, i) => {
    if (i === 0 || item.score !== sorted[i - 1].score) rank = i + 1; // new score → rank = 1-based position
    return { ...item, rank };
  });
}
