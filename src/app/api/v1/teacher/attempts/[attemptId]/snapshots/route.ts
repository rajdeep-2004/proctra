import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { getSnapshotGallery } from "@/services/results-service";

// GET /api/v1/teacher/attempts/:attemptId/snapshots — signed, 10-minute links to the attempt's private snapshots (owner only).
export const GET = withHandler(async (_req, ctx: RouteContext<"/api/v1/teacher/attempts/[attemptId]/snapshots">) => {
  const user = await requireUser("teacher");
  const attemptId = ObjectIdString.parse((await ctx.params).attemptId);
  return getSnapshotGallery(user.id, attemptId);
});
