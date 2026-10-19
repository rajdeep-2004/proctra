import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { uploadPrivateJpeg } from "@/lib/cloudinary";
import { ANSWER_GRACE_MS, Attempt, type AttemptDoc } from "@/models/attempt";
import { Snapshot } from "@/models/snapshot";

export const MAX_SNAPSHOT_BYTES = 500 * 1024;

/** JPEG files start with FF D8 FF — check the bytes, not just the client's claimed MIME type. */
const isJpeg = (b: Buffer) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;

/** Stores one camera still for the student's own ACTIVE attempt (F-07). */
export async function saveSnapshot(studentId: string, attemptId: string, bytes: Buffer, capturedAtRaw: string | null) {
  if (bytes.length > MAX_SNAPSHOT_BYTES) throw new AppError("PAYLOAD_TOO_LARGE", "Snapshot is too large", 413);
  if (!isJpeg(bytes)) throw new AppError("VALIDATION_ERROR", "Snapshot must be a JPEG", 400);

  await connectDB();
  const attempt = await Attempt.findOne({ _id: attemptId, studentId }).lean<AttemptDoc>();
  if (!attempt) throw new AppError("NOT_FOUND", "Attempt not found", 404);
  const now = Date.now();
  // No capture outside an active attempt (PRD §9).
  if (attempt.status !== "active" || now > attempt.deadline.getTime() + ANSWER_GRACE_MS) {
    throw new AppError("ATTEMPT_CLOSED", "This attempt has ended", 409);
  }

  const claimed = capturedAtRaw ? Date.parse(capturedAtRaw) : NaN;
  const capturedAt = new Date(Number.isFinite(claimed) ? Math.min(now, Math.max(attempt.startedAt.getTime(), claimed)) : now);
  const publicId = await uploadPrivateJpeg(bytes, `proctra/${attempt.quizId}/${attempt._id}`);
  const doc = await Snapshot.create({ attemptId: attempt._id, quizId: attempt.quizId, publicId, capturedAt });
  return { id: doc._id.toString(), capturedAt: capturedAt.toISOString() };
}

export async function snapshotCounts(attemptIds: Types.ObjectId[]): Promise<Map<string, number>> {
  const rows = await Snapshot.aggregate<{ _id: Types.ObjectId; n: number }>([
    { $match: { attemptId: { $in: attemptIds } } },
    { $group: { _id: "$attemptId", n: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r.n]));
}
