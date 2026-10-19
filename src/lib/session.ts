import "server-only";
import { auth } from "@/auth";
import { AppError } from "@/lib/api-response";
import type { Role } from "@/models/user";

export type SessionUser = { id: string; name: string; email: string; role: Role };

/** The signed-in user from the session cookie, or null. Reads the request, so callers in
 * Server Components must sit inside <Suspense> (D-026). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const u = session?.user;
  if (!u?.id || !u.role) return null;
  return { id: u.id, name: u.name ?? "", email: u.email ?? "", role: u.role };
}

/**
 * The ONLY way API route handlers learn who is calling. Throws 401 when signed out and
 * 403 when the role doesn't match. This — not the proxy redirects — is the security boundary.
 */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Sign in to continue", 401);
  if (role && user.role !== role) throw new AppError("FORBIDDEN", "You don't have access to this", 403);
  return user;
}
