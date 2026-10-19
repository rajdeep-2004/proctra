import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { env } from "@/lib/env";
import { SignInInput } from "@/schemas/auth";
import { verifyCredentials } from "@/services/user-service";

// Config is a function so env() runs at request time, not while `next build` imports this file (D-028).
export const { handlers, auth, signIn, signOut } = NextAuth(() => ({
  ...authConfig,
  secret: env().AUTH_SECRET,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      // Return the user to sign in, or null for "invalid credentials" (Auth.js then shows a generic error).
      async authorize(raw) {
        const parsed = SignInInput.safeParse(raw);
        if (!parsed.success) return null;
        return verifyCredentials(parsed.data);
      },
    }),
  ],
}));
