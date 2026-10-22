import { Check, Flag, Minus, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/layout/back-button";
import { LocalTime } from "@/components/local-time";
import { AttemptStatusBadge } from "@/components/quiz/attempt-status-badge";
import { EventTimeline } from "@/components/results/event-timeline";
import { ResultCounts } from "@/components/results/result-counts";
import { SnapshotGallery } from "@/components/results/snapshot-gallery";
import { StatGrid, StatTile } from "@/components/results/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/lib/api-response";
import { accuracy, durationMs, formatDuration, formatPercent } from "@/lib/attempt-stats";
import { requirePageUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { ObjectIdString } from "@/schemas/quiz";
import { getAttemptForTeacher, type TeacherAttemptView } from "@/services/results-service";

export const metadata: Metadata = { title: "Submission · Proctra" };

type Params = PageProps<"/teacher/attempts/[attemptId]">["params"];

export default function TeacherAttemptPage({ params }: PageProps<"/teacher/attempts/[attemptId]">) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function load(teacherId: string, attemptId: string) {
  try {
    return await getAttemptForTeacher(teacherId, attemptId);
  } catch (error) {
    if (error instanceof AppError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
const RESULT = {
  correct: { icon: <Check className="size-4" />, text: "Correct", cls: "text-green-700 dark:text-green-400" },
  incorrect: { icon: <X className="size-4" />, text: "Wrong", cls: "text-destructive" },
  unanswered: { icon: <Minus className="size-4" />, text: "Not answered", cls: "text-muted-foreground" },
} as const;

async function Detail({ params }: { params: Params }) {
  const user = await requirePageUser("teacher");
  const parsed = ObjectIdString.safeParse((await params).attemptId);
  if (!parsed.success) notFound();
  const a = await load(user.id, parsed.data);

  return (
    <section className="grid gap-6">
      <div className="grid gap-4">
        <BackButton href={`/teacher/quizzes/${a.quizId}/results`} label={`Back to ${a.quizTitle} results`} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{a.studentName}</h1>
          <AttemptStatusBadge status={a.status} />
        </div>
        <AttemptSummary a={a} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="grid content-start gap-3" aria-labelledby="answers-heading">
          <h2 id="answers-heading" className="text-lg font-medium">Answers</h2>
          {a.questions.map((q, i) => {
            const r = RESULT[q.result];
            return (
              <Card key={q.id}>
                <CardContent className="grid gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium"><span className="text-muted-foreground">{i + 1}.</span> {q.text}</p>
                    <span className={cn("flex shrink-0 items-center gap-1 text-sm font-medium", r.cls)}>{r.icon}{r.text}</span>
                  </div>
                  <ul className="grid gap-1.5 text-sm">
                    {q.options.map((opt, j) => (
                      <li key={j} className={cn("flex items-center gap-2 rounded-md border px-3 py-2",
                        j === q.correctIndex && "border-green-600/50 bg-green-600/10",
                        j === q.selectedIndex && j !== q.correctIndex && "border-destructive/50 bg-destructive/10")}>
                        <span className="font-medium">{String.fromCharCode(65 + j)}.</span>
                        <span className="flex-1">{opt}</span>
                        {j === q.correctIndex && <span className="text-xs font-medium text-green-700 dark:text-green-400">Correct answer</span>}
                        {j === q.selectedIndex && <span className="text-xs font-medium">Student&apos;s answer</span>}
                      </li>
                    ))}
                  </ul>
                  {q.markedForReview && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Flag className="size-3" /> Marked for review by the student</p>}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <aside className="grid content-start gap-4 lg:w-[20rem]">
          <Card>
            <CardHeader><CardTitle className="text-base">Session events</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <EventTimeline events={a.events} />
              <p className="text-xs text-muted-foreground">Neutral facts about the exam session, not evidence of misconduct.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Snapshots</CardTitle></CardHeader>
            <CardContent><SnapshotGallery attemptId={a.id} count={a.snapshotCount} /></CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}

/** Start, end, duration and marks as tiles, plus the answer breakdown as tags (issue 1.4). */
function AttemptSummary({ a }: { a: TeacherAttemptView }) {
  const ms = durationMs(a.startedAt, a.submittedAt);
  const acc = a.score ? accuracy(a.score) : null;
  return (
    <div className="grid gap-3">
      <StatGrid>
        <StatTile label="Started" value={<LocalTime iso={a.startedAt} />} />
        <StatTile label="Ended" value={a.submittedAt ? <LocalTime iso={a.submittedAt} /> : "Still writing"}
          hint={a.status === "auto_submitted" ? "At time-up" : undefined} />
        <StatTile label="Duration" value={ms === null ? "In progress" : formatDuration(ms)} />
        <StatTile label="Marks" value={a.score ? <>{fmt(a.score.total)} <span className="text-muted-foreground">/ {fmt(a.score.maxPossible)}</span></> : "Pending"}
          hint={acc !== null ? `${formatPercent(acc)} accuracy` : undefined} />
      </StatGrid>
      {a.score && <ResultCounts correct={a.score.correct} incorrect={a.score.incorrect} unanswered={a.score.unanswered} />}
    </div>
  );
}

