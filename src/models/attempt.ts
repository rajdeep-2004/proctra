import "server-only";
import { Schema, Types, model, models, type Model } from "mongoose";

export const ATTEMPT_STATUSES = ["active", "submitted", "auto_submitted"] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

/** Answers are saved until deadline + this grace, to absorb network latency for last-second clicks. */
export const ANSWER_GRACE_MS = 5_000;

export type AnswerDoc = { selectedIndex: number | null; markedForReview: boolean; savedAt: Date };
export type ScoreDoc = { total: number; correct: number; incorrect: number; unanswered: number; maxPossible: number };

/** Plain shape of a stored attempt (what `.lean()` returns). `answers` is keyed by question id (D-019). */
export type AttemptDoc = {
  _id: Types.ObjectId;
  quizId: Types.ObjectId;
  studentId: Types.ObjectId;
  studentName: string;
  status: AttemptStatus;
  startedAt: Date;
  deadline: Date; // = quiz.endsAt; moved later if the teacher extends the quiz (D-041)
  submittedAt: Date | null;
  answers: Record<string, AnswerDoc>;
  score: ScoreDoc | null;
  createdAt: Date;
  updatedAt: Date;
};

const answerSchema = new Schema(
  {
    selectedIndex: { type: Number, default: null, min: 0 },
    markedForReview: { type: Boolean, default: false },
    savedAt: { type: Date, required: true },
  },
  { _id: false },
);

const scoreSchema = new Schema(
  {
    total: { type: Number, required: true },
    correct: { type: Number, required: true },
    incorrect: { type: Number, required: true },
    unanswered: { type: Number, required: true },
    maxPossible: { type: Number, required: true },
  },
  { _id: false },
);

const attemptSchema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true }, // copied at start for list views (D-021)
    status: { type: String, enum: ATTEMPT_STATUSES, required: true, default: "active" },
    startedAt: { type: Date, required: true },
    deadline: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    answers: { type: Map, of: answerSchema, default: {} },
    score: { type: scoreSchema, default: null },
  },
  { timestamps: true },
);

attemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true }); // one attempt per student per quiz; start/resume lookup
attemptSchema.index({ studentId: 1, startedAt: -1 }); // profile history, "active attempt to resume"
attemptSchema.index({ quizId: 1, status: 1, "score.total": -1 }); // submissions + leaderboard

export const Attempt: Model<AttemptDoc> =
  (models.Attempt as Model<AttemptDoc>) ?? model<AttemptDoc>("Attempt", attemptSchema);
