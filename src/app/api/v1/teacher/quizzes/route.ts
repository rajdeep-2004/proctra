import { created, readJson, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { QuizInput } from "@/schemas/quiz";
import { createQuiz, listTeacherQuizzes } from "@/services/quiz-service";

// GET /api/v1/teacher/quizzes — my quizzes, newest first.
export const GET = withHandler(async () => {
  const user = await requireUser("teacher");
  return listTeacherQuizzes(user.id);
});

// POST /api/v1/teacher/quizzes — create a draft.
export const POST = withHandler(async (req) => {
  const user = await requireUser("teacher");
  const input = QuizInput.parse(await readJson(req));
  return created(await createQuiz(user.id, input));
});
