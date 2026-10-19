import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requirePageUser } from "@/lib/session";
import type { Role } from "@/models/user";

const ROLE_LABEL: Record<Role, string> = { student: "Student", teacher: "Teacher" };

/** Header shared by both dashboards. The static part prerenders; the user part streams in. */
export function AppHeader({ role }: { role: Role }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href={`/${role}`} className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight">Proctra</span>
          <span className="text-sm text-muted-foreground">{ROLE_LABEL[role]}</span>
        </Link>
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
