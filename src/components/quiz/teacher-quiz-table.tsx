"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LocalTime } from "@/components/local-time";
import { StaggerIn } from "@/components/motion/stagger-in";
import { StatusBadge } from "@/components/quiz/status-badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { QuizSummaryForTeacher } from "@/services/quiz-service";

type Props = { quizzes: QuizSummaryForTeacher[]; emptyText: string };

/** The active tab's quizzes with a title search (client-side: the tab's list is already loaded, D-058). */
export function TeacherQuizTable({ quizzes, emptyText }: Props) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = needle ? quizzes.filter((q) => q.title.toLowerCase().includes(needle)) : quizzes;

  if (quizzes.length === 0) return <p className="text-muted-foreground">{emptyText}</p>;
  return (
    <div className="grid gap-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title"
          aria-label="Search quizzes by title" className="pl-8" />
      </div>
      {shown.length === 0 ? (
        <p className="text-muted-foreground" role="status">No quizzes match &ldquo;{query.trim()}&rdquo;.</p>
      ) : (
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
              {shown.map((q) => (
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
      )}
    </div>
  );
}
