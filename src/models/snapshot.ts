import "server-only";
import { Schema, Types, model, models, type Model } from "mongoose";

export type SnapshotDoc = {
  _id: Types.ObjectId;
  attemptId: Types.ObjectId;
  quizId: Types.ObjectId;
  publicId: string; // Cloudinary id of a private (authenticated) image — never a public URL (D-008)
  capturedAt: Date; // client time, clamped to the attempt's span
  createdAt: Date;
};

const snapshotSchema = new Schema(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: "Attempt", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    publicId: { type: String, required: true },
    capturedAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
snapshotSchema.index({ attemptId: 1, capturedAt: 1 }); // gallery in time order, counts per attempt

export const Snapshot: Model<SnapshotDoc> =
  (models.Snapshot as Model<SnapshotDoc>) ?? model<SnapshotDoc>("Snapshot", snapshotSchema);
