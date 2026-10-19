import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { ANSWER_GRACE_MS, Attempt, type AttemptDoc } from "@/models/attempt";
import { ProctorEvent, type EventType } from "@/models/proctor-event";
import type { EventsInput } from "@/schemas/proctor";

/** Events may still arrive shortly after the attempt ends (the final flush on submit). */
const LATE_EVENTS_MS = 30_000;
/** Hard cap per attempt so a misbehaving client can't fill the database. */
const MAX_EVENTS_PER_ATTEMPT = 2_000;

/** Records a batch of client events for the student's own attempt; times are clamped to the attempt's span. */
export async function recordEvents(studentId: string, attemptId: string, input: EventsInput): Promise<{ accepted: number }> {
  await connectDB();
  const attempt = await Attempt.findOne({ _id: attemptId, studentId }).lean<AttemptDoc>();
  if (!attempt) throw new AppError("NOT_FOUND", "Attempt not found", 404);

  const end = (attempt.submittedAt ?? attempt.deadline).getTime();
  const now = Date.now();
  if (attempt.status !== "active" && now > end + LATE_EVENTS_MS) {
    throw new AppError("ATTEMPT_CLOSED", "This attempt has ended", 409);
  }
  const existing = await ProctorEvent.countDocuments({ attemptId: attempt._id });
  const room = Math.max(0, MAX_EVENTS_PER_ATTEMPT - existing);

  const lo = attempt.startedAt.getTime();
  const hi = Math.min(now, end + ANSWER_GRACE_MS);
  const docs = input.events.slice(0, room).map((e) => ({
    attemptId: attempt._id,
    quizId: attempt.quizId,
    type: e.type,
    occurredAt: new Date(Math.min(hi, Math.max(lo, e.occurredAt.getTime()))), // never trust the client clock blindly
  }));
  if (docs.length) await ProctorEvent.insertMany(docs, { ordered: false });
  return { accepted: docs.length };
}

/** Server-side events (e.g. "resumed" when an active attempt is reopened). */
export async function recordServerEvent(attempt: Pick<AttemptDoc, "_id" | "quizId">, type: EventType) {
  await ProctorEvent.create({ attemptId: attempt._id, quizId: attempt.quizId, type, occurredAt: new Date() });
}

export async function eventCounts(attemptIds: Types.ObjectId[]): Promise<Map<string, number>> {
  const rows = await ProctorEvent.aggregate<{ _id: Types.ObjectId; n: number }>([
    { $match: { attemptId: { $in: attemptIds } } },
    { $group: { _id: "$attemptId", n: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r.n]));
}
