import "server-only";
import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const ROLES = ["student", "teacher"] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    // select: false → never returned unless a query explicitly asks for it with .select("+passwordHash")
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: "student" },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

// Reuse the compiled model across hot reloads (re-compiling throws OverwriteModelError).
export const User: Model<UserDoc> = (models.User as Model<UserDoc>) ?? model<UserDoc>("User", userSchema);
