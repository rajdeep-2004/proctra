import "server-only";
import mongoose, { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { Quiz, type QuizDoc, type QuizStatus } from "@/models/quiz";
import type { QuizInput } from "@/schemas/quiz";

// ---------- shapes returned to the API ----------

export type QuestionForTeacher = { id: string; text: string; options: string[]; correctIndex: number };

export type QuizForTeacher = {
  id: string;
  title: string;
  instructions: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  marking: { correct: number; incorrect: number; unanswered: number };
  resultsReleaseAt: string | null;
  status: QuizStatus;
  locked: boolean;
  attemptCount: number;
  questions: QuestionForTeacher[];
  updatedAt: string;
};

export type QuizSummaryForTeacher = Omit<QuizForTeacher, "questions" | "instructions" | "marking"> & {
  questionCount: number;
};

type LeanQuiz = QuizDoc;

function toTeacherQuiz(q: LeanQuiz, attemptCount: number): QuizForTeacher {
  return {
    id: q._id.toString(),
    title: q.title,
    instructions: q.instructions ?? "",
    startsAt: q.startsAt.toISOString(),
    endsAt: q.endsAt.toISOString(),
    durationMinutes: q.durationMinutes,
    marking: { correct: q.marking.correct, incorrect: q.marking.incorrect, unanswered: q.marking.unanswered },
    resultsReleaseAt: q.resultsReleaseAt ? q.resultsReleaseAt.toISOString() : null,
    status: q.status,
    locked: q.locked,
    attemptCount,
    questions: q.questions.map((x) => ({
      id: x._id.toString(),
      text: x.text,
      options: [...x.options],
      correctIndex: x.correctIndex,
    })),
    updatedAt: q.updatedAt.toISOString(),
  };
}

// ---------- helpers ----------

/**
 * Attempt counts per quiz. Reads the `attempts` collection directly so this works before the
 * Attempt model exists (phase 04); an empty/missing collection just gives 0.
 */
async function attemptCounts(quizIds: Types.ObjectId[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (quizIds.length === 0) return counts;
  const rows = await mongoose.connection
    .db!.collection("attempts")
    .aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: { quizId: { $in: quizIds } } },
      { $group: { _id: "$quizId", n: { $sum: 1 } } },
    ])
    .toArray();
  for (const r of rows) counts.set(r._id.toString(), r.n);
  return counts;
}

/** Loads a quiz and checks the teacher owns it (404 if missing, 403 if someone else's). */
async function loadOwned(teacherId: string, quizId: string): Promise<LeanQuiz> {
  const quiz = await Quiz.findById(quizId).lean<LeanQuiz>();
  if (!quiz) throw new AppError("NOT_FOUND", "Quiz not found", 404);
  if (quiz.teacherId.toString() !== teacherId) throw new AppError("FORBIDDEN", "This quiz belongs to another teacher", 403);
  return quiz;
}

/**
 * Turns validated input questions into stored questions. Existing ids are kept (so attempts' answer
 * keys stay valid); `id: null` gets a fresh id; an id that isn't in this quiz is rejected.
 */
function buildQuestions(input: QuizInput["questions"], existing: LeanQuiz["questions"] = []) {
  const known = new Set(existing.map((q) => q._id.toString()));
  return input.map((q, i) => {
    if (q.id && !known.has(q.id)) {
      throw new AppError("VALIDATION_ERROR", "Unknown question id", 400, {
        issues: [{ path: `questions.${i}.id`, message: "This question doesn't belong to the quiz" }],
      });
    }
    return { _id: q.id ? new Types.ObjectId(q.id) : new Types.ObjectId(), text: q.text, options: q.options, correctIndex: q.correctIndex };
  });
}

/** Full-document validation in memory (runs the Mongoose validators with correct `this`). */
async function assertValidDocument(fields: Record<string, unknown>) {
  try {
    await new Quiz(fields).validate();
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const issues = Object.values(error.errors).map((e) => ({ path: e.path, message: e.message }));
      throw new AppError("VALIDATION_ERROR", "Invalid quiz", 400, { issues });
    }
    throw error;
  }
}

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// ---------- public API ----------

export async function listTeacherQuizzes(teacherId: string): Promise<QuizSummaryForTeacher[]> {
  await connectDB();
  const quizzes = await Quiz.find({ teacherId }).sort({ updatedAt: -1 }).limit(500).lean<LeanQuiz[]>();
  const counts = await attemptCounts(quizzes.map((q) => q._id));
  return quizzes.map((q) => {
    const full = toTeacherQuiz(q, counts.get(q._id.toString()) ?? 0);
    return {
      id: full.id, title: full.title, startsAt: full.startsAt, endsAt: full.endsAt,
      durationMinutes: full.durationMinutes, resultsReleaseAt: full.resultsReleaseAt, status: full.status,
      locked: full.locked, attemptCount: full.attemptCount, updatedAt: full.updatedAt,
      questionCount: full.questions.length,
    };
  });
}

export async function getTeacherQuiz(teacherId: string, quizId: string): Promise<QuizForTeacher> {
  await connectDB();
  const quiz = await loadOwned(teacherId, quizId);
  const counts = await attemptCounts([quiz._id]);
  return toTeacherQuiz(quiz, counts.get(quizId) ?? 0);
}

export async function createQuiz(teacherId: string, input: QuizInput): Promise<QuizForTeacher> {
  await connectDB();
  // On create every question is new, whatever ids the client sent.
  const questions = buildQuestions(input.questions.map((q) => ({ ...q, id: null })));
  const fields = { ...input, questions, teacherId: new Types.ObjectId(teacherId), status: "draft" as const, locked: false };
  await assertValidDocument(fields);
  const created = await Quiz.create(fields);
  return toTeacherQuiz(created.toObject<LeanQuiz>(), 0);
}

/**
 * Saves the whole editor state (D-022). Once `locked` (first attempt started), only title,
 * instructions, endsAt and resultsReleaseAt may change; anything else → 409 QUIZ_LOCKED.
 */
export async function updateQuiz(teacherId: string, quizId: string, input: QuizInput): Promise<QuizForTeacher> {
  await connectDB();
  const current = await loadOwned(teacherId, quizId);
  if (current.status === "archived") throw new AppError("INVALID_STATE", "Archived quizzes can't be edited", 409);

  const questions = buildQuestions(input.questions, current.questions);
  const always = {
    title: input.title,
    instructions: input.instructions,
    endsAt: input.endsAt,
    resultsReleaseAt: input.resultsReleaseAt,
  };
  const lockable = {
    startsAt: input.startsAt,
    durationMinutes: input.durationMinutes,
    marking: input.marking,
    questions,
  };
  await assertValidDocument({ ...current, ...always, ...lockable });

  const changesLockedFields = () =>
    current.startsAt.getTime() !== input.startsAt.getTime() ||
    current.durationMinutes !== input.durationMinutes ||
    !sameJson(
      { c: current.marking.correct, i: current.marking.incorrect, u: current.marking.unanswered },
      { c: input.marking.correct, i: input.marking.incorrect, u: input.marking.unanswered },
    ) ||
    !sameJson(
      current.questions.map((q) => [q._id.toString(), q.text, [...q.options], q.correctIndex]),
      questions.map((q) => [q._id.toString(), q.text, q.options, q.correctIndex]),
    );

  const lockedError = () =>
    new AppError("QUIZ_LOCKED", "Students have started this quiz, so its questions, marking and timing can't change", 409);

  if (current.locked) {
    if (changesLockedFields()) throw lockedError();
    const updated = await Quiz.findOneAndUpdate(
      { _id: quizId, teacherId, status: { $ne: "archived" } },
      { $set: always },
      { returnDocument: "after" },
    ).lean<LeanQuiz>();
    if (!updated) throw new AppError("INVALID_STATE", "Quiz changed while saving; reload and try again", 409);
    return getTeacherQuiz(teacherId, quizId);
  }

  // Conditional on locked:false, so a student starting at this exact moment can't race past the lock.
  const updated = await Quiz.findOneAndUpdate(
    { _id: quizId, teacherId, locked: false, status: { $ne: "archived" } },
    { $set: { ...always, ...lockable } },
    { returnDocument: "after" },
  ).lean<LeanQuiz>();
  if (!updated) {
    const fresh = await loadOwned(teacherId, quizId);
    if (fresh.locked) throw lockedError();
    throw new AppError("INVALID_STATE", "Archived quizzes can't be edited", 409);
  }
  return getTeacherQuiz(teacherId, quizId);
}

export const QUIZ_ACTIONS = ["publish", "unpublish", "archive"] as const;
export type QuizAction = (typeof QUIZ_ACTIONS)[number];

/** draft ⇄ published → archived (archived is final). Each move is one conditional update. */
export async function transitionQuiz(teacherId: string, quizId: string, action: QuizAction) {
  await connectDB();
  const quiz = await loadOwned(teacherId, quizId);
  const now = new Date();

  const rules: Record<QuizAction, { from: QuizStatus[]; to: QuizStatus; extra?: Record<string, unknown> }> = {
    // Publishing needs at least one question and a window that hasn't already ended.
    publish: { from: ["draft"], to: "published", extra: { "questions.0": { $exists: true }, endsAt: { $gt: now } } },
    unpublish: { from: ["published"], to: "draft" },
    archive: { from: ["draft", "published"], to: "archived" },
  };
  const rule = rules[action];

  const updated = await Quiz.findOneAndUpdate(
    { _id: quizId, teacherId, status: { $in: rule.from }, ...rule.extra },
    { $set: { status: rule.to } },
    { returnDocument: "after" },
  ).lean<LeanQuiz>();
  if (updated) return { id: quizId, status: updated.status };

  // Explain precisely why the move was refused.
  if (!rule.from.includes(quiz.status)) {
    throw new AppError("INVALID_STATE", `Can't ${action} a quiz that is ${quiz.status}`, 409);
  }
  if (action === "publish" && quiz.questions.length === 0) {
    throw new AppError("INVALID_STATE", "Add at least one question before publishing", 409);
  }
  if (action === "publish" && quiz.endsAt <= now) {
    throw new AppError("INVALID_STATE", "The availability window has already ended; move the end time first", 409);
  }
  throw new AppError("INVALID_STATE", "Quiz changed meanwhile; reload and try again", 409);
}

// ---------- student-facing (never includes questions or correct answers) ----------

export type Availability = "upcoming" | "open" | "closed";
export type MyAttempt = { id: string; status: string } | null;

export type QuizForStudent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  questionCount: number;
  availability: Availability;
  myAttempt: MyAttempt;
};

export type QuizDetailForStudent = QuizForStudent & {
  instructions: string;
  marking: { correct: number; incorrect: number; unanswered: number };
};

function availabilityOf(q: { startsAt: Date; endsAt: Date }, now = new Date()): Availability {
  if (now < q.startsAt) return "upcoming";
  if (now >= q.endsAt) return "closed";
  return "open";
}

/** The student's attempts for these quizzes (raw collection until the Attempt model exists in phase 04). */
async function myAttempts(studentId: string, quizIds: Types.ObjectId[]): Promise<Map<string, MyAttempt>> {
  const map = new Map<string, MyAttempt>();
  if (quizIds.length === 0) return map;
  const rows = await mongoose.connection
    .db!.collection("attempts")
    .find({ studentId: new Types.ObjectId(studentId), quizId: { $in: quizIds } }, { projection: { quizId: 1, status: 1 } })
    .toArray();
  for (const r of rows) map.set(String(r.quizId), { id: String(r._id), status: String(r.status) });
  return map;
}

function toStudentQuiz(q: LeanQuiz, attempt: MyAttempt): QuizForStudent {
  return {
    id: q._id.toString(),
    title: q.title,
    startsAt: q.startsAt.toISOString(),
    endsAt: q.endsAt.toISOString(),
    durationMinutes: q.durationMinutes,
    questionCount: q.questions.length,
    availability: availabilityOf(q),
    myAttempt: attempt,
  };
}

/** Every published quiz is visible to every student (D-016). Projection leaves out the questions entirely. */
export async function listQuizzesForStudent(studentId: string): Promise<QuizForStudent[]> {
  await connectDB();
  const quizzes = await Quiz.aggregate<LeanQuiz>([
    { $match: { status: "published" } },
    { $sort: { startsAt: 1 } },
    { $limit: 500 },
    // keep only what students may see; question count without shipping question contents
    { $project: { title: 1, startsAt: 1, endsAt: 1, durationMinutes: 1, questions: { $map: { input: "$questions", in: { _id: "$$this._id" } } } } },
  ]);
  const attempts = await myAttempts(studentId, quizzes.map((q) => q._id));
  return quizzes.map((q) => toStudentQuiz(q, attempts.get(q._id.toString()) ?? null));
}

/** Pre-start screen data. Unpublished/archived/missing → 404 (students can't tell them apart). */
export async function getQuizForStudent(studentId: string, quizId: string): Promise<QuizDetailForStudent> {
  await connectDB();
  const quiz = await Quiz.findOne({ _id: quizId, status: "published" }).lean<LeanQuiz>();
  if (!quiz) throw new AppError("NOT_FOUND", "Quiz not found", 404);
  const attempts = await myAttempts(studentId, [quiz._id]);
  return {
    ...toStudentQuiz(quiz, attempts.get(quizId) ?? null),
    instructions: quiz.instructions ?? "",
    marking: { correct: quiz.marking.correct, incorrect: quiz.marking.incorrect, unanswered: quiz.marking.unanswered },
  };
}
