"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { LocalTime } from "@/components/local-time";
import { api } from "@/lib/api-client";
import type { Leaderboard } from "@/services/results-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const POLL_MS = 10_000;
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** Leaderboard table that re-fetches every 10 s while it's still "live" (D-049). */
export function LeaderboardView({ initial }: { initial: Leaderboard }) {
  const [board, setBoard] = useState(initial);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!board.live) return;
    const timer = setInterval(async () => {
      const res = await api<Leaderboard>("GET", `/api/v1/quizzes/${board.quizId}/leaderboard`);
      if (res.ok) {
        setBoard(res.data);
        setStale(false);
      } else {
        setStale(true); // keep showing the last good board
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [board.live, board.quizId]);

  return (
    <div className="grid gap-4">
      {board.live && stale && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <RefreshCw className="size-4" aria-hidden />
          Couldn&apos;t refresh; showing the last update.
        </p>
      )}
      {board.entries.length === 0 ? (
        <p className="text-muted-foreground">No one has finished yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Finished</TableHead>
              <TableHead className="text-right">Marks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {board.entries.map((e, i) => (
              <TableRow key={`${e.rank}-${e.studentName}-${i}`} className={cn(e.isMe && "bg-primary/5 font-medium")}
                aria-current={e.isMe ? "true" : undefined}>
                <TableCell className="tabular-nums">{e.rank}</TableCell>
                <TableCell>{e.studentName}{e.isMe && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</TableCell>
                <TableCell className="tabular-nums text-muted-foreground"><LocalTime iso={e.submittedAt} format="time-seconds" /></TableCell>
                <TableCell className="text-right tabular-nums">{fmt(e.score)} <span className="text-muted-foreground">/ {fmt(board.maxPossible)}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
