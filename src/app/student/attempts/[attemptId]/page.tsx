import { Check, Minus, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BackButton } from "@/components/layout/back-button";
import { LocalTime } from "@/components/local-time";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { ObjectIdString } from "@/schemas/quiz";
import { getAttemptForStudent, type FinishedAttemptView } from "@/services/attempt-service";

export const metadata: Metadata = { title: "Result · Proctra" };

type Params = PageProps<"/student/attempts/[attemptId]">["params"];

export default function ResultPage({ params }: PageProps<"/student/attempts/[attemptId]">) {
  return (
    <div className="grid gap-6">
      <BackButton href="/student" label="Back to quizzes" />
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-muted" />}>
        <Result params={params} />
      </Suspense>
    </div>
  );
}

async function load(studentId: string, attemptId: string) {
  try {
    return await getAttemptForStudent(studentId, attemptId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
}

async function Result({ params }: { params: Params }) {
  const user = await requirePageUser("student");
  const parsed = ObjectIdString.safeParse((await params).attemptId);
  if (!parsed.success) notFound();
  const attempt = await load(user.id, parsed.data);
  if (attempt.status === "active") redirect(`/exam/${attempt.id}`); // still running → back to the exam
  return <ResultView a={attempt} />;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));

function ResultView({ a }: { a: FinishedAttemptView }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{a.quizTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {a.status === "auto_submitted" ? "Submitted automatically when time ran out" : "Submitted"} · <LocalTime iso={a.submittedAt} />
          {a.released && <> · <Link href={`/student/quizzes/${a.quizId}/leaderboard`} className="font-medium text-foreground underline underline-offset-4">Leaderboard</Link></>}
        </p>
      </div>

      {!a.released || !a.score ? (
        <Alert>
          <AlertTitle>Your exam was submitted</AlertTitle>
          <AlertDescription>
            {a.resultsReleaseAt ? <>Marks will be shown from <LocalTime iso={a.resultsReleaseAt} />.</> : "Marks aren't available yet."}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Your score</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
              <p className="flex items-baseline gap-2 text-4xl font-semibold tabular-nums">
                {/* DevClub UI counter (S-02): rolls up to the score; respects reduced motion, has screen-reader text */}
                <AnimatedCounter value={a.score.total} decimals={Number.isInteger(a.score.total) ? 0 : 2} gooey={false} />
                <span className="text-xl text-muted-foreground">/ {fmt(a.score.maxPossible)}</span>
              </p>
              <dl className="grid grid-cols-3 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Correct</dt><dd className="text-lg font-medium">{a.score.correct}</dd></div>
                <div><dt className="text-muted-foreground">Wrong</dt><dd className="text-lg font-medium">{a.score.incorrect}</dd></div>
                <div><dt className="text-muted-foreground">Unanswered</dt><dd className="text-lg font-medium">{a.score.unanswered}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <section className="grid gap-3" aria-labelledby="review-heading">
            <h2 id="review-heading" className="text-lg font-medium">Review</h2>
            {a.questions?.map((q, i) => (
              <Card key={q.id}>
                <CardContent className="grid gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium"><span className="text-muted-foreground">{i + 1}.</span> {q.text}</p>
                    <ResultTag result={q.result} />
                  </div>
                  <ul className="grid gap-1.5 text-sm">
                    {q.options.map((opt, j) => (
                      <li key={j} className={cn("flex items-center gap-2 rounded-md border px-3 py-2",
                        j === q.correctIndex && "border-green-600/50 bg-green-600/10",
                        j === q.selectedIndex && j !== q.correctIndex && "border-destructive/50 bg-destructive/10")}>
                        <span className="font-medium">{String.fromCharCode(65 + j)}.</span>
                        <span className="flex-1">{opt}</span>
                        {j === q.correctIndex && <span className="text-xs font-medium text-green-700 dark:text-green-400">Correct answer</span>}
                        {j === q.selectedIndex && <span className="text-xs font-medium">Your answer</span>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </section>
        </>
      )}
    </section>
  );
}

function ResultTag({ result }: { result: "correct" | "incorrect" | "unanswered" }) {
  const m = {
    correct: { icon: <Check className="size-4" />, text: "Correct", cls: "text-green-700 dark:text-green-400" },
    incorrect: { icon: <X className="size-4" />, text: "Wrong", cls: "text-destructive" },
    unanswered: { icon: <Minus className="size-4" />, text: "Not answered", cls: "text-muted-foreground" },
  }[result];
  return <span className={cn("flex shrink-0 items-center gap-1 text-sm font-medium", m.cls)}>{m.icon}{m.text}</span>;
}
