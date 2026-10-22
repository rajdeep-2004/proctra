import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/layout/back-button";
import { LocalTime } from "@/components/local-time";
import { AttemptStatusBadge } from "@/components/quiz/attempt-status-badge";
import { HistoryAnalytics } from "@/components/results/history-analytics";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getStudentForTeacher, type TeacherStudentAttempt } from "@/services/results-service";

export const metadata: Metadata = { title: "Student · Proctra" };

type Params = PageProps<"/teacher/students/[studentId]">["params"];

export default function StudentPage({ params }: PageProps<"/teacher/students/[studentId]">) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <Student params={params} />
    </Suspense>
  );
}

async function load(teacherId: string, studentId: string) {
  try {
    return await getStudentForTeacher(teacherId, studentId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

/** One student across THIS teacher's quizzes only (v1/05, D-064). */
async function Student({ params }: { params: Params }) {
  const user = await requirePageUser("teacher");
  const parsed = ObjectIdString.safeParse((await params).studentId);
  if (!parsed.success) notFound();
  const { student, attempts } = await load(user.id, parsed.data);

  return (
    <section className="grid gap-6">
      <div className="grid gap-1">
        <BackButton href="/teacher" label="Back to quizzes" />
        <h1 className="text-2xl font-semibold tracking-tight">{student.name}</h1>
        <p className="text-muted-foreground">{student.email} · results on your quizzes only</p>
      </div>
      <HistoryAnalytics rows={attempts} label="Student analytics" />
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
          {attempts.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-medium">
                <Link href={`/teacher/quizzes/${a.quizId}/results`} className="hover:underline">{a.quizTitle}</Link>
              </TableCell>
              <TableCell><LocalTime iso={a.startedAt} format="date" /></TableCell>
              <TableCell><AttemptStatusBadge status={a.status} /></TableCell>
              <TableCell className="text-right tabular-nums"><Marks attempt={a} /></TableCell>
              <TableCell className="text-right">
                <Link className="font-medium underline underline-offset-4" href={`/teacher/attempts/${a.id}`}>View</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function Marks({ attempt }: { attempt: TeacherStudentAttempt }) {
  if (!attempt.score) return <span className="text-muted-foreground">Pending</span>;
  return <span>{fmt(attempt.score.total)} <span className="text-muted-foreground">/ {fmt(attempt.score.maxPossible)}</span></span>;
}
