import "server-only";
import { Schema, Types, model, models, type InferSchemaType, type Model } from "mongoose";

export const QUIZ_STATUSES = ["draft", "published", "archived"] as const;
export type QuizStatus = (typeof QUIZ_STATUSES)[number];

export const LIMITS = {
  title: 200,
  instructions: 5000,
  questionText: 2000,
  optionText: 500,
  minOptions: 2,
  maxOptions: 6,
  maxQuestions: 200,
  minDuration: 1,
  maxDuration: 300,
  markAbs: 100,
} as const;

const questionSchema = new Schema({
  // _id is added automatically and is the stable key attempts use for answers (D-018/D-019).
  text: { type: String, required: true, trim: true, maxlength: LIMITS.questionText },
  options: {
    type: [{ type: String, trim: true, maxlength: LIMITS.optionText }],
    validate: {
      validator: (o: string[]) => o.length >= LIMITS.minOptions && o.length <= LIMITS.maxOptions,
      message: `A question needs ${LIMITS.minOptions}–${LIMITS.maxOptions} options`,
    },
  },
  correctIndex: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator(this: { options: string[] }, v: number) {
        return Number.isInteger(v) && v < this.options.length;
      },
      message: "correctIndex must point at one of the options",
    },
  },
});

const markSchema = { type: Number, required: true, min: -LIMITS.markAbs, max: LIMITS.markAbs };

const quizSchema = new Schema(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: LIMITS.title },
    instructions: { type: String, default: "", trim: true, maxlength: LIMITS.instructions },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: LIMITS.minDuration, max: LIMITS.maxDuration },
    marking: {
      correct: { ...markSchema, default: 1 },
      incorrect: { ...markSchema, default: 0 },
      unanswered: { ...markSchema, default: 0 },
    },
    resultsReleaseAt: { type: Date, default: null },
    status: { type: String, enum: QUIZ_STATUSES, required: true, default: "draft" },
    // Set true when the first attempt starts (phase 04); questions + marking then become read-only (D-022).
    locked: { type: Boolean, required: true, default: false },
    questions: {
      type: [questionSchema],
      default: [],
      validate: { validator: (q: unknown[]) => q.length <= LIMITS.maxQuestions, message: "Too many questions" },
    },
  },
  { timestamps: true },
);

quizSchema.index({ teacherId: 1, updatedAt: -1 }); // teacher dashboard: my quizzes, newest first
quizSchema.index({ status: 1, startsAt: 1 }); // student dashboard: published quizzes by start time

export type QuizDoc = InferSchemaType<typeof quizSchema> & { _id: Types.ObjectId };
export type QuestionDoc = QuizDoc["questions"][number];

export const Quiz: Model<QuizDoc> = (models.Quiz as Model<QuizDoc>) ?? model<QuizDoc>("Quiz", quizSchema);
