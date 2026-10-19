import { readJson, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString, QuizInput } from "@/schemas/quiz";
import { getTeacherQuiz, updateQuiz } from "@/services/quiz-service";

type Ctx = RouteContext<"/api/v1/teacher/quizzes/[quizId]">;

// GET /api/v1/teacher/quizzes/:quizId — full quiz incl. correct answers (owner only).
export const GET = withHandler(async (_req, ctx: Ctx) => {
  const user = await requireUser("teacher");
  const quizId = ObjectIdString.parse((await ctx.params).quizId);
  return getTeacherQuiz(user.id, quizId);
});

// PUT /api/v1/teacher/quizzes/:quizId — save the whole editor state.
export const PUT = withHandler(async (req, ctx: Ctx) => {
  const user = await requireUser("teacher");
  const quizId = ObjectIdString.parse((await ctx.params).quizId);
  const input = QuizInput.parse(await readJson(req));
  return updateQuiz(user.id, quizId, input);
});
