import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { signedImageUrl } from "@/lib/cloudinary";
import { Attempt, type AttemptDoc, type AttemptStatus, type ScoreDoc } from "@/models/attempt";
import { ProctorEvent, type EventType, type ProctorEventDoc } from "@/models/proctor-event";
import { Quiz, type QuizDoc } from "@/models/quiz";
import { Snapshot, type SnapshotDoc } from "@/models/snapshot";
import { finalizeExpiredForQuiz, finalizeIfExpired } from "@/services/attempt-service";
import { resultFor, type QuestionResult } from "@/services/grading";
import { eventCounts } from "@/services/proctor-service";
import { competitionRank } from "@/services/ranking";
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

// ---------- leaderboard (D-025, D-049) ----------

export type Leaderboard = {
  quizId: string;
  quizTitle: string;
  maxPossible: number;
  live: boolean; // exam not over yet or someone still writing → ranks may change
  stillWriting: number;
  serverNow: string;
  entries: { rank: number; studentName: string; score: number; isMe: boolean }[];
};

/**
 * Teacher (owner): always. Student: only after finishing their own attempt AND once results are released.
 * Ranks finished attempts only; names + scores, never answers, events or snapshots.
 */
export async function getLeaderboard(user: { id: string; role: "student" | "teacher" }, quizId: string): Promise<Leaderboard> {
  await connectDB();
  const quiz = await Quiz.findById(quizId).lean<QuizDoc>();
  if (!quiz || (user.role === "student" && quiz.status === "draft")) throw new AppError("NOT_FOUND", "Quiz not found", 404);

  await finalizeExpiredForQuiz(quizId);
  if (user.role === "teacher") {
    if (quiz.teacherId.toString() !== user.id) throw new AppError("FORBIDDEN", "This quiz belongs to another teacher", 403);
  } else {
    const mine = await Attempt.findOne({ quizId, studentId: user.id }, { status: 1 }).lean<Pick<AttemptDoc, "status">>();
    if (!mine || mine.status === "active") throw new AppError("FORBIDDEN", "Finish this quiz to see the leaderboard", 403);
    if (quiz.resultsReleaseAt && quiz.resultsReleaseAt > new Date()) {
      throw new AppError("RESULTS_NOT_RELEASED", "Results aren't released yet", 403, { resultsReleaseAt: quiz.resultsReleaseAt.toISOString() });
    }
  }

  const [finished, stillWriting] = await Promise.all([
    Attempt.find({ quizId, status: { $ne: "active" } }, { studentId: 1, studentName: 1, score: 1 })
      .limit(1000)
      .lean<Pick<AttemptDoc, "studentId" | "studentName" | "score">[]>(),
    Attempt.countDocuments({ quizId, status: "active" }),
  ]);
  const ranked = competitionRank(
    finished.map((a) => ({ name: a.studentName, score: a.score?.total ?? 0, studentId: a.studentId.toString() })),
  );
  const now = new Date();
  return {
    quizId: quiz._id.toString(),
    quizTitle: quiz.title,
    maxPossible: quiz.questions.length * quiz.marking.correct,
    live: now < quiz.endsAt || stillWriting > 0,
    stillWriting,
    serverNow: now.toISOString(),
    entries: ranked.map((r) => ({
      rank: r.rank,
      studentName: r.name,
      score: r.score,
      isMe: user.role === "student" && r.studentId === user.id,
    })),
  };
}

// ---------- snapshot gallery (S-01) ----------

export const SNAPSHOT_LINK_SECONDS = 600; // signed links expire after 10 minutes

export type SnapshotGallery = { expiresAt: string; snapshots: { id: string; capturedAt: string; url: string }[] };

/** Owner-only list of an attempt's snapshots with short-lived signed URLs (images are private, D-008). */
export async function getSnapshotGallery(teacherId: string, attemptId: string): Promise<SnapshotGallery> {
  await connectDB();
  const attempt = await Attempt.findById(attemptId, { quizId: 1 }).lean<Pick<AttemptDoc, "_id" | "quizId">>();
  if (!attempt) throw new AppError("NOT_FOUND", "Attempt not found", 404);
  await loadOwnedQuiz(teacherId, attempt.quizId);
  const snaps = await Snapshot.find({ attemptId: attempt._id }, { publicId: 1, capturedAt: 1 })
    .sort({ capturedAt: 1 })
    .limit(2000)
    .lean<Pick<SnapshotDoc, "_id" | "publicId" | "capturedAt">[]>();
  return {
    expiresAt: new Date(Date.now() + SNAPSHOT_LINK_SECONDS * 1000).toISOString(),
    snapshots: snaps.map((s) => ({
      id: s._id.toString(),
      capturedAt: s.capturedAt.toISOString(),
      url: signedImageUrl(s.publicId, SNAPSHOT_LINK_SECONDS),
    })),
  };
}
