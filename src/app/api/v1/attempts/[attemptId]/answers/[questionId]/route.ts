import { readJson, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { AnswerInput } from "@/schemas/attempt";
import { ObjectIdString } from "@/schemas/quiz";
import { saveAnswer } from "@/services/attempt-service";

// PUT /api/v1/attempts/:attemptId/answers/:questionId — autosave one answer (idempotent).
export const PUT = withHandler(async (req, ctx: RouteContext<"/api/v1/attempts/[attemptId]/answers/[questionId]">) => {
  const user = await requireUser("student");
  const params = await ctx.params;
  const attemptId = ObjectIdString.parse(params.attemptId);
  const questionId = ObjectIdString.parse(params.questionId);
  const input = AnswerInput.parse(await readJson(req));
  return saveAnswer(user.id, attemptId, questionId.toLowerCase(), input);
});
