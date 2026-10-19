import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { submitAttempt } from "@/services/attempt-service";

// POST /api/v1/attempts/:attemptId/submit — manual submit or client auto-submit at 0 (idempotent).
export const POST = withHandler(async (_req, ctx: RouteContext<"/api/v1/attempts/[attemptId]/submit">) => {
  const user = await requireUser("student");
  const attemptId = ObjectIdString.parse((await ctx.params).attemptId);
  return submitAttempt(user.id, attemptId);
});
