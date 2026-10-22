import type { Metadata } from "next";
import { Suspense } from "react";
import { LeaderboardPage } from "@/components/results/leaderboard-page";

export const metadata: Metadata = { title: "Leaderboard · Proctra" };

export default function TeacherLeaderboard({ params }: PageProps<"/teacher/quizzes/[quizId]/leaderboard">) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <Inner params={params} />
    </Suspense>
  );
}

async function Inner({ params }: { params: PageProps<"/teacher/quizzes/[quizId]/leaderboard">["params"] }) {
  const { quizId } = await params;
  return <LeaderboardPage role="teacher" rawQuizId={quizId} backHref={(id) => `/teacher/quizzes/${id}/results`} backLabel="Back to results" />;
}
