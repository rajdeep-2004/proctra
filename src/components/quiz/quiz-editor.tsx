"use client";

import { Lock, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, issuesByPath } from "@/lib/api-client";
import { useIsClient } from "@/lib/use-is-client";
import type { QuizForTeacher } from "@/services/quiz-service";
import { blankQuestion, newQuizState, stateFromQuiz, toPayload, type EditorState, type QuestionState } from "@/components/quiz/editor-types";
import { QuestionCard } from "@/components/quiz/question-card";
import { StatusBadge } from "@/components/quiz/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Wrapper: the editor needs the browser's time zone, so it only renders in the browser. */
export function QuizEditor({ initial }: { initial: QuizForTeacher | null }) {
  const isClient = useIsClient();
  if (!isClient) return <div className="h-96 animate-pulse rounded-xl bg-muted" aria-label="Loading editor" />;
  return <Editor initial={initial} />;
}

type Meta = { id: string | null; status: QuizForTeacher["status"]; locked: boolean; attemptCount: number };

function Editor({ initial }: { initial: QuizForTeacher | null }) {
  const router = useRouter();
  const [form, setForm] = useState<EditorState>(() => (initial ? stateFromQuiz(initial) : newQuizState()));
  const [savedJson, setSavedJson] = useState(() => (initial ? JSON.stringify(stateFromQuiz(initial)) : ""));
  const [meta, setMeta] = useState<Meta>({
    id: initial?.id ?? null, status: initial?.status ?? "draft", locked: initial?.locked ?? false, attemptCount: initial?.attemptCount ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== savedJson, [form, savedJson]);
  const archived = meta.status === "archived";
  const lockedFields = archived || meta.locked; // questions, marking, start, duration
  const allFields = archived;

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = <K extends keyof EditorState>(key: K, value: EditorState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setQuestion = (i: number, q: QuestionState) => setForm((f) => ({ ...f, questions: f.questions.map((x, j) => (j === i ? q : x)) }));
  const moveQuestion = (i: number, delta: -1 | 1) =>
    setForm((f) => {
      const qs = [...f.questions];
      [qs[i], qs[i + delta]] = [qs[i + delta], qs[i]];
      return { ...f, questions: qs };
    });

  async function save() {
    setBusy(true);
    setBanner(null);
    const payload = toPayload(form);
    const res = meta.id
      ? await api<QuizForTeacher>("PUT", `/api/v1/teacher/quizzes/${meta.id}`, payload)
      : await api<QuizForTeacher>("POST", "/api/v1/teacher/quizzes", payload);
    setBusy(false);
    if (!res.ok) {
      const byPath = issuesByPath(res.error);
      setErrors(byPath);
      const count = Object.keys(byPath).length;
      setBanner({ kind: "error", text: count ? `Fix ${count} problem${count > 1 ? "s" : ""} below, then save again.` : res.error.message });
      return;
    }
    // Take the server's version (new questions now have ids, so later saves keep them).
    const next = stateFromQuiz(res.data);
    setForm(next);
    setSavedJson(JSON.stringify(next));
    setErrors({});
    setMeta({ id: res.data.id, status: res.data.status, locked: res.data.locked, attemptCount: res.data.attemptCount });
    setBanner({ kind: "ok", text: "Saved." });
    if (!meta.id) router.replace(`/teacher/quizzes/${res.data.id}`);
  }

  async function transition(action: "publish" | "unpublish" | "archive") {
    if (!meta.id) return;
    setBusy(true);
    setBanner(null);
    const res = await api<{ status: Meta["status"] }>("POST", `/api/v1/teacher/quizzes/${meta.id}/${action}`);
    setBusy(false);
    if (!res.ok) return setBanner({ kind: "error", text: res.error.message });
    setMeta((m) => ({ ...m, status: res.data.status }));
    setBanner({ kind: "ok", text: { publish: "Published — students can now see this quiz.", unpublish: "Unpublished — hidden from students.", archive: "Archived." }[action] });
    router.refresh();
  }

  const fieldError = (path: string) => errors[path] && <p className="text-sm text-destructive">{errors[path]}</p>;
  const generalErrors = Object.entries(errors).filter(([p]) => p === "questions" || p === "" || p === "teacherId");

  return (
    <div className="grid gap-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="text-sm text-muted-foreground hover:text-foreground">← All quizzes</Link>
          <StatusBadge status={meta.status} />
          {dirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {!archived && (
            <Button onClick={save} disabled={busy || (!dirty && Boolean(meta.id))}>
              {busy ? "Saving…" : meta.id ? "Save" : "Create draft"}
            </Button>
          )}
          {meta.id && meta.status === "draft" && (
            <Button variant="outline" onClick={() => transition("publish")} disabled={busy || dirty} title={dirty ? "Save first" : undefined}>
              Publish
            </Button>
          )}
          {meta.id && meta.status === "published" && (
            <Button variant="outline" onClick={() => transition("unpublish")} disabled={busy || dirty}>Unpublish</Button>
          )}
          {meta.id && !archived && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" disabled={busy}>Archive</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive this quiz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Archived quizzes are hidden from students and can&apos;t be edited or published again. Results stay available.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => transition("archive")}>Archive</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {banner && (
        <Alert variant={banner.kind === "error" ? "destructive" : "default"} role={banner.kind === "error" ? "alert" : "status"}>
          <AlertDescription>{banner.text}</AlertDescription>
        </Alert>
      )}
      {generalErrors.map(([p, m]) => (
        <Alert key={p} variant="destructive"><AlertDescription>{m}</AlertDescription></Alert>
      ))}
      {meta.locked && !archived && (
        <Alert>
          <Lock />
          <AlertTitle>Students have started this quiz</AlertTitle>
          <AlertDescription>Questions, marking, start time and duration are locked. You can still edit the title, instructions, end time and result release time.</AlertDescription>
        </Alert>
      )}
      {archived && (
        <Alert><AlertDescription>This quiz is archived and read-only.</AlertDescription></Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} disabled={allFields} aria-invalid={Boolean(errors.title)} onChange={(e) => set("title", e.target.value)} placeholder="e.g. DBMS Quiz 1" />
            {fieldError("title")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="instructions">Instructions for students</Label>
            <Textarea id="instructions" value={form.instructions} disabled={allFields} rows={4} onChange={(e) => set("instructions", e.target.value)} />
            {fieldError("instructions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="startsAt">Opens at</Label>
            <Input id="startsAt" type="datetime-local" value={form.startsAt} disabled={lockedFields} aria-invalid={Boolean(errors.startsAt)} onChange={(e) => set("startsAt", e.target.value)} />
            {fieldError("startsAt")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endsAt">Closes at</Label>
            <Input id="endsAt" type="datetime-local" value={form.endsAt} disabled={allFields} aria-invalid={Boolean(errors.endsAt)} onChange={(e) => set("endsAt", e.target.value)} />
            {fieldError("endsAt")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" inputMode="numeric" min={1} max={300} value={form.durationMinutes} disabled={lockedFields} aria-invalid={Boolean(errors.durationMinutes)} onChange={(e) => set("durationMinutes", e.target.value)} />
            {fieldError("durationMinutes")}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="release">Show results to students at (optional)</Label>
            <div className="flex gap-2">
              <Input id="release" type="datetime-local" value={form.resultsReleaseAt} disabled={allFields} onChange={(e) => set("resultsReleaseAt", e.target.value)} />
              {form.resultsReleaseAt && !allFields && (
                <Button type="button" variant="ghost" onClick={() => set("resultsReleaseAt", "")}>Clear</Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {form.resultsReleaseAt ? "Marks stay hidden until this time." : "Empty: students see marks right after submitting."}
            </p>
            {fieldError("resultsReleaseAt")}
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Times are in your local time zone. A student who starts late gets less time: their attempt always ends at the closing time.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Marking</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {(["correct", "incorrect", "unanswered"] as const).map((k) => (
            <div key={k} className="grid gap-2">
              <Label htmlFor={`mark-${k}`}>{{ correct: "Correct answer", incorrect: "Wrong answer", unanswered: "Unanswered" }[k]}</Label>
              <Input id={`mark-${k}`} type="number" step="0.25" min={-100} max={100} value={form.marking[k]} disabled={lockedFields}
                aria-invalid={Boolean(errors[`marking.${k}`])} onChange={(e) => set("marking", { ...form.marking, [k]: e.target.value })} />
              {fieldError(`marking.${k}`)}
            </div>
          ))}
          <p className="text-sm text-muted-foreground sm:col-span-3">Use negative numbers for negative marking, e.g. −1 for a wrong answer.</p>
        </CardContent>
      </Card>

      <section className="grid gap-4" aria-labelledby="questions-heading">
        <h2 id="questions-heading" className="text-lg font-semibold">Questions ({form.questions.length})</h2>
        {form.questions.map((q, i) => (
          <QuestionCard key={q.key} index={i} total={form.questions.length} question={q} errors={errors} disabled={lockedFields}
            onChange={(next) => setQuestion(i, next)} onMove={(d) => moveQuestion(i, d)}
            onRemove={() => setForm((f) => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }))} />
        ))}
        {!lockedFields && (
          <div>
            <Button type="button" variant="outline" onClick={() => set("questions", [...form.questions, blankQuestion()])}>
              <Plus /> Add question
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
