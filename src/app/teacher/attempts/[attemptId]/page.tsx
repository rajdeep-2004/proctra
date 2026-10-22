import { Check, Flag, Minus, X } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/layout/back-button";
import { LocalTime } from "@/components/local-time";
import { AttemptStatusBadge } from "@/components/quiz/attempt-status-badge";
import { EventTimeline } from "@/components/results/event-timeline";
import { SnapshotGallery } from "@/components/results/snapshot-gallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { ObjectIdString } from "@/schemas/quiz";
import { getAttemptForTeacher } from "@/services/results-service";

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
      <div className="grid gap-1">
        <BackButton href={`/teacher/quizzes/${a.quizId}/results`} label={`Back to ${a.quizTitle} results`} />
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{a.studentName}</h1>
          <AttemptStatusBadge status={a.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Started <LocalTime iso={a.startedAt} />
          {a.submittedAt && <> · submitted <LocalTime iso={a.submittedAt} /></>}
          {a.score && <> · <span className="font-medium text-foreground">{fmt(a.score.total)} / {fmt(a.score.maxPossible)}</span> ({a.score.correct} correct, {a.score.incorrect} wrong, {a.score.unanswered} unanswered)</>}
        </p>
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
