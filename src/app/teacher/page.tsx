import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LinkTabs } from "@/components/layout/link-tabs";
import { TeacherQuizTable } from "@/components/quiz/teacher-quiz-table";
import { Button } from "@/components/ui/button";
import { countTeacherTabs, parseTab, TEACHER_TABS, teacherTabOf, type TeacherTab } from "@/lib/quiz-tabs";
import { requirePageUser } from "@/lib/session";
import { listTeacherQuizzes } from "@/services/quiz-service";

export const metadata: Metadata = { title: "Dashboard · Proctra" };

type SearchParams = PageProps<"/teacher">["searchParams"];

export default function TeacherDashboard({ searchParams }: PageProps<"/teacher">) {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Your quizzes</h1>
        <Button asChild>
          <Link href="/teacher/quizzes/new">New quiz</Link>
        </Button>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <QuizTabs searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

const TAB_INFO: Record<TeacherTab, { label: string; empty: string }> = {
  all: { label: "All", empty: "You haven't created any quizzes yet." },
  drafts: { label: "Drafts", empty: "No drafts." },
  live: { label: "Live", empty: "No quizzes are open or upcoming." },
  closed: { label: "Closed", empty: "No closed quizzes yet." },
  archived: { label: "Archived", empty: "Nothing archived." },
};

async function QuizTabs({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePageUser("teacher");
  const tab = parseTab((await searchParams).tab, TEACHER_TABS);
  const quizzes = await listTeacherQuizzes(user.id);
  const now = new Date(); // server time decides live vs closed (D-058)
  const counts = countTeacherTabs(quizzes, now);
  const visible = tab === "all" ? quizzes : quizzes.filter((q) => teacherTabOf(q, now) === tab);
  const tabs = TEACHER_TABS.map((t) => ({ value: t, label: TAB_INFO[t].label, count: counts[t], href: t === "all" ? "/teacher" : `/teacher?tab=${t}` }));
  return (
    <div className="grid gap-4">
      <LinkTabs tabs={tabs} active={tab} label="Filter quizzes" />
      {/* key: a new tab starts with an empty search box */}
      <TeacherQuizTable key={tab} quizzes={visible} emptyText={TAB_INFO[tab].empty} />
    </div>
  );
}
