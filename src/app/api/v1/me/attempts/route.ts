import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { listMyAttempts } from "@/services/attempt-service";

// GET /api/v1/me/attempts — my attempt history (profile), newest first.
export const GET = withHandler(async () => {
  const user = await requireUser("student");
  return listMyAttempts(user.id);
});
