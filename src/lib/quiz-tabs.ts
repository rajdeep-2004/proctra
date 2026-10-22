// Which dashboard tab a quiz belongs to (v1/02, D-058). Pure: no DB, no "server-only", so .scratch/ can test it.

export const TEACHER_TABS = ["all", "drafts", "live", "closed", "archived"] as const;
export type TeacherTab = (typeof TEACHER_TABS)[number];

export const STUDENT_TABS = ["current", "closed"] as const;
export type StudentTab = (typeof STUDENT_TABS)[number];

type TeacherQuizLike = { status: "draft" | "published" | "archived"; endsAt: string };

/**
 * The one specific tab a teacher's quiz sits in ("all" holds everything).
 * Published quizzes split on the end time: before it they are "live" (open or upcoming), after it "closed".
 */
export function teacherTabOf(quiz: TeacherQuizLike, now: Date): Exclude<TeacherTab, "all"> {
  if (quiz.status === "draft") return "drafts";
  if (quiz.status === "archived") return "archived";
  return now.getTime() >= new Date(quiz.endsAt).getTime() ? "closed" : "live";
}

/** Student tabs: "current" = open + upcoming, "closed" = past the end time. */
export function studentTabOf(availability: "upcoming" | "open" | "closed"): StudentTab {
  return availability === "closed" ? "closed" : "current";
}

/** Reads `?tab=` safely: anything unknown (or a repeated param) falls back to the first tab. */
export function parseTab<T extends string>(value: string | string[] | undefined, tabs: readonly T[]): T {
  return typeof value === "string" && (tabs as readonly string[]).includes(value) ? (value as T) : tabs[0];
}

/** Counts per tab, including "all". */
export function countTeacherTabs(quizzes: TeacherQuizLike[], now: Date): Record<TeacherTab, number> {
  const counts: Record<TeacherTab, number> = { all: quizzes.length, drafts: 0, live: 0, closed: 0, archived: 0 };
  for (const q of quizzes) counts[teacherTabOf(q, now)] += 1;
  return counts;
}
