import "server-only";
import { z } from "zod";

/**
 * Server environment variables. Every server-side env read goes through `env()`.
 * Add new keys here AND to `.env.example` in the phase that first needs them.
 */
const EnvSchema = z.object({
  MONGODB_URI: z
    .string()
    .min(1, "is required")
    .refine((v) => v.startsWith("mongodb://") || v.startsWith("mongodb+srv://"), {
      message: "must start with mongodb:// or mongodb+srv://",
    }),
  // Signs/encrypts the session cookie. Generate with: openssl rand -base64 32
  AUTH_SECRET: z.string().min(32, "must be at least 32 characters (openssl rand -base64 32)"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

/**
 * Validated env, parsed once on first use. Lazy (not at import time) so `next build`
 * doesn't crash on machines without a .env; the first request fails loudly instead.
 */
export function env(): Env {
  if (cached) return cached;
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    // Names only — never print values, they are secrets.
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables (check .env):\n${problems}`);
  }
  cached = result.data;
  return cached;
}
