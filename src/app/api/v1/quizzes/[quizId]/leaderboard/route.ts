import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getLeaderboard } from "@/services/results-service";

// GET /api/v1/quizzes/:quizId/leaderboard — owner teacher, or a student who finished (once released). D-049.
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/quizzes/[quizId]/leaderboard">) => {
  const user = await requireUser();
  const quizId = ObjectIdString.parse((await ctx.params).quizId);
  return getLeaderboard(user, quizId);
});
