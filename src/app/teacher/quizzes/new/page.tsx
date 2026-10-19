import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizEditor } from "@/components/quiz/quiz-editor";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "New quiz · Proctra" };

export default function NewQuizPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
      <Guarded />
    </Suspense>
  );
}

async function Guarded() {
  await requirePageUser("teacher");
  return <QuizEditor initial={null} />;
}
