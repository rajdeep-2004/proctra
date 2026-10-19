import { AppError, created, withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { ObjectIdString } from "@/schemas/quiz";
import { MAX_SNAPSHOT_BYTES, saveSnapshot } from "@/services/snapshot-service";

// POST /api/v1/attempts/:attemptId/snapshots — multipart: image (JPEG ≤ 500 KB), capturedAt (ISO).
export const POST = withHandler(async (req, ctx: RouteContext<"/api/v1/attempts/[attemptId]/snapshots">) => {
  const user = await requireUser("student");
  const attemptId = ObjectIdString.parse((await ctx.params).attemptId);
  // Reject oversized bodies before reading them.
  if (Number(req.headers.get("content-length") ?? 0) > MAX_SNAPSHOT_BYTES + 16 * 1024) {
    throw new AppError("PAYLOAD_TOO_LARGE", "Snapshot is too large", 413);
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new AppError("VALIDATION_ERROR", "Expected multipart form data", 400);
  }
  const image = form.get("image");
  if (!(image instanceof Blob)) throw new AppError("VALIDATION_ERROR", "Missing image", 400);
  const capturedAt = form.get("capturedAt");
  const bytes = Buffer.from(await image.arrayBuffer());
  return created(await saveSnapshot(user.id, attemptId, bytes, typeof capturedAt === "string" ? capturedAt : null));
});
