import { z } from "zod";

// bcrypt only uses the first 72 bytes of a password, so longer ones are rejected rather than silently truncated.
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((p) => new TextEncoder().encode(p).length <= 72, "Password is too long (max 72 bytes)");

const email = z.email("Enter a valid email").trim().toLowerCase().max(254);

export const RegisterInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email,
  password,
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export const SignInInput = z.object({
  email,
  password: z.string().min(1, "Password is required").max(1000),
});
export type SignInInput = z.infer<typeof SignInInput>;
