import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/layout/back-button";
import { LocalTime } from "@/components/local-time";
import { AttemptStatusBadge } from "@/components/quiz/attempt-status-badge";
import { QuizAnalytics } from "@/components/results/quiz-analytics";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { listSubmissions } from "@/services/results-service";

export const metadata: Metadata = { title: "Results · Proctra" };

type Params = PageProps<"/teacher/quizzes/[quizId]/results">["params"];

export default function ResultsPage({ params }: PageProps<"/teacher/quizzes/[quizId]/results">) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <Results params={params} />
    </Suspense>
  );
}

async function load(teacherId: string, quizId: string) {
  try {
    return await listSubmissions(teacherId, quizId);
  } catch (error) {
    if (error instanceof AppError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

async function Results({ params }: { params: Params }) {
  const user = await requirePageUser("teacher");
  const parsed = ObjectIdString.safeParse((await params).quizId);
  if (!parsed.success) notFound();
  const { quiz, rows } = await load(user.id, parsed.data);

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <BackButton href={`/teacher/quizzes/${quiz.id}`} label="Edit quiz" />
          <h1 className="text-2xl font-semibold tracking-tight">{quiz.title} results</h1>
        </div>
        <Button variant="outline" asChild><Link href={`/teacher/quizzes/${quiz.id}/leaderboard`}>Leaderboard</Link></Button>
      </div>

      {rows.length > 0 && <QuizAnalytics rows={rows} maxPossible={quiz.maxPossible} />}

      {rows.length === 0 ? (
        <p className="text-muted-foreground">No one has started this quiz yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Marks</TableHead>
              <TableHead className="text-right">Events</TableHead>
              <TableHead className="text-right">Snapshots</TableHead>
              <TableHead className="text-right"><span className="sr-only">Open</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <Link href={`/teacher/students/${r.studentId}`} className="hover:underline">{r.studentName}</Link>
                </TableCell>
                <TableCell><AttemptStatusBadge status={r.status} /></TableCell>
                <TableCell>{r.submittedAt ? <LocalTime iso={r.submittedAt} /> : <span className="text-muted-foreground">Not yet</span>}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.score ? <>{fmt(r.score.total)} <span className="text-muted-foreground">/ {fmt(r.score.maxPossible)}</span></> : <span className="text-muted-foreground">Pending</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">{r.eventCount}</TableCell>
                <TableCell className="text-right tabular-nums">{r.snapshotCount}</TableCell>
                <TableCell className="text-right">
                  <Link className="font-medium underline underline-offset-4" href={`/teacher/attempts/${r.id}`}>View</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
