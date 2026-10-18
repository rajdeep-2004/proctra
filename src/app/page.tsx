import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Proctra</h1>
      <p className="text-lg text-muted-foreground">
        Timed MCQ exams with a focused exam window and periodic camera snapshots.
      </p>
      {/* Sign-in page arrives in phase 02. */}
      <Button size="lg" disabled>
        Sign in
      </Button>
    </main>
  );
}
