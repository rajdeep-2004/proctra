import { z } from "zod";

// Shared by API handlers and the editor form. Limits mirror src/models/quiz.ts (kept in sync by hand;
// this file can't import the model because it also runs in the browser).
const L = {
  title: 200, instructions: 5000, questionText: 2000, optionText: 500,
  minOptions: 2, maxOptions: 6, maxQuestions: 200, minDuration: 1, maxDuration: 300, markAbs: 100,
} as const;

export const ObjectIdString = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id");

const mark = z.number().finite().min(-L.markAbs).max(L.markAbs);
const isoDate = z.iso.datetime({ offset: true }).transform((s) => new Date(s));

export const QuestionInput = z
  .object({
    id: ObjectIdString.nullable(), // null = new question; existing ids are kept so answer keys stay valid
    text: z.string().trim().min(1, "Question text is required").max(L.questionText),
    options: z
      .array(z.string().trim().min(1, "Option can't be empty").max(L.optionText))
      .min(L.minOptions, `At least ${L.minOptions} options`)
      .max(L.maxOptions, `At most ${L.maxOptions} options`),
    correctIndex: z.number().int().min(0, "Pick the correct option"),
  })
  .refine((q) => q.correctIndex < q.options.length, { path: ["correctIndex"], message: "Pick the correct option" });

export const QuizInput = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(L.title),
    instructions: z.string().trim().max(L.instructions).default(""),
    startsAt: isoDate,
    endsAt: isoDate,
    durationMinutes: z.number().int().min(L.minDuration).max(L.maxDuration),
    marking: z.object({ correct: mark, incorrect: mark, unanswered: mark }),
    resultsReleaseAt: isoDate.nullable().default(null),
    questions: z.array(QuestionInput).max(L.maxQuestions).default([]),
  })
  .refine((q) => q.endsAt > q.startsAt, { path: ["endsAt"], message: "End must be after start" })
  .refine(
    (q) => new Set(q.questions.map((x) => x.id).filter(Boolean)).size === q.questions.filter((x) => x.id).length,
    { path: ["questions"], message: "Duplicate question ids" },
  );

export type QuizInput = z.infer<typeof QuizInput>;
export type QuizInputRaw = z.input<typeof QuizInput>;
export type QuestionInput = z.infer<typeof QuestionInput>;
