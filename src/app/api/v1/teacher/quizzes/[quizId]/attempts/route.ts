import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { listSubmissions } from "@/services/results-service";

// GET /api/v1/teacher/quizzes/:quizId/attempts — submissions table for a quiz I own.
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/teacher/quizzes/[quizId]/attempts">) => {
  const user = await requireUser("teacher");
  const quizId = ObjectIdString.parse((await ctx.params).quizId);
  return listSubmissions(user.id, quizId);
});
