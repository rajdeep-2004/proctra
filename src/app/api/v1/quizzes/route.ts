import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { listQuizzesForStudent } from "@/services/quiz-service";

// GET /api/v1/quizzes — published quizzes for the student dashboard (no questions).
export const GET = withHandler(async () => {
  const user = await requireUser("student");
  return listQuizzesForStudent(user.id);
});
