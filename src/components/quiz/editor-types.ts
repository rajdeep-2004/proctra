import type { QuizForTeacher } from "@/services/quiz-service";
import { fromLocalInput, toLocalInput } from "@/lib/datetime";

// Form state keeps numbers as strings so half-typed values like "-" or "0." don't get mangled.
export type QuestionState = { key: string; id: string | null; text: string; options: string[]; correctIndex: number | null };
export type EditorState = {
  title: string;
  instructions: string;
  startsAt: string; // datetime-local value, viewer's local time
  endsAt: string;
  durationMinutes: string;
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
    durationMinutes: String(q.durationMinutes),
    marking: { correct: String(q.marking.correct), incorrect: String(q.marking.incorrect), unanswered: String(q.marking.unanswered) },
    resultsReleaseAt: toLocalInput(q.resultsReleaseAt),
    questions: q.questions.map((x) => ({ key: x.id, id: x.id, text: x.text, options: [...x.options], correctIndex: x.correctIndex })),
  };
}

/** Defaults for a new quiz: starts at the next full hour, open for 2 hours, 30 minutes long. */
export function newQuizState(): EditorState {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 2 * 3600e3);
  return {
    title: "",
    instructions: "",
    startsAt: toLocalInput(start.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    durationMinutes: "30",
    marking: { correct: "1", incorrect: "0", unanswered: "0" },
    resultsReleaseAt: "",
    questions: [blankQuestion()],
  };
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
    durationMinutes: n(s.durationMinutes),
    marking: { correct: n(s.marking.correct), incorrect: n(s.marking.incorrect), unanswered: n(s.marking.unanswered) },
    resultsReleaseAt: fromLocalInput(s.resultsReleaseAt),
    questions: s.questions.map((q) => ({ id: q.id, text: q.text, options: q.options, correctIndex: q.correctIndex ?? -1 })),
  };
}
