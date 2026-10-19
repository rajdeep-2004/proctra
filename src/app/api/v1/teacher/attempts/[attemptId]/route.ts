import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getAttemptForTeacher } from "@/services/results-service";

// GET /api/v1/teacher/attempts/:attemptId — one submission: answers vs correct, neutral event timeline.
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/teacher/attempts/[attemptId]">) => {
  const user = await requireUser("teacher");
  const attemptId = ObjectIdString.parse((await ctx.params).attemptId);
  return getAttemptForTeacher(user.id, attemptId);
});
