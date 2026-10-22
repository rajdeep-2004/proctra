import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LocalTime } from "@/components/local-time";
import { AvailabilityBadge } from "@/components/quiz/availability-badge";
import { Countdown } from "@/components/quiz/countdown";
import { LinkTabs } from "@/components/layout/link-tabs";
import { StaggerIn } from "@/components/motion/stagger-in";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseTab, STUDENT_TABS, studentTabOf, type StudentTab } from "@/lib/quiz-tabs";
import { requirePageUser } from "@/lib/session";
import { listQuizzesForStudent, type Availability, type QuizForStudent } from "@/services/quiz-service";

export const metadata: Metadata = { title: "Dashboard · Proctra" };

type SearchParams = PageProps<"/student">["searchParams"];

export default function StudentDashboard({ searchParams }: PageProps<"/student">) {
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <QuizGroups searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

// Each tab shows its availability groups in this order (open first, then upcoming).
const GROUPS: Record<StudentTab, { key: Availability; title: string; empty: string }[]> = {
  current: [
    { key: "open", title: "Open now", empty: "Nothing open right now." },
    { key: "upcoming", title: "Upcoming", empty: "Nothing scheduled." },
  ],
  closed: [{ key: "closed", title: "Closed", empty: "No closed quizzes yet." }],
};
const TAB_LABEL: Record<StudentTab, string> = { current: "Open & upcoming", closed: "Closed" };

async function QuizGroups({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageUser("student");
  const tab = parseTab((await searchParams).tab, STUDENT_TABS);
  const { quizzes, serverNow } = await listQuizzesForStudent(user.id);
  if (quizzes.length === 0) return <p className="text-muted-foreground">No quizzes have been published yet.</p>;
  const count = (t: StudentTab) => quizzes.filter((q) => studentTabOf(q.availability) === t).length;
  const tabs = STUDENT_TABS.map((t) => ({ value: t, label: TAB_LABEL[t], count: count(t), href: t === "current" ? "/student" : `/student?tab=${t}` }));
  return (
    <div className="grid gap-6">
      <LinkTabs tabs={tabs} active={tab} label="Filter quizzes" />
      <StaggerIn key={tab} className="grid gap-8">
        {GROUPS[tab].map((g) => {
          const items = quizzes.filter((q) => q.availability === g.key);
          return (
            <section key={g.key} className="grid gap-3" aria-labelledby={`group-${g.key}`}>
              <h2 id={`group-${g.key}`} className={GROUPS[tab].length > 1 ? "text-lg font-medium" : "sr-only"}>{g.title}</h2>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{g.empty}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">{items.map((q) => <QuizCard key={q.id} quiz={q} serverNow={serverNow} />)}</div>
              )}
            </section>
          );
        })}
      </StaggerIn>
    </div>
  );
}

function QuizCard({ quiz: q, serverNow }: { quiz: QuizForStudent; serverNow: string }) {
  return (
    <Link href={`/student/quizzes/${q.id}`} data-animate className="rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
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
