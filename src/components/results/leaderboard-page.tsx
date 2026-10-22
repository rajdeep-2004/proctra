import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalTime } from "@/components/local-time";
import { LeaderboardView } from "@/components/results/leaderboard-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppError } from "@/lib/api-response";
import { requirePageUser } from "@/lib/session";
import type { Role } from "@/models/user";
import { ObjectIdString } from "@/schemas/quiz";
import { getLeaderboard } from "@/services/results-service";

type Outcome = { ok: true; board: Awaited<ReturnType<typeof getLeaderboard>> } | { ok: false; error: AppError };

async function load(user: { id: string; role: Role }, quizId: string): Promise<Outcome> {
  try {
    return { ok: true, board: await getLeaderboard(user, quizId) };
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    if (error instanceof AppError && error.status === 403) return { ok: false, error };
    throw error;
  }
}

/** Shared by the teacher and student leaderboard routes (each passes its role and back link). */
export async function LeaderboardPage({ role, rawQuizId, backHref, backLabel }: { role: Role; rawQuizId: string; backHref: (id: string) => string; backLabel: string }) {
  const user = await requirePageUser(role);
  const parsed = ObjectIdString.safeParse(rawQuizId);
  if (!parsed.success) notFound();
  const outcome = await load(user, parsed.data);
  if (!outcome.ok && role === "teacher") notFound(); // another teacher's quiz looks missing
  return (
    <section className="grid gap-6">
      <Link href={backHref(parsed.data)} className="text-sm text-muted-foreground hover:text-foreground">← {backLabel}</Link>
      {outcome.ok ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">{outcome.board.quizTitle} leaderboard</h1>
          <LeaderboardView initial={outcome.board} />
        </>
      ) : (
        <Alert>
          <AlertTitle>Leaderboard not available yet</AlertTitle>
          <AlertDescription>
            {outcome.error.code === "RESULTS_NOT_RELEASED" ? (
              <>It will appear from <LocalTime iso={(outcome.error.details as { resultsReleaseAt: string }).resultsReleaseAt} />.</>
            ) : (
              "Finish this quiz to see the leaderboard."
            )}
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}
