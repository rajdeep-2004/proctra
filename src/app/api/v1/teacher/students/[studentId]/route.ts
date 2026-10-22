import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getStudentForTeacher } from "@/services/results-service";

// GET /api/v1/teacher/students/:studentId — one student's attempts on this teacher's quizzes only (D-064).
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/teacher/students/[studentId]">) => {
  const user = await requireUser("teacher");
  const studentId = ObjectIdString.parse((await ctx.params).studentId);
  return getStudentForTeacher(user.id, studentId);
});
