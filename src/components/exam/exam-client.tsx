"use client";

import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { ActiveAttemptView } from "@/services/attempt-service";
import { ExamTimer } from "@/components/exam/exam-timer";
import { SaveIndicator } from "@/components/exam/save-indicator";
import { SubmitDialog } from "@/components/exam/submit-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { readPending, useAutosave } from "@/components/exam/use-autosave";
import { useIsClient } from "@/lib/use-is-client";
import { QuestionPalette } from "@/components/exam/question-palette";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AnswerState = { selectedIndex: number | null; markedForReview: boolean };

/** Browser-only: it reads unconfirmed answers from localStorage before the first render. */
export function ExamClient({ attempt }: { attempt: ActiveAttemptView }) {
  const isClient = useIsClient();
  if (!isClient) return <div className="m-8 h-96 animate-pulse rounded-xl bg-muted" aria-label="Loading exam" />;
  return <Exam attempt={attempt} />;
}

function Exam({ attempt }: { attempt: ActiveAttemptView }) {
  const router = useRouter();
  // Server copy, overlaid with answers this device saved locally but the server hasn't confirmed yet.
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => ({ ...attempt.answers, ...readPending(attempt.id) }));
  const [current, setCurrent] = useState(0);
  const total = attempt.questions.length;
  const q = attempt.questions[current];
  const a = answers[q.id] ?? { selectedIndex: null, markedForReview: false };

  const goToResult = useCallback(() => {
    // In the desktop app, closing the kiosk window and showing the result in the main window is main.ts's job.
    if (window.proctra) void window.proctra.endExam(attempt.id);
    else router.replace(`/student/attempts/${attempt.id}`);
  }, [router, attempt.id]);
  const autosave = useAutosave(attempt.id, goToResult);

  const update = (questionId: string, next: AnswerState) => {
    setAnswers((prev) => ({ ...prev, [questionId]: next }));
    autosave.enqueue(questionId, next); // saved immediately; retried until the server confirms
  };

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "timeup" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** POST submit until it works (the server's lazy finalization is the backstop if it never does). */
  const sendSubmit = useCallback(async (attempts: number) => {
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(`/api/v1/attempts/${attempt.id}/submit`, { method: "POST", cache: "no-store" });
        if (res.ok) return true;
      } catch {
        // network error — try again
      }
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
    return false;
  }, [attempt.id]);

  const submit = async () => {
    setSubmitState("submitting");
    setSubmitError(null);
    // Don't submit while answers are still only on this device — they'd be left out.
    const allSaved = await autosave.flush(8000);
    if (!allSaved) {
      setSubmitState("error");
      setSubmitError("Some answers haven't reached the server yet. Check your connection, then submit again — nothing is lost.");
      return;
    }
    if (await sendSubmit(3)) goToResult();
    else {
      setSubmitState("error");
      setSubmitError("Couldn't reach the server to submit. Your answers are saved; try again in a moment.");
    }
  };

  // Timer hit zero: save what we can, submit, go to the result. The server stamps it at the deadline.
  const onExpire = useCallback(() => {
    setSubmitState("timeup");
    void (async () => {
      await autosave.flush(4000); // saves are still accepted for 5 s after the deadline
      await sendSubmit(5);
      goToResult(); // even if submit failed, the server auto-submits on the next read
    })();
  }, [autosave, sendSubmit, goToResult]);

  const go = (i: number) => setCurrent(Math.min(total - 1, Math.max(0, i)));

  return (
    <div className="flex min-h-screen flex-col">
      {submitState === "timeup" && (
        <div role="alertdialog" aria-modal="true" aria-labelledby="timeup-title"
          className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-6 text-center">
          <div className="grid gap-2">
            <h2 id="timeup-title" className="text-2xl font-semibold">Time&apos;s up</h2>
            <p className="text-muted-foreground">Submitting your saved answers…</p>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <h1 className="truncate font-semibold">{attempt.quizTitle}</h1>
          <SaveIndicator status={autosave.status} />
          <ExamTimer deadline={attempt.deadline} serverNow={attempt.serverNow} onExpire={onExpire} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 md:grid-cols-[1fr_16rem]">
        <main>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Question {current + 1} of {total}
              </CardTitle>
              <Button type="button" variant={a.markedForReview ? "secondary" : "ghost"} size="sm" aria-pressed={a.markedForReview}
                onClick={() => update(q.id, { ...a, markedForReview: !a.markedForReview })}>
                <Flag className={cn(a.markedForReview && "fill-amber-400 text-amber-600")} />
                {a.markedForReview ? "Marked for review" : "Mark for review"}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              <p className="text-lg leading-relaxed whitespace-pre-wrap" id={`q-${q.id}`}>{q.text}</p>

              <fieldset aria-labelledby={`q-${q.id}`} className="grid gap-3">
                {q.options.map((opt, i) => {
                  const selected = a.selectedIndex === i;
                  return (
                    <label key={i}
                      className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/60",
                        selected && "border-primary bg-primary/5 ring-1 ring-primary")}>
                      <input type="radio" name={`q-${q.id}`} value={i} checked={selected} className="mt-1 size-4 accent-primary"
                        onChange={() => update(q.id, { ...a, selectedIndex: i })} />
                      <span className="flex-1"><span className="mr-2 font-medium">{String.fromCharCode(65 + i)}.</span>{opt}</span>
                    </label>
                  );
                })}
              </fieldset>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="ghost" size="sm" disabled={a.selectedIndex === null}
                  onClick={() => update(q.id, { ...a, selectedIndex: null })}>
                  Clear answer
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => go(current - 1)} disabled={current === 0}>
                    <ChevronLeft /> Previous
                  </Button>
                  <Button type="button" onClick={() => go(current + 1)} disabled={current === total - 1}>
                    Next <ChevronRight />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="grid content-start gap-6">
          <SubmitDialog total={total} busy={submitState === "submitting" || submitState === "timeup"} onConfirm={submit}
            answered={attempt.questions.filter((x) => answers[x.id]?.selectedIndex != null).length}
            marked={attempt.questions.filter((x) => answers[x.id]?.markedForReview).length} />
          {submitError && (
            <Alert variant="destructive" role="alert"><AlertDescription>{submitError}</AlertDescription></Alert>
          )}
          <QuestionPalette current={current} onJump={go}
            items={attempt.questions.map((x) => ({
              id: x.id,
              answered: answers[x.id]?.selectedIndex != null,
              marked: Boolean(answers[x.id]?.markedForReview),
            }))} />
        </aside>
      </div>
    </div>
  );
}
