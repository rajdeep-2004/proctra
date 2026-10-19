import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuizEditor } from "@/components/quiz/quiz-editor";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getTeacherQuiz } from "@/services/quiz-service";

export const metadata: Metadata = { title: "Edit quiz · Proctra" };

export default function EditQuizPage({ params }: PageProps<"/teacher/quizzes/[quizId]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Loaded params={params} />
    </Suspense>
  );
}

async function Loaded({ params }: { params: PageProps<"/teacher/quizzes/[quizId]">["params"] }) {
  const user = await requirePageUser("teacher");
  const parsed = ObjectIdString.safeParse((await params).quizId);
  if (!parsed.success) notFound();
  const quiz = await loadOrNotFound(user.id, parsed.data);
  return <QuizEditor initial={quiz} />;
}

async function loadOrNotFound(teacherId: string, quizId: string) {
  try {
    return await getTeacherQuiz(teacherId, quizId);
  } catch (error) {
    // Missing or another teacher's quiz: show 404 rather than confirm it exists.
    if (error instanceof AppError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }
}
