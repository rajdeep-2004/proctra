import "server-only";
import { Schema, Types, model, models, type Model } from "mongoose";

/** Neutral facts about the exam session — never labelled as cheating (PRD §9). */
export const EVENT_TYPES = [
  "window_blur",
  "window_focus",
  "tab_hidden",
  "tab_visible",
  "fullscreen_exit",
  "camera_lost",
  "camera_restored",
  "snapshot_failed",
  "resumed",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export type ProctorEventDoc = {
  _id: Types.ObjectId;
  attemptId: Types.ObjectId;
  quizId: Types.ObjectId;
  type: EventType;
  occurredAt: Date;
  createdAt: Date;
};

const eventSchema = new Schema(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: "Attempt", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    type: { type: String, enum: EVENT_TYPES, required: true },
    occurredAt: { type: Date, required: true }, // client time, clamped to the attempt's span
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "proctorEvents" },
);
eventSchema.index({ attemptId: 1, occurredAt: 1 }); // teacher submission view, event counts

export const ProctorEvent: Model<ProctorEventDoc> =
  (models.ProctorEvent as Model<ProctorEventDoc>) ?? model<ProctorEventDoc>("ProctorEvent", eventSchema);
