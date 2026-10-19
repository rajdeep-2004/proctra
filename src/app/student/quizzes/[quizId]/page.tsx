import { Camera } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LocalTime } from "@/components/local-time";
import { AvailabilityBadge } from "@/components/quiz/availability-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getQuizForStudent } from "@/services/quiz-service";

export const metadata: Metadata = { title: "Quiz · Proctra" };

type Params = PageProps<"/student/quizzes/[quizId]">["params"];

export default function StudentQuizPage({ params }: PageProps<"/student/quizzes/[quizId]">) {
  return (
    <div className="grid gap-6">
      <Link href="/student" className="text-sm text-muted-foreground hover:text-foreground">← All quizzes</Link>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-muted" />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function load(studentId: string, quizId: string) {
  try {
    return await getQuizForStudent(studentId, quizId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }
}

const fmtMark = (n: number) => (n > 0 ? `+${n}` : String(n));

async function Detail({ params }: { params: Params }) {
  const user = await requirePageUser("student");
  const parsed = ObjectIdString.safeParse((await params).quizId);
  if (!parsed.success) notFound();
  const q = await load(user.id, parsed.data);

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{q.title}</h1>
        <AvailabilityBadge availability={q.availability} />
      </div>

      <Card>
        <CardHeader><CardTitle>About this quiz</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
            <dt className="text-muted-foreground">Opens</dt><dd><LocalTime iso={q.startsAt} /></dd>
            <dt className="text-muted-foreground">Closes</dt><dd><LocalTime iso={q.endsAt} /></dd>
            <dt className="text-muted-foreground">Duration</dt><dd>{q.durationMinutes} minutes (ends earlier if the quiz closes first)</dd>
            <dt className="text-muted-foreground">Questions</dt><dd>{q.questionCount}, multiple choice</dd>
            <dt className="text-muted-foreground">Marking</dt>
            <dd>{fmtMark(q.marking.correct)} correct · {fmtMark(q.marking.incorrect)} wrong · {fmtMark(q.marking.unanswered)} unanswered</dd>
          </dl>
          {q.instructions && (
            <div className="grid gap-1 pt-2">
              <h2 className="font-medium">Instructions</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{q.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Camera />
        <AlertTitle>Camera required</AlertTitle>
        <AlertDescription>
          This quiz opens in a full-screen exam window. Your camera must be on, and a still photo is taken about every
          10 seconds while the attempt is active. There is no video recording and no live preview. Photos are visible
          only to your teacher.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-3">
        {/* Wired up in phase 04 (start/resume attempt) and phase 05 (camera check + kiosk window). */}
        <Button size="lg" disabled>Start quiz</Button>
        <span className="text-sm text-muted-foreground">
          {q.availability === "upcoming" ? "Not open yet." : q.availability === "closed" ? "This quiz has closed." : "Starting quizzes is coming soon."}
        </span>
      </div>
    </section>
  );
}
