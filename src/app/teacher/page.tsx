import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LocalTime } from "@/components/local-time";
import { StatusBadge } from "@/components/quiz/status-badge";
import { StaggerIn } from "@/components/motion/stagger-in";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePageUser } from "@/lib/session";
import { listTeacherQuizzes } from "@/services/quiz-service";

export const metadata: Metadata = { title: "Dashboard · Proctra" };

export default function TeacherDashboard() {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your quizzes</h1>
        <Button asChild>
          <Link href="/teacher/quizzes/new">New quiz</Link>
        </Button>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <QuizTable />
      </Suspense>
    </section>
  );
}

async function QuizTable() {
  const user = await requirePageUser("teacher");
  const quizzes = await listTeacherQuizzes(user.id);
  if (quizzes.length === 0) {
    return <p className="text-muted-foreground">You haven&apos;t created any quizzes yet.</p>;
  }
  return (
    <StaggerIn>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Opens</TableHead>
          <TableHead>Closes</TableHead>
          <TableHead className="text-right">Questions</TableHead>
          <TableHead className="text-right">Attempts</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quizzes.map((q) => (
          <TableRow key={q.id} data-animate>
            <TableCell className="font-medium">
              <Link href={`/teacher/quizzes/${q.id}`} className="hover:underline">{q.title}</Link>
            </TableCell>
            <TableCell><StatusBadge status={q.status} /></TableCell>
            <TableCell><LocalTime iso={q.startsAt} /></TableCell>
            <TableCell><LocalTime iso={q.endsAt} /></TableCell>
            <TableCell className="text-right">{q.questionCount}</TableCell>
            <TableCell className="text-right">
              {q.attemptCount > 0 ? <Link href={`/teacher/quizzes/${q.id}/results`} className="underline underline-offset-4">{q.attemptCount}</Link> : 0}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </StaggerIn>
  );
}
