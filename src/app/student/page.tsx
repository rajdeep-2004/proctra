import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard · Proctra" };

export default function StudentDashboard() {
  return (
    <section className="grid gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Available quizzes</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <Content />
      </Suspense>
    </section>
  );
}

async function Content() {
  await requirePageUser("student"); // every page checks for itself; the layout header alone isn't enough
  return <p className="text-muted-foreground">No quizzes yet. Published quizzes will appear here.</p>;
}
