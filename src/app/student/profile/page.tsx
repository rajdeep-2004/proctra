import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LocalTime } from "@/components/local-time";
import { AttemptStatusBadge } from "@/components/quiz/attempt-status-badge";
import { ProfileAnalytics } from "@/components/results/profile-analytics";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePageUser } from "@/lib/session";
import { listMyAttempts, type MyAttemptRow } from "@/services/attempt-service";

export const metadata: Metadata = { title: "Profile · Proctra" };

export default function ProfilePage() {
  return (
    <section className="grid gap-6">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-muted" />}>
        <History />
      </Suspense>
    </section>
  );
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

async function History() {
  const user = await requirePageUser("student");
  const rows = await listMyAttempts(user.id);
  return (
    <>
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
        <p className="text-muted-foreground">{user.email} · {rows.length} attempt{rows.length === 1 ? "" : "s"}</p>
      </div>
      {rows.length > 0 && <ProfileAnalytics rows={rows} />}
      {rows.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t taken any quizzes yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quiz</TableHead>
              <TableHead>Taken</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Marks</TableHead>
              <TableHead className="text-right"><span className="sr-only">Open</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.quizTitle}</TableCell>
                <TableCell><LocalTime iso={r.startedAt} format="date" /></TableCell>
                <TableCell><AttemptStatusBadge status={r.status} /></TableCell>
                <TableCell className="text-right tabular-nums"><Marks row={r} /></TableCell>
                <TableCell className="text-right">
                  {r.status === "active" ? (
                    <Link className="font-medium underline underline-offset-4" href={`/student/quizzes/${r.quizId}`}>Resume</Link>
                  ) : (
                    <Link className="font-medium underline underline-offset-4" href={`/student/attempts/${r.id}`}>View</Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

function Marks({ row }: { row: MyAttemptRow }) {
  if (row.status === "active") return <span className="text-muted-foreground">Pending</span>;
  if (!row.score) {
    return row.resultsReleaseAt ? (
      <span className="text-sm text-muted-foreground">from <LocalTime iso={row.resultsReleaseAt} /></span>
    ) : (
      <span className="text-muted-foreground">Pending</span>
    );
  }
  return <span>{fmt(row.score.total)} <span className="text-muted-foreground">/ {fmt(row.score.maxPossible)}</span></span>;
}
