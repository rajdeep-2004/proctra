import { created, readJson, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { EventsInput } from "@/schemas/proctor";
import { ObjectIdString } from "@/schemas/quiz";
import { recordEvents } from "@/services/proctor-service";

// POST /api/v1/attempts/:attemptId/events — a batch (1–50) of neutral proctoring events for my attempt.
export const POST = withHandler(async (req, ctx: RouteContext<"/api/v1/attempts/[attemptId]/events">) => {
  const user = await requireUser("student");
  const attemptId = ObjectIdString.parse((await ctx.params).attemptId);
  const input = EventsInput.parse(await readJson(req));
  return created(await recordEvents(user.id, attemptId, input));
});
