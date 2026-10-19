import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePageUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard · Proctra" };

export default function TeacherDashboard() {
  return (
    <section className="grid gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Your quizzes</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <Content />
      </Suspense>
    </section>
  );
}

async function Content() {
  await requirePageUser("teacher");
  return <p className="text-muted-foreground">You haven&apos;t created any quizzes yet.</p>;
}
