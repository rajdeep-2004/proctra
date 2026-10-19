import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

/** A form (not an onClick) so sign-out works through a server action with Next's built-in CSRF protection. */
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline" size="sm">
        Sign out
      </Button>
    </form>
  );
}
