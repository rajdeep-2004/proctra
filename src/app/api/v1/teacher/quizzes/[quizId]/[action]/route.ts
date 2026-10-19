import { z } from "zod";
import { AppError, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { QUIZ_ACTIONS, transitionQuiz } from "@/services/quiz-service";

// POST /api/v1/teacher/quizzes/:quizId/{publish|unpublish|archive}
export const POST = withHandler(async (_req, ctx: RouteContext<"/api/v1/teacher/quizzes/[quizId]/[action]">) => {
  const user = await requireUser("teacher");
  const params = await ctx.params;
  const quizId = ObjectIdString.parse(params.quizId);
  const action = z.enum(QUIZ_ACTIONS).safeParse(params.action);
  if (!action.success) throw new AppError("NOT_FOUND", "Unknown action", 404);
  return transitionQuiz(user.id, quizId, action.data);
});
