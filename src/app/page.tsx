import Link from "next/link";
import { Button } from "@/components/ui/button";

// Signed-out landing page. Signed-in users never see it: the proxy sends them to their dashboard.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Proctra</h1>
      <p className="text-lg text-muted-foreground">
        Timed MCQ exams with a focused exam window and periodic camera snapshots.
      </p>
      <div className="flex gap-3">
        <Button size="lg" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/sign-up">Create student account</Link>
        </Button>
      </div>
    </main>
  );
}
