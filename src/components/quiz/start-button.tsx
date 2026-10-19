"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import type { Availability, MyAttempt } from "@/services/quiz-service";
import { Button } from "@/components/ui/button";

type Props = { quizId: string; availability: Availability; myAttempt: MyAttempt };

/** Start / Resume / View result. The server re-checks everything when starting (window, one attempt). */
export function StartButton({ quizId, availability, myAttempt }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (myAttempt && myAttempt.status !== "active") {
    return <Button size="lg" variant="outline" asChild><Link href={`/student/attempts/${myAttempt.id}`}>View result</Link></Button>;
  }

  async function start() {
    setBusy(true);
    setError(null);
    // Phase 05 adds the camera check and opens the exam in the kiosk window here.
    const res = await api<{ attemptId: string }>("POST", `/api/v1/quizzes/${quizId}/attempts`);
    if (!res.ok) {
      setBusy(false);
      setError(res.error.message);
      router.refresh();
      return;
    }
    router.push(`/exam/${res.data.attemptId}`);
  }

  const resuming = myAttempt?.status === "active";
  const canStart = availability === "open";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="lg" onClick={start} disabled={busy || !canStart}>
        {busy ? "Opening…" : resuming ? "Resume exam" : "Start exam"}
      </Button>
      <span className="text-sm text-muted-foreground" role={error ? "alert" : undefined}>
        {error ?? (availability === "upcoming" ? "Not open yet." : availability === "closed" ? "This exam has ended." : resuming ? "Your time keeps running while you're away." : "")}
      </span>
    </div>
  );
}
