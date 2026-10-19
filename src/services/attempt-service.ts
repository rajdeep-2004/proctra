import "server-only";
import { mongo, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { ANSWER_GRACE_MS, Attempt, type AttemptDoc, type AttemptStatus, type ScoreDoc } from "@/models/attempt";
import { Quiz, type QuizDoc } from "@/models/quiz";
import type { AnswerInput } from "@/schemas/attempt";
import { grade, resultFor, type QuestionResult } from "@/services/grading";

// ---------- response shapes ----------

export type ActiveAttemptView = {
  id: string;
  status: "active";
  quizId: string;
  quizTitle: string;
  deadline: string;
  serverNow: string;
  questions: { id: string; text: string; options: string[] }[]; // never correctIndex while active
  answers: Record<string, { selectedIndex: number | null; markedForReview: boolean }>;
};

export type FinishedAttemptView = {
  id: string;
  status: Exclude<AttemptStatus, "active">;
  quizId: string;
  quizTitle: string;
  startedAt: string;
  submittedAt: string;
  released: boolean;
  resultsReleaseAt: string | null;
  score: ScoreDoc | null; // null until released
  questions?: { id: string; text: string; options: string[]; selectedIndex: number | null; correctIndex: number; result: QuestionResult }[];
};

export type AttemptView = ActiveAttemptView | FinishedAttemptView;

// ---------- helpers ----------

const isPastGrace = (a: Pick<AttemptDoc, "deadline">, now = Date.now()) => now > a.deadline.getTime() + ANSWER_GRACE_MS;

async function loadOwnAttempt(studentId: string, attemptId: string): Promise<AttemptDoc> {
  const attempt = await Attempt.findOne({ _id: attemptId, studentId }).lean<AttemptDoc>();
  // Someone else's attempt looks exactly like a missing one (D-023).
  if (!attempt) throw new AppError("NOT_FOUND", "Attempt not found", 404);
  return attempt;
}

async function loadQuiz(quizId: Types.ObjectId | string): Promise<QuizDoc> {
  const quiz = await Quiz.findById(quizId).lean<QuizDoc>();
  if (!quiz) throw new AppError("NOT_FOUND", "Quiz not found", 404);
  return quiz;
}

function scoreFor(quiz: QuizDoc, attempt: AttemptDoc): ScoreDoc {
  return grade(
    quiz.questions.map((q) => ({ id: q._id.toString(), correctIndex: q.correctIndex })),
    quiz.marking,
    attempt.answers ?? {},
  );
}

/**
 * Closes an active attempt and stores its score in ONE conditional write. The filter includes the
 * `updatedAt` we graded, so if an answer save lands in between, the write misses and we re-read and
 * re-grade (optimistic concurrency). Only one caller can ever flip `active` → finished (D-006).
 */
async function finalize(attemptId: Types.ObjectId, mode: "manual" | "auto"): Promise<AttemptDoc> {
  for (let tries = 0; tries < 5; tries++) {
    const current = await Attempt.findById(attemptId).lean<AttemptDoc>();
    if (!current) throw new AppError("NOT_FOUND", "Attempt not found", 404);
    if (current.status !== "active") return current; // someone else finished it — use their result

    const quiz = await loadQuiz(current.quizId);
    const now = new Date();
    // Submitting at/after the deadline counts as automatic, stamped at the deadline (not "late").
    const automatic = mode === "auto" || now >= current.deadline;
    const updated = await Attempt.findOneAndUpdate(
      { _id: attemptId, status: "active", updatedAt: current.updatedAt },
      {
        $set: {
          status: automatic ? "auto_submitted" : "submitted",
          submittedAt: automatic ? current.deadline : now,
          score: scoreFor(quiz, current),
        },
      },
      { returnDocument: "after", timestamps: false }, // keep updatedAt as "last answer change"
    ).lean<AttemptDoc>();
    if (updated) return updated;
  }
  throw new AppError("INVALID_STATE", "Attempt is busy; try again", 409);
}

/** Lazy finalization (D-006): every read path calls this first, so an expired attempt is never observed as active. */
export async function finalizeIfExpired(attempt: AttemptDoc): Promise<AttemptDoc> {
  if (attempt.status !== "active" || !isPastGrace(attempt)) return attempt;
  return finalize(attempt._id, "auto");
}

/** Finalizes this student's expired attempts (dashboard / quiz pages call it before showing status). */
export async function finalizeExpiredForStudent(studentId: string): Promise<void> {
  const expired = await Attempt.find({
    studentId,
    status: "active",
    deadline: { $lt: new Date(Date.now() - ANSWER_GRACE_MS) },
  }).lean<AttemptDoc[]>();
  for (const a of expired) await finalize(a._id, "auto");
}

/** Finalizes every expired attempt of a quiz (teacher views, leaderboard — phase 06). */
export async function finalizeExpiredForQuiz(quizId: string): Promise<void> {
  const expired = await Attempt.find({
    quizId,
    status: "active",
    deadline: { $lt: new Date(Date.now() - ANSWER_GRACE_MS) },
  }).lean<AttemptDoc[]>();
  for (const a of expired) await finalize(a._id, "auto");
}

function isReleased(quiz: QuizDoc, now = new Date()) {
  return !quiz.resultsReleaseAt || quiz.resultsReleaseAt <= now;
}

function toView(attempt: AttemptDoc, quiz: QuizDoc): AttemptView {
  const answers = attempt.answers ?? {};
  if (attempt.status === "active") {
    return {
      id: attempt._id.toString(),
      status: "active",
      quizId: quiz._id.toString(),
      quizTitle: quiz.title,
      deadline: attempt.deadline.toISOString(),
      serverNow: new Date().toISOString(),
      questions: quiz.questions.map((q) => ({ id: q._id.toString(), text: q.text, options: [...q.options] })),
      answers: Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, { selectedIndex: v.selectedIndex ?? null, markedForReview: Boolean(v.markedForReview) }]),
      ),
    };
  }
  const released = isReleased(quiz);
  const view: FinishedAttemptView = {
    id: attempt._id.toString(),
    status: attempt.status,
    quizId: quiz._id.toString(),
    quizTitle: quiz.title,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: (attempt.submittedAt ?? attempt.deadline).toISOString(),
    released,
    resultsReleaseAt: quiz.resultsReleaseAt ? quiz.resultsReleaseAt.toISOString() : null,
    score: released ? attempt.score : null,
  };
  if (released) {
    view.questions = quiz.questions.map((q) => {
      const id = q._id.toString();
      return {
        id, text: q.text, options: [...q.options],
        selectedIndex: answers[id]?.selectedIndex ?? null,
        correctIndex: q.correctIndex,
        result: resultFor({ id, correctIndex: q.correctIndex }, answers),
      };
    });
  }
  return view;
}

// ---------- public API ----------

export type StartResult = { attemptId: string; status: AttemptStatus; deadline: string; resumed: boolean };

/**
 * Starts an attempt, or returns the student's active one (resume). Rules (D-041, system-design §2):
 * published + now inside [startsAt, endsAt) → lock the quiz FIRST → upsert the attempt with deadline = endsAt.
 */
export async function startOrResume(student: { id: string; name: string }, quizId: string): Promise<StartResult> {
  await connectDB();

  const existing = await Attempt.findOne({ quizId, studentId: student.id }).lean<AttemptDoc>();
  if (existing) {
    const a = await finalizeIfExpired(existing);
    if (a.status === "active") return { attemptId: a._id.toString(), status: a.status, deadline: a.deadline.toISOString(), resumed: true };
    throw new AppError("ALREADY_ATTEMPTED", "You have already taken this quiz", 409);
  }

  const now = new Date();
  // Lock before creating the attempt, so a teacher can't change questions under a starting student (D-022).
  const lock = await Quiz.updateOne(
    { _id: quizId, status: "published", startsAt: { $lte: now }, endsAt: { $gt: now } },
    { $set: { locked: true } },
  );
  if (lock.matchedCount === 0) {
    const quiz = await Quiz.findOne({ _id: quizId, status: "published" }).lean<QuizDoc>();
    if (!quiz) throw new AppError("NOT_FOUND", "Quiz not found", 404);
    if (now < quiz.startsAt) throw new AppError("QUIZ_NOT_AVAILABLE", "This quiz hasn't started yet", 409);
    throw new AppError("QUIZ_NOT_AVAILABLE", "This quiz has ended", 409);
  }
  const quiz = await loadQuiz(quizId); // read AFTER locking, so we see the final questions and end time

  try {
    const a = await Attempt.create({
      quizId: quiz._id,
      studentId: new Types.ObjectId(student.id),
      studentName: student.name,
      status: "active",
      startedAt: now,
      deadline: quiz.endsAt,
    });
    return { attemptId: a._id.toString(), status: "active", deadline: a.deadline.toISOString(), resumed: false };
  } catch (error) {
    // Unique index {quizId, studentId}: a parallel request (double-click, two windows) created it first → use that one.
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      const a = await Attempt.findOne({ quizId, studentId: student.id }).lean<AttemptDoc>();
      if (a?.status === "active") return { attemptId: a._id.toString(), status: a.status, deadline: a.deadline.toISOString(), resumed: true };
      throw new AppError("ALREADY_ATTEMPTED", "You have already taken this quiz", 409);
    }
    throw error;
  }
}

/** Exam state while active (no correct answers); result after (correct answers only once released). */
export async function getAttemptForStudent(studentId: string, attemptId: string): Promise<AttemptView> {
  await connectDB();
  const attempt = await finalizeIfExpired(await loadOwnAttempt(studentId, attemptId));
  return toView(attempt, await loadQuiz(attempt.quizId));
}

/** Autosave of one answer: a single conditional write that can't touch a closed attempt (D-007, D-019). */
export async function saveAnswer(studentId: string, attemptId: string, questionId: string, input: AnswerInput) {
  await connectDB();
  const attempt = await loadOwnAttempt(studentId, attemptId);
  const quiz = await loadQuiz(attempt.quizId);

  const question = quiz.questions.find((q) => q._id.toString() === questionId);
  if (!question) {
    throw new AppError("VALIDATION_ERROR", "Question isn't part of this quiz", 400, { issues: [{ path: "questionId", message: "Unknown question" }] });
  }
  if (input.selectedIndex !== null && input.selectedIndex >= question.options.length) {
    throw new AppError("VALIDATION_ERROR", "Option out of range", 400, { issues: [{ path: "selectedIndex", message: "Option out of range" }] });
  }

  const savedAt = new Date();
  // questionId was matched against the quiz above, so it's a plain 24-hex id — safe to use in a field path.
  const res = await Attempt.updateOne(
    { _id: attempt._id, studentId, status: "active", deadline: { $gt: new Date(savedAt.getTime() - ANSWER_GRACE_MS) } },
    { $set: { [`answers.${questionId}`]: { selectedIndex: input.selectedIndex, markedForReview: input.markedForReview, savedAt } } },
  );
  if (res.matchedCount === 0) {
    await finalizeIfExpired(attempt);
    throw new AppError("ATTEMPT_CLOSED", "This attempt has ended", 409);
  }
  return { questionId, savedAt: savedAt.toISOString() };
}

/** Manual submit or the client's auto-submit at 0. Idempotent: a finished attempt just returns its result. */
export async function submitAttempt(studentId: string, attemptId: string): Promise<AttemptView> {
  await connectDB();
  const attempt = await loadOwnAttempt(studentId, attemptId);
  const finished = attempt.status === "active" ? await finalize(attempt._id, "manual") : attempt;
  return toView(finished, await loadQuiz(finished.quizId));
}
