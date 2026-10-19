import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getAttemptForStudent } from "@/services/attempt-service";

// GET /api/v1/attempts/:attemptId — exam state while active, result after (own attempts only).
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/attempts/[attemptId]">) => {
  const user = await requireUser("student");
  const attemptId = ObjectIdString.parse((await ctx.params).attemptId);
  return getAttemptForStudent(user.id, attemptId);
});
