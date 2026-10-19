/**
 * Creates or updates the teacher account from SEED_TEACHER_* in .env.
 * Teachers can't self-register (PRD F-01), so this is how they get accounts.
 *
 *   npm run seed              # create, or update name/password of an existing teacher
 *   npm run seed -- --promote # also allowed to turn an existing STUDENT with that email into a teacher
 *
 * Safe to run repeatedly (upsert by email).
 */
import fs from "node:fs";
import mongoose from "mongoose";
import { RegisterInput } from "@/schemas/auth";
import { User } from "@/models/user";
import { connectDB } from "@/lib/db";
import { upsertTeacher } from "@/services/user-service";

async function main() {
  if (fs.existsSync(".env")) process.loadEnvFile(".env");

  const parsed = RegisterInput.safeParse({
    name: process.env.SEED_TEACHER_NAME,
    email: process.env.SEED_TEACHER_EMAIL,
    password: process.env.SEED_TEACHER_PASSWORD,
  });
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - SEED_TEACHER_${String(i.path[0]).toUpperCase()}: ${i.message}`);
    throw new Error(`Fix these in .env:\n${problems.join("\n")}`);
  }

  await connectDB();
  const existing = await User.findOne({ email: parsed.data.email }).lean();
  if (existing?.role === "student" && !process.argv.includes("--promote")) {
    throw new Error(
      `${parsed.data.email} already belongs to a STUDENT account. Use a different email, ` +
        "or run `npm run seed -- --promote` to turn that student into a teacher.",
    );
  }

  const teacher = await upsertTeacher(parsed.data);
  const action = !existing ? "created" : existing.role === "student" ? "promoted from student" : "updated";
  console.log(`Teacher ${action}: ${teacher.name} <${teacher.email}>`); // never print the password
}

main()
  .catch((error: unknown) => {
    console.error(`Seed failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
