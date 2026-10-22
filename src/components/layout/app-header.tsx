import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requirePageUser } from "@/lib/session";
import type { Role } from "@/models/user";

// The "Proctra" logo already links to the dashboard, so the nav only lists the other pages.
const NAV: Record<Role, { href: string; label: string }[]> = {
  student: [{ href: "/student/profile", label: "Profile" }],
  teacher: [],
};

/** Header shared by both dashboards. The static part prerenders; the user part streams in. */
export function AppHeader({ role }: { role: Role }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${role}`} className="text-lg font-semibold tracking-tight">Proctra</Link>
          {NAV[role].length > 0 && (
            <nav aria-label="Main" className="flex gap-4 text-sm">
              {NAV[role].map((l) => (
                <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground">{l.label}</Link>
              ))}
            </nav>
          )}
        </div>
        <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded-md bg-muted" aria-hidden />}>
          <UserMenu role={role} />
        </Suspense>
      </div>
    </header>
  );
}

// Reads the session, so it lives inside <Suspense>. Also enforces the role for the whole area.
async function UserMenu({ role }: { role: Role }) {
  const user = await requirePageUser(role);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm" data-testid="user-name">
        {user.name}
      </span>
      <SignOutButton />
    </div>
  );
}
