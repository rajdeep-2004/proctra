# Phase 06 — Results, profile & leaderboard

| | |
|---|---|
| Status | review |
| Branch | `phase/06-results` |
| Depends on | Phase 05 |
| PRD features | F-09 (teacher view), F-11, F-12, F-13 |
| Target | 2026-10-24 |

## Goal
Students see their attempt history and marks; teachers see submissions, per-attempt details with the
event log, and a leaderboard with competition ranking, all respecting result release.

## Previous phase summary
From phase 05 (Kiosk window & camera, merged 2026-10-19), building on phase 04's attempts:
- **Exists for results:** finished attempts store `score` ({ total, correct, incorrect, unanswered, maxPossible }), `status`
  (`submitted` / `auto_submitted`), `submittedAt`, `studentName` (D-021). Student result page `/student/attempts/[id]` already
  respects `resultsReleaseAt` (`getAttemptForStudent` → `released`). Grading: `src/services/grading.ts` (`resultFor` per question).
- **Ready-made helpers:** `finalizeExpiredForQuiz(quizId)` and `finalizeExpiredForStudent(studentId)` (attempt-service) — call before
  any list; `snapshotCounts(attemptIds)` (snapshot-service), `eventCounts(attemptIds)` (proctor-service); events timeline
  `ProctorEvent.find({ attemptId }).sort({ occurredAt: 1 })`; `signedImageUrl(publicId)` for S-01 (phase 07).
- **Indexes in place:** `attempts {studentId, startedAt}` (profile), `{quizId, status, score.total}` (submissions/leaderboard).
- **Rules:** teacher sees only quizzes they own (reuse `loadOwned` pattern in quiz-service); student never sees another student's
  attempt (404) and only released results; leaderboard = competition ranking (1, 1, 3, D-025), name + score only, never events or
  snapshots; event wording neutral ("window lost focus at …").
- **Testing:** `.scratch/http.mts` (+ `newStudent`), `.scratch/mk-exam.mts`, `.scratch/attempt-api.check.mts`; re-seed
  `t2@scratch.test` after cleanup; local prod server needs `AUTH_TRUST_HOST=true`; the user's `next dev` runs on :3000.
- Decisions: D-045 – D-048.

## In scope — exact features
1. **Student profile**
   - Acceptance: `/student/profile` lists own attempts (quiz, date, status, marks if released) via `GET /me/attempts`; each opens the result page.
2. **Teacher submissions**
   - Acceptance: quiz page shows submissions table (name, status, marks, event count, snapshot count) after lazy finalization.
3. **Teacher attempt detail**
   - Acceptance: per-question breakdown (selected vs correct) and neutral event timeline.
4. **Leaderboard**
   - Acceptance: ranks 1, 1, 3 for tied scores; teacher always sees it; students only after release, with their own row highlighted; no snapshots/events exposed.
5. **Result release**
   - Acceptance: with `resultsReleaseAt` in the future, student result/profile/leaderboard hide marks and show the release time; they appear after it passes.

## Out of scope
- Snapshot gallery (phase 07, S-01). Exports/CSV, charts.

## Relevant docs
- `api-contracts.md` → `GET /me/attempts`, Teacher — results, Leaderboard
- `database-schema.md` → Attempt indexes, §4 access patterns
- `system-design.md` → leaderboard flow
- `decisions.md` → D-021, D-023, D-024, D-025

## Tasks
- [x] 06.1 — `GET /me/attempts` + student profile page → `feat(results): add student attempt history`
- [x] 06.2 — Teacher submissions + attempt detail routes and pages → `feat(results): add teacher submissions and attempt detail`
- [x] 06.3 — Leaderboard service (competition ranking) + route + teacher/student pages → `feat(results): add quiz leaderboard`
- [x] 06.4 — Result-release enforcement across result/profile/leaderboard → enforcement was built into each view (04.2, 06.1, 06.3);
  this task verified it end to end (11/11) → `docs: verify result release across result, profile and leaderboard`
- [x] 06.5 — Update docs → `docs: update docs for phase 06`

## Done criteria
- [x] With 3 students (two tied), leaderboard shows 1, 1, 3
- [x] Student A cannot fetch student B's attempt (404) — scratch script
- [x] Hidden results stay hidden until release time, then appear
- [x] Docs match what was built; decisions logged

## How to verify
1. Seed 3 student attempts on one quiz with tied scores. 2. Check teacher + student views.
3. `node --test .scratch/ranking.test.mjs`; `.scratch/access-check.mjs`.

## Phase summary
- **Built:** Student **Profile** (`/student/profile`, `GET /me/attempts`) with every attempt incl. in-progress (Resume) and released
  marks; header nav. Teacher **Results** (`/teacher/quizzes/[id]/results`): submissions sorted by score with status, marks, event and
  snapshot counts, average; **attempt detail** (`/teacher/attempts/[id]`): answers vs correct, review flags, neutral event timeline with
  gap durations. **Live leaderboard** (`/…/quizzes/[id]/leaderboard`, `GET /quizzes/:id/leaderboard`): competition ranking, visible to
  the owner teacher and to students who finished (after release), refreshes every 10 s while anyone is still writing. Result release
  verified across result page, profile and leaderboard.
- **Key decisions:** D-049 (live leaderboard rules, profile includes active attempts), D-050 (teacher results service, sorting, event
  pairing); ranking implements D-025.
- **Known limitations:** Polling, not push (10 s). No pagination (lists capped at 1 000). No CSV export or charts. Teachers can't see
  snapshot images yet (S-01, phase 07). The student leaderboard link shows on the quiz page even before release (it then explains why
  it's unavailable).
- **Next phase should know:**
  - Snapshot gallery (S-01): add `GET /api/v1/teacher/attempts/:id/snapshots` using `signedImageUrl(publicId)` from `src/lib/cloudinary.ts`
    and the existing owner check pattern in `results-service.ts`; render it on `/teacher/attempts/[id]` (the "Snapshots" card is ready).
  - Packaging: Electron loads `PROCTRA_APP_URL` (dev `.env`; the packaged app must bake in https://proctra-mu.vercel.app — D-012/D-030).
    `NSCameraUsageDescription` must be in the packaged Info.plist or the camera prompt never appears.
  - Production needs `AUTH_TRUST_HOST` only off Vercel; on Vercel it's automatic.
  - Known debt to consider in hardening: CSP header, rate limiting, snapshot retention.

## Next phase preview
Phase 07 packages the `.dmg`, deploys to production, writes the README, then adds should-haves if time remains.
