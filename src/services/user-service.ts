import "server-only";
import bcrypt from "bcryptjs";
import { mongo } from "mongoose";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/api-response";
import { User, type Role } from "@/models/user";
import type { RegisterInput, SignInInput } from "@/schemas/auth";

const BCRYPT_COST = 10;

/** Public shape of a user — never includes the password hash. */
export type PublicUser = { id: string; name: string; email: string; role: Role };

function toPublic(u: { _id: { toString(): string }; name: string; email: string; role: Role }): PublicUser {
  return { id: u._id.toString(), name: u.name, email: u.email, role: u.role };
}

/** Self-registration. Always creates a student: the role is never taken from input. */
export async function registerStudent(input: RegisterInput): Promise<PublicUser> {
  await connectDB();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  try {
    const user = await User.create({ name: input.name, email: input.email, passwordHash, role: "student" });
    return toPublic(user);
  } catch (error) {
    // 11000 = duplicate key on the unique email index (also catches two sign-ups racing).
    if (error instanceof mongo.MongoServerError && error.code === 11000) {
      throw new AppError("CONFLICT", "An account with this email already exists", 409);
    }
    throw error;
  }
}

// A real bcrypt hash of a random string. Comparing against it when the email doesn't exist makes
// "unknown email" take as long as "wrong password", so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("proctra-timing-equaliser", BCRYPT_COST);

/** Returns the user if the credentials are valid, otherwise null. Never says which part was wrong. */
export async function verifyCredentials(input: SignInInput): Promise<PublicUser | null> {
  await connectDB();
  const user = await User.findOne({ email: input.email }).select("+passwordHash").lean();
  const valid = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);
  return user && valid ? toPublic(user) : null;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  await connectDB();
  const user = await User.findById(id).lean();
  return user ? toPublic(user) : null;
}

/** Creates or updates a teacher by email (used by the seed script; idempotent). */
export async function upsertTeacher(input: RegisterInput): Promise<PublicUser> {
  await connectDB();
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const user = await User.findOneAndUpdate(
    { email: input.email },
    { $set: { name: input.name, passwordHash, role: "teacher" } },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  return toPublic(user!);
}
