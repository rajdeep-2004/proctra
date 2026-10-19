import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { Attempt, type AttemptDoc, type AttemptStatus, type ScoreDoc } from "@/models/attempt";
import { ProctorEvent, type EventType, type ProctorEventDoc } from "@/models/proctor-event";
import { Quiz, type QuizDoc } from "@/models/quiz";
import { finalizeExpiredForQuiz, finalizeIfExpired } from "@/services/attempt-service";
import { resultFor, type QuestionResult } from "@/services/grading";
import { eventCounts } from "@/services/proctor-service";
import { snapshotCounts } from "@/services/snapshot-service";

/** The teacher must own the quiz: 404 if it doesn't exist, 403 if it belongs to someone else. */
async function loadOwnedQuiz(teacherId: string, quizId: Types.ObjectId | string): Promise<QuizDoc> {
  const quiz = await Quiz.findById(quizId).lean<QuizDoc>();
  if (!quiz) throw new AppError("NOT_FOUND", "Quiz not found", 404);
  if (quiz.teacherId.toString() !== teacherId) throw new AppError("FORBIDDEN", "This quiz belongs to another teacher", 403);
  return quiz;
}

// ---------- submissions table ----------

export type SubmissionRow = {
  id: string;
  studentName: string;
  status: AttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  score: ScoreDoc | null;
  eventCount: number;
  snapshotCount: number;
};

export type QuizSubmissions = {
  quiz: { id: string; title: string; startsAt: string; endsAt: string; questionCount: number; maxPossible: number };
  rows: SubmissionRow[];
};

export async function listSubmissions(teacherId: string, quizId: string): Promise<QuizSubmissions> {
  await connectDB();
  const quiz = await loadOwnedQuiz(teacherId, quizId);
  await finalizeExpiredForQuiz(quizId); // nobody should look at an expired attempt as "in progress" (D-006)
  const attempts = await Attempt.find({ quizId }).sort({ "score.total": -1, studentName: 1 }).limit(1000).lean<AttemptDoc[]>();
  const ids = attempts.map((a) => a._id);
  const [events, snaps] = await Promise.all([eventCounts(ids), snapshotCounts(ids)]);
  return {
    quiz: {
      id: quiz._id.toString(),
      title: quiz.title,
      startsAt: quiz.startsAt.toISOString(),
      endsAt: quiz.endsAt.toISOString(),
      questionCount: quiz.questions.length,
      maxPossible: quiz.questions.length * quiz.marking.correct,
    },
    rows: attempts.map((a) => ({
      id: a._id.toString(),
      studentName: a.studentName,
      status: a.status,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
      score: a.score,
      eventCount: events.get(a._id.toString()) ?? 0,
      snapshotCount: snaps.get(a._id.toString()) ?? 0,
    })),
  };
}

// ---------- one attempt in detail ----------

export type TeacherAttemptView = {
  id: string;
  quizId: string;
  quizTitle: string;
  studentName: string;
  status: AttemptStatus;
  startedAt: string;
  deadline: string;
  submittedAt: string | null;
  score: ScoreDoc | null;
  questions: { id: string; text: string; options: string[]; correctIndex: number; selectedIndex: number | null; markedForReview: boolean; result: QuestionResult }[];
  events: { type: EventType; occurredAt: string }[];
  snapshotCount: number;
};

export async function getAttemptForTeacher(teacherId: string, attemptId: string): Promise<TeacherAttemptView> {
  await connectDB();
  const raw = await Attempt.findById(attemptId).lean<AttemptDoc>();
  if (!raw) throw new AppError("NOT_FOUND", "Attempt not found", 404);
  const quiz = await loadOwnedQuiz(teacherId, raw.quizId);
  const attempt = await finalizeIfExpired(raw);
  const answers = attempt.answers ?? {};
  const [events, snaps] = await Promise.all([
    ProctorEvent.find({ attemptId: attempt._id }).sort({ occurredAt: 1 }).limit(2000).lean<ProctorEventDoc[]>(),
    snapshotCounts([attempt._id]),
  ]);
  return {
    id: attempt._id.toString(),
    quizId: quiz._id.toString(),
    quizTitle: quiz.title,
    studentName: attempt.studentName,
    status: attempt.status,
    startedAt: attempt.startedAt.toISOString(),
    deadline: attempt.deadline.toISOString(),
    submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
    score: attempt.score,
    questions: quiz.questions.map((q) => {
      const id = q._id.toString();
      return {
        id, text: q.text, options: [...q.options], correctIndex: q.correctIndex,
        selectedIndex: answers[id]?.selectedIndex ?? null,
        markedForReview: Boolean(answers[id]?.markedForReview),
        result: resultFor({ id, correctIndex: q.correctIndex }, answers),
      };
    }),
    events: events.map((e) => ({ type: e.type, occurredAt: e.occurredAt.toISOString() })),
    snapshotCount: snaps.get(attempt._id.toString()) ?? 0,
  };
}
