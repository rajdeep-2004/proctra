import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/models/user";

export const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 h — longer than any exam, so it can't expire mid-attempt

/**
 * Settings shared by the full Auth.js setup (src/auth.ts) and the route guard (src/proxy.ts).
 * No providers and no DB imports here, so the proxy stays lightweight.
 */
export const authConfig = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    // Runs when the JWT is created (sign-in) and on every read. `user` is only present at sign-in.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    // Shapes what auth() returns from the token. Nothing here touches the database.
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;

export type SessionRole = Role;
