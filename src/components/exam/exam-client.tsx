"use client";

import { ChevronLeft, ChevronRight, Flag } from "lucide-react";
import { useCallback, useState } from "react";
import type { ActiveAttemptView } from "@/services/attempt-service";
import { ExamTimer } from "@/components/exam/exam-timer";
import { QuestionPalette } from "@/components/exam/question-palette";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AnswerState = { selectedIndex: number | null; markedForReview: boolean };

export function ExamClient({ attempt }: { attempt: ActiveAttemptView }) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(attempt.answers);
  const [current, setCurrent] = useState(0);
  const total = attempt.questions.length;
  const q = attempt.questions[current];
  const a = answers[q.id] ?? { selectedIndex: null, markedForReview: false };

  const update = useCallback((questionId: string, next: AnswerState) => {
    setAnswers((prev) => ({ ...prev, [questionId]: next }));
    // 04.4: hand the change to the autosave queue here.
  }, []);

  const onExpire = useCallback(() => {
    // 04.5: auto-submit.
  }, []);

  const go = (i: number) => setCurrent(Math.min(total - 1, Math.max(0, i)));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <h1 className="truncate font-semibold">{attempt.quizTitle}</h1>
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
