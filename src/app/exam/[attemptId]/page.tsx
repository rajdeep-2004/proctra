import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ExamClient } from "@/components/exam/exam-client";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getAttemptForStudent } from "@/services/attempt-service";

export const metadata: Metadata = { title: "Exam · Proctra" };

type Params = PageProps<"/exam/[attemptId]">["params"];

// The exam has its own bare layout (no app header or navigation) — phase 05 opens it in a kiosk window.
export default function ExamPage({ params }: PageProps<"/exam/[attemptId]">) {
  return (
    <Suspense fallback={<div className="m-8 h-96 animate-pulse rounded-xl bg-muted" aria-label="Loading exam" />}>
      <Exam params={params} />
    </Suspense>
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

async function Exam({ params }: { params: Params }) {
  const user = await requirePageUser("student");
  const parsed = ObjectIdString.safeParse((await params).attemptId);
  if (!parsed.success) notFound();
  const attempt = await load(user.id, parsed.data);
  if (attempt.status !== "active") redirect(`/student/attempts/${attempt.id}`); // finished → result page
  return <ExamClient attempt={attempt} />;
}
