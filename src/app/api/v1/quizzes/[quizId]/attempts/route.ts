import { created, ok, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { startOrResume } from "@/services/attempt-service";

// POST /api/v1/quizzes/:quizId/attempts — start (201) or resume the active attempt (200). Body ignored.
export const POST = withHandler(async (_req, ctx: RouteContext<"/api/v1/quizzes/[quizId]/attempts">) => {
  const user = await requireUser("student");
  const quizId = ObjectIdString.parse((await ctx.params).quizId);
  const result = await startOrResume(user, quizId);
  return result.resumed ? ok(result) : created(result);
});
