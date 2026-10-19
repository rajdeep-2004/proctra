import type { QuizForTeacher } from "@/services/quiz-service";
import { fromLocalInput, toLocalInput } from "@/lib/datetime";

// Form state keeps numbers as strings so half-typed values like "-" or "0." don't get mangled.
export type QuestionState = { key: string; id: string | null; text: string; options: string[]; correctIndex: number | null };
export type EditorState = {
  title: string;
  instructions: string;
  startsAt: string; // datetime-local value, viewer's local time
  endsAt: string;
  marking: { correct: string; incorrect: string; unanswered: string };
  resultsReleaseAt: string; // "" = show results right after submission
  questions: QuestionState[];
};

export const newKey = () => crypto.randomUUID();

export const blankQuestion = (): QuestionState => ({ key: newKey(), id: null, text: "", options: ["", ""], correctIndex: null });

export function stateFromQuiz(q: QuizForTeacher): EditorState {
  return {
    title: q.title,
    instructions: q.instructions,
    startsAt: toLocalInput(q.startsAt),
    endsAt: toLocalInput(q.endsAt),
    marking: { correct: String(q.marking.correct), incorrect: String(q.marking.incorrect), unanswered: String(q.marking.unanswered) },
    resultsReleaseAt: toLocalInput(q.resultsReleaseAt),
    questions: q.questions.map((x) => ({ key: x.id, id: x.id, text: x.text, options: [...x.options], correctIndex: x.correctIndex })),
  };
}

/** Defaults for a new quiz: a 1-hour exam starting at the next full hour. */
export function newQuizState(): EditorState {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 3600e3);
  return {
    title: "",
    instructions: "",
    startsAt: toLocalInput(start.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    marking: { correct: "1", incorrect: "0", unanswered: "0" },
    resultsReleaseAt: "",
    questions: [blankQuestion()],
  };
}

/** Exam length shown in the editor, e.g. "1 h 30 min"; null if the times are missing or invalid. */
export function describeSlot(startsAtLocal: string, endsAtLocal: string): { text: string; valid: boolean } | null {
  if (!startsAtLocal || !endsAtLocal) return null;
  const minutes = Math.round((new Date(endsAtLocal).getTime() - new Date(startsAtLocal).getTime()) / 60_000);
  if (!Number.isFinite(minutes)) return null;
  if (minutes <= 0) return { text: "ends before it starts", valid: false };
  const h = Math.floor(minutes / 60), m = minutes % 60;
  const text = [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
  return { text, valid: minutes >= 1 && minutes <= 300 };
}

const num = (s: string) => (s.trim() === "" ? Number.NaN : Number(s));

/** Editor state → API body (QuizInput). Invalid numbers become null so the server reports them per field. */
export function toPayload(s: EditorState) {
  const n = (v: string) => (Number.isFinite(num(v)) ? num(v) : null);
  return {
    title: s.title,
    instructions: s.instructions,
    startsAt: fromLocalInput(s.startsAt),
    endsAt: fromLocalInput(s.endsAt),
    marking: { correct: n(s.marking.correct), incorrect: n(s.marking.incorrect), unanswered: n(s.marking.unanswered) },
    resultsReleaseAt: fromLocalInput(s.resultsReleaseAt),
    questions: s.questions.map((q) => ({ id: q.id, text: q.text, options: q.options, correctIndex: q.correctIndex ?? -1 })),
  };
}
