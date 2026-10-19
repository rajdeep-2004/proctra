import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LocalTime } from "@/components/local-time";
import { AvailabilityBadge } from "@/components/quiz/availability-badge";
import { Countdown } from "@/components/quiz/countdown";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePageUser } from "@/lib/session";
import { listQuizzesForStudent, type Availability, type QuizForStudent } from "@/services/quiz-service";

export const metadata: Metadata = { title: "Dashboard · Proctra" };

export default function StudentDashboard() {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <QuizGroups />
      </Suspense>
    </section>
  );
}

const GROUPS: { key: Availability; title: string; empty: string }[] = [
  { key: "open", title: "Open now", empty: "Nothing open right now." },
  { key: "upcoming", title: "Upcoming", empty: "Nothing scheduled." },
  { key: "closed", title: "Closed", empty: "" },
];

async function QuizGroups() {
  const user = await requirePageUser("student");
  const { quizzes, serverNow } = await listQuizzesForStudent(user.id);
  if (quizzes.length === 0) return <p className="text-muted-foreground">No quizzes have been published yet.</p>;
  return (
    <div className="grid gap-8">
      {GROUPS.map((g) => {
        const items = quizzes.filter((q) => q.availability === g.key);
        if (items.length === 0 && !g.empty) return null;
        return (
          <section key={g.key} className="grid gap-3" aria-labelledby={`group-${g.key}`}>
            <h2 id={`group-${g.key}`} className="text-lg font-medium">{g.title}</h2>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">{g.empty}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">{items.map((q) => <QuizCard key={q.id} quiz={q} serverNow={serverNow} />)}</div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function QuizCard({ quiz: q, serverNow }: { quiz: QuizForStudent; serverNow: string }) {
  return (
    <Link href={`/student/quizzes/${q.id}`} className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{q.title}</CardTitle>
            <AvailabilityBadge availability={q.availability} />
          </div>
          <CardDescription className="grid gap-1">
            <span>{q.questionCount} questions · {q.durationMinutes} min</span>
            <span>
              <LocalTime iso={q.startsAt} /> – <LocalTime iso={q.endsAt} />
            </span>
            {q.availability !== "closed" && (
              <Countdown startsAt={q.startsAt} endsAt={q.endsAt} serverNow={serverNow} refreshOnChange
                className="font-medium text-foreground tabular-nums" />
            )}
            {q.myAttempt && <span className="font-medium text-foreground">{q.myAttempt.status === "active" ? "In progress" : "Submitted"}</span>}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
