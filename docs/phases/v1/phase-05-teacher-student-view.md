# Phase v1/05 — Teacher's student view

| | |
|---|---|
| Status | not-started |
| Branch | `phase/v1-05-teacher-student-view` |
| Depends on | Phase v1/04 |
| Issues | 1.4 (student analytics) |

## Goal
A teacher can open any student who took their quizzes and see that student's performance across those quizzes.

## Previous phase summary
v1/04 (merged 96db24e): analytics on the teacher results page (six tiles + score distribution) and the student profile
(Tests taken, Average, Best, Accuracy + score-over-time chart). Reuse here:
- `src/lib/score-stats.ts`: `summarize`, `scorePercent`, `pooledAccuracy`, `histogram` (pure, `.scratch/score-stats.test.ts`), D-061.
- `ProfileAnalytics` (`src/components/results/profile-analytics.tsx`) holds the four-tile logic; v1/05 needs the same numbers
  scoped to one teacher's quizzes, so move that maths into a shared helper rather than copying it (D-063 "Revisit if").
- `ScoreTrendChart` (client; draws after hydration via `useIsClient`) and `StatTile`/`StatGrid`; charts use `--chart-2`, a hidden
  data table and no animation (D-062).
- Teachers see every finished attempt on their own quizzes, so the release rule (D-049) doesn't hide marks here; students do.
- Links to add: student names on `src/app/teacher/quizzes/[quizId]/results/page.tsx` (currently link to the attempt) and the
  teacher attempt page header.

## In scope — exact features
1. **Student page for teachers** — user decision 2026-10-22: this teacher's quizzes only
   - Route `/teacher/students/[studentId]`, linked from student names on the results table and attempt page.
   - Shows name, email, stat tiles (quizzes taken, average %, best %, accuracy), a score trend chart, and a history table
     (quiz, date, status, marks, link to the attempt).
   - Only attempts on quizzes owned by this teacher. A student with no attempts on this teacher's quizzes → 404
     (a teacher can't look up arbitrary students).
2. **API + data access**
   - `GET /api/v1/teacher/students/:studentId` added to `api-contracts.md` before code.
   - Query: teacher's quiz ids → attempts `{ studentId, quizId: { $in } }` (uses index `{ studentId, startedAt }`;
     confirm in `database-schema.md`).

## Out of scope
- A teacher-wide student directory / search.

## Relevant docs
- `api-contracts.md` → Teacher — results
- `database-schema.md` → attempts indexes
- `system-design.md` → ownership checks

## Tasks
- [ ] 05.1 — Contract + service (owner-scoped) + route handler → `feat(teacher): add student summary api`
- [ ] 05.2 — Student page UI + links from results/attempt → `feat(teacher): add student analytics page`
- [ ] 05.3 — Docs pass → `docs: update docs for phase v1/05`

## Done criteria
- [ ] Lint + build pass
- [ ] API checks in `.scratch/`: owner 200, other teacher 404, student 403, bad id 400/404
- [ ] Docs match what was built; decisions logged

## How to verify
1. Teacher A opens a student from a results table → sees only A's quizzes.
2. Teacher B opens the same URL → 404.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
v1/06 measures and fixes production page load times.
