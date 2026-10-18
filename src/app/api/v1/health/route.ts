import { connection } from "next/server";
import { pingDB } from "@/lib/db";
import { withHandler } from "@/lib/api-response";

// GET /api/v1/health — liveness + DB check (used by Electron's offline screen). Public.
export const GET = withHandler(async () => {
  await connection(); // always run at request time, never prerendered (D-026)
  const dbUp = await pingDB();
  return Response.json(
    { data: { ok: dbUp, db: dbUp ? "up" : "down" } },
    { status: dbUp ? 200 : 503 },
  );
});
