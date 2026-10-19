"use client";

import { Camera, MonitorX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { checkCamera } from "@/lib/camera";
import { useIsClient } from "@/lib/use-is-client";
import type { Availability, MyAttempt } from "@/services/quiz-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Props = { quizId: string; availability: Availability; myAttempt: MyAttempt };

/**
 * Start / Resume / View result. Starting needs the desktop app (D-013) and a working camera (F-04, D-010);
 * the server re-checks the window and one-attempt rule.
 */
export function StartButton({ quizId, availability, myAttempt }: Props) {
  const router = useRouter();
  const isClient = useIsClient();
  const [step, setStep] = useState<"idle" | "camera" | "starting">("idle");
  const [problem, setProblem] = useState<{ title: string; message: string } | null>(null);

  if (myAttempt && myAttempt.status !== "active") {
    return (
      <div className="flex flex-wrap gap-3">
        <Button size="lg" variant="outline" asChild><Link href={`/student/attempts/${myAttempt.id}`}>View result</Link></Button>
        <Button size="lg" variant="ghost" asChild><Link href={`/student/quizzes/${quizId}/leaderboard`}>Leaderboard</Link></Button>
      </div>
    );
  }

  const resuming = myAttempt?.status === "active";
  const desktop = isClient && Boolean(window.proctra);

  async function start() {
    setProblem(null);
    setStep("camera");
    const camera = await checkCamera();
    if (!camera.ok) {
      setStep("idle");
      setProblem({ title: "Camera needed", message: camera.message });
      return;
    }
    setStep("starting");
    const res = await api<{ attemptId: string }>("POST", `/api/v1/quizzes/${quizId}/attempts`);
    if (!res.ok) {
      setStep("idle");
      setProblem({ title: "Couldn't start", message: res.error.message });
      router.refresh();
      return;
    }
    const opened = await window.proctra!.startExam(res.data.attemptId); // opens the kiosk window, hides this one
    setStep("idle");
    if (!opened.ok) setProblem({ title: "Couldn't open the exam window", message: "Please try again." });
  }

  const label = step === "camera" ? "Checking camera…" : step === "starting" ? "Opening…" : resuming ? "Resume exam" : "Start exam";
  const note = availability === "upcoming" ? "Not open yet." : availability === "closed" ? "This exam has ended." : resuming ? "Your time keeps running while you're away." : "";

  return (
    <div className="grid gap-3">
      {isClient && !desktop && (
        <Alert>
          <MonitorX />
          <AlertTitle>Use the Proctra desktop app</AlertTitle>
          <AlertDescription>Exams open in a full-screen window with the camera on, which a normal browser can&apos;t provide.</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={start} disabled={!desktop || step !== "idle" || availability !== "open"}>
          {step === "idle" && <Camera />}{label}
        </Button>
        {note && <span className="text-sm text-muted-foreground">{note}</span>}
      </div>
      {problem && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>{problem.title}</AlertTitle>
          <AlertDescription>{problem.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
