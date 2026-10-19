import { withHandler } from "@/lib/api-response";
import { requireUser } from "@/lib/session";

// GET /api/v1/me — the signed-in user (any role).
export const GET = withHandler(async () => requireUser());
