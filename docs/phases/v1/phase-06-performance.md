# Phase v1/06 — Production performance

| | |
|---|---|
| Status | not-started |
| Branch | `phase/v1-06-performance` |
| Depends on | Phase v1/05 |
| Issues | 3.3 |

## Goal
Pages load noticeably faster in production (browser and `.dmg`), with before/after numbers to prove it.

## Previous phase summary
v1/05 (merged e2555fc): teacher's student page `/teacher/students/[id]` + `GET /api/v1/teacher/students/:id`, scoped to the
teacher's own quizzes with one enumeration-safe 404 (D-064). Tile maths is shared via `historyStats` / `HistoryAnalytics`.
Things to know for performance work:
- **Production still runs v0.1.0 code.** v1/01–v1/05 are merged to `main` but not deployed (deploys are manual,
  `npx vercel deploy --prod` from `main`, D-031). Decide whether the baseline measures the deployed v0 build or a fresh
  v1 deploy, and say which in the decision entry.
- Pages added in v1 that belong in the timings: teacher results (analytics + recharts), student profile (analytics),
  teacher student page (quizzes → exists → finalize → user + attempts in parallel).
- Read pages that write: `listSubmissions` and `getLeaderboard` call `finalizeExpiredForQuiz`; `listMyAttempts` and
  `getStudentForTeacher` call `finalizeExpiredForStudent` (D-006 lazy finalization).
- Scratch fixtures (@scratch.test users, `t2`/`t3@scratch.test` teachers) live in the `.env` database; run
  `.scratch/cleanup-users.mts` before the v1.0.0 release.

## In scope — exact features
1. **Measure first** (user: slowness is in production / `.dmg`)
   - Time key pages and APIs on production (TTFB, total) with a signed-in cookie; repeat for warm vs cold.
   - Record the Vercel function region. Atlas cluster region: **AWS ap-south-1 (Mumbai)** (user, 2026-10-22).
     Vercel's closest function region is `bom1` (Mumbai); the Vercel default is `iad1` (Washington, D.C.), so check this first.
2. **Fix what the numbers show.** Candidates found during planning (not yet confirmed):
   - Vercel function region far from the Atlas region → set the function region next to the database.
   - Session read twice per page (header `UserMenu` + page body) → dedupe with React `cache()`.
   - Read pages calling `finalizeExpiredForQuiz` (a DB write) on every view.
   - Sequential DB calls that could run in parallel; missing `loading.tsx` for instant navigation feedback.
3. **Verify** — same measurements after the fix, recorded in the decision entry.

## Out of scope
- Moving off Vercel/Atlas; caching that could show stale marks or stale availability.

## Relevant docs
- `system-design.md` → request flow, caching, D-026 (Suspense + session)
- `architecture.md` → hosting

## Tasks
- [ ] 06.1 — Baseline measurements + findings in `decisions.md` → `docs(perf): record production baseline`
- [ ] 06.2+ — One commit per fix, as found → `perf(<area>): …`
- [ ] 06.n — After-measurements + docs pass → `docs: update docs for phase v1/06`

## Done criteria
- [ ] Before/after table for the measured pages; clear improvement on the slowest ones
- [ ] No behavior change (exam, autosave, results release rules still correct)
- [ ] Docs match what was built; decisions logged

## How to verify
1. Re-run the measurement script against production after deploy.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
v1/07 tags and ships v1.0.0.
