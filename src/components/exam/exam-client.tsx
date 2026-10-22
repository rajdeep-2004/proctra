"use client";

import { CameraOff, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { ActiveAttemptView } from "@/services/attempt-service";
import { ExamTimer } from "@/components/exam/exam-timer";
import { SaveIndicator } from "@/components/exam/save-indicator";
import { SubmitDialog } from "@/components/exam/submit-dialog";
import { useExamCamera } from "@/components/exam/use-exam-camera";
import { useProctorEvents } from "@/components/exam/use-proctor-events";
import { useSnapshots } from "@/components/exam/use-snapshots";
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
  if (!window.proctra) {
    // A normal browser can't give the kiosk window or the camera; the server still enforces time and grading (D-013).
    return (
      <div className="mx-auto grid max-w-lg gap-3 p-8 text-center">
        <h1 className="text-xl font-semibold">Open this exam in the Proctra desktop app</h1>
        <p className="text-muted-foreground">Exams run in a full-screen window with the camera on. Your attempt is saved. Resume it from the app.</p>
      </div>
    );
  }
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
  // Proctoring runs only while the student can still answer; it stops on submit / time's up (F-07, F-09).
  const proctoring = submitState === "idle" || submitState === "error";
  const events = useProctorEvents(attempt.id, proctoring);
  const camera = useExamCamera(
    proctoring,
    useCallback(() => events.log("camera_lost"), [events]),
    useCallback(() => events.log("camera_restored"), [events]),
  );
  const cameraBlocked = proctoring && camera.status === "lost";
  // Stills every 10 s only while the attempt runs and the camera is live (F-07); never outside an attempt.
  useSnapshots(attempt.id, proctoring && camera.status === "live", camera.grabFrame,
    useCallback(() => events.log("snapshot_failed"), [events]), goToResult);
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
      setSubmitError("Some answers haven't reached the server yet. Check your connection, then submit again. Nothing is lost.");
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
      {cameraBlocked && (
        // Blocks answering until the camera is back; the header (with the timer) stays visible (D-010).
        <div role="alertdialog" aria-modal="true" aria-labelledby="camera-lost-title"
          className="fixed inset-x-0 top-14 bottom-0 z-40 grid place-items-center bg-background/95 p-6 text-center">
          <div className="grid max-w-md justify-items-center gap-3">
            <CameraOff className="size-10 text-destructive" aria-hidden />
            <h2 id="camera-lost-title" className="text-2xl font-semibold">Camera disconnected</h2>
            <p className="text-muted-foreground">
              Reconnect or re-enable your camera to continue. We&apos;re checking every few seconds. The timer keeps running.
            </p>
          </div>
        </div>
      )}
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
