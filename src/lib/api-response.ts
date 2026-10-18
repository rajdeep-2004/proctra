import "server-only";
import { ZodError } from "zod";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "RESULTS_NOT_RELEASED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "QUIZ_NOT_AVAILABLE"
  | "ALREADY_ATTEMPTED"
  | "ATTEMPT_CLOSED"
  | "QUIZ_LOCKED"
  | "INVALID_STATE"
  | "PAYLOAD_TOO_LARGE"
  | "INTERNAL"
  | "UPSTREAM_FAILED";

/** An expected error that services throw; `withHandler` turns it into the standard error JSON. */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

function errorJson(code: ErrorCode, message: string, status: number, details?: unknown) {
  return Response.json({ error: { code, message, details: details ?? {} } }, { status });
}

/** Success response in the standard `{ data }` shape. */
export function ok(data: unknown, status = 200) {
  return Response.json({ data }, { status });
}

export function created(data: unknown) {
  return ok(data, 201);
}

/**
 * Wraps a route handler: whatever it returns becomes `{ data }` (or is passed through if it is
 * already a Response), and any thrown error becomes the standard error shape.
 */
export function withHandler<Ctx>(handler: (req: Request, ctx: Ctx) => Promise<unknown>) {
  return async (req: Request, ctx: Ctx): Promise<Response> => {
    try {
      const result = await handler(req, ctx);
      return result instanceof Response ? result : ok(result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorJson(error.code, error.message, error.status, error.details);
      }
      if (error instanceof ZodError) {
        const issues = error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
        return errorJson("VALIDATION_ERROR", "Invalid input", 400, { issues });
      }
      // Unexpected: log for Vercel logs (no request body — it may hold passwords), return a generic 500.
      console.error(`[api] ${req.method} ${new URL(req.url).pathname} failed:`, error);
      return errorJson("INTERNAL", "Something went wrong", 500);
    }
  };
}
