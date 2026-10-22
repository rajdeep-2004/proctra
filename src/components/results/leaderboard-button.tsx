import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/** The one way pages link to a student leaderboard (issue 2.3). */
export function LeaderboardButton({ quizId, size = "default" }: { quizId: string; size?: "default" | "lg" }) {
  return (
    <Button variant="outline" size={size} asChild>
      <Link href={`/student/quizzes/${quizId}/leaderboard`}>
        <Trophy data-icon="inline-start" aria-hidden />
        Leaderboard
      </Link>
    </Button>
  );
}
