import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import { env } from "@/lib/env";

// Light Auth.js instance: decodes the session cookie only — no providers, no database (D-033).
const { auth } = NextAuth(() => ({ ...authConfig, secret: env().AUTH_SECRET }));

const SIGNED_OUT_ONLY = ["/", "/sign-in", "/sign-up"];
const AREAS = { "/student": "student", "/teacher": "teacher" } as const;

/**
 * Optimistic redirects for a smooth UX. NOT the security boundary: pages re-check with
 * requirePageUser() and API handlers with requireUser() (architecture §8).
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const user = (await auth())?.user; // reads + decrypts the session cookie of this request
  const home = user?.role === "teacher" ? "/teacher" : "/student";
  const to = (p: string) => NextResponse.redirect(new URL(p, req.nextUrl));

  if (SIGNED_OUT_ONLY.includes(path)) {
    return user ? to(home) : NextResponse.next();
  }

  const isExam = path === "/exam" || path.startsWith("/exam/");
  const area = (Object.keys(AREAS) as (keyof typeof AREAS)[]).find((a) => path === a || path.startsWith(`${a}/`));
  if (!area && !isExam) return NextResponse.next();

  if (!user) return to("/sign-in");
  if (area && user.role !== AREAS[area]) return to(home); // e.g. a student opening /teacher
  if (isExam && user.role !== "student") return to(home);
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/student/:path*", "/teacher/:path*", "/exam/:path*"],
};
