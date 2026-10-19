import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getQuizForStudent } from "@/services/quiz-service";

// GET /api/v1/quizzes/:quizId — pre-start details (instructions, timing, marking). No questions.
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/quizzes/[quizId]">) => {
  const user = await requireUser("student");
  const quizId = ObjectIdString.parse((await ctx.params).quizId);
  return getQuizForStudent(user.id, quizId);
});
