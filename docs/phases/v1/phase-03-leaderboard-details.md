# Phase v1/03 — Leaderboard & attempt details

| | |
|---|---|
| Status | not-started |
| Branch | `phase/v1-03-leaderboard-details` |
| Depends on | Phase v1/02 |
| Issues | 1.4 (summary line), 1.5, 2.3 |

## Goal
Leaderboards show who finished when and break ties fairly; attempt and result pages present times and marks as
clear UI instead of one long text line.

## Previous phase summary
From v1/02 (Quiz list tabs, merged 2026-10-22):
- Both dashboards have URL tabs (`?tab=`, D-058) via `src/components/layout/link-tabs.tsx` and the pure `src/lib/quiz-tabs.ts`.
- Code this phase changes:
  - Ranking: `src/services/ranking.ts` (`competitionRank`, shared ranks, alphabetical within ties, D-025) with unit test
    `.scratch/ranking.test.ts` (update it: it encodes the old rule).
  - Leaderboard: `getLeaderboard()` in `src/services/results-service.ts` (currently selects `studentId, studentName, score`;
    needs `submittedAt`), UI `src/components/results/leaderboard-view.tsx` (polls every 10 s while live, D-049) and
    `leaderboard-page.tsx`; contract `GET /api/v1/quizzes/:quizId/leaderboard`.
  - Teacher attempt header: `src/app/teacher/attempts/[attemptId]/page.tsx` (`TeacherAttemptView` has `startedAt`,
    `submittedAt | null`, `score`). Student result: `src/app/student/attempts/[attemptId]/page.tsx`
    (`FinishedAttemptView` has `startedAt`, `submittedAt`, `score`, `released`).
- Auto-submitted attempts: check what `submittedAt` is set to (deadline vs. finalize time, D-006) before using it as the tiebreak.
- Browser harness: `.scratch/browser.mts` (`openBrowser`, `checker`); fixtures `.scratch/polish-setup.mts`, `v1-02-setup.mts`.
- Decisions: D-055 – D-058.

## In scope — exact features
1. **Ranking with time tiebreak (1.5)** — user decision 2026-10-22
   - Same marks → earlier `submittedAt` ranks higher (1, 2, 3). Ranks are shared only if marks AND submit time are equal.
   - Supersedes D-025 (shared ranks 1, 1, 3); new decision entry explains the change.
   - Acceptance: `.scratch/` unit checks for equal score / different time, equal score / equal time, and auto-submitted
     attempts (their `submittedAt` is the deadline).
2. **Leaderboard shows marks and end time (1.5, 2.3)** — for teacher and student boards.
   - API: leaderboard entries gain `submittedAt` (update `api-contracts.md` first). Still names + scores only.
3. **Teacher attempt header (1.4)**
   - Replace "Submitted - Started … · submitted … · 0 / 2 (…)" with a status badge plus stat tiles: Started, Ended,
     Duration, Marks (total / max), and Correct · Wrong · Unanswered tags.
4. **Student result page (2.3)**
   - Score card adds **duration** (submitted − started) and **accuracy** = correct ÷ answered (shows "–" when nothing answered).
   - Leaderboard link becomes a proper button (`Trophy` icon), not inline text.

## Out of scope
- Charts/analytics (v1/04).

## Relevant docs
- `api-contracts.md` → `GET /api/v1/quizzes/:quizId/leaderboard`
- `decisions.md` → D-025, D-049
- `database-schema.md` → attempts index `{ quizId, status, score.total }`

## Tasks
- [ ] 03.1 — Contract update + ranking by score then submit time → `feat(results): break leaderboard ties by finish time`
- [ ] 03.2 — Leaderboard table: end time column → `feat(results): show finish time on leaderboard`
- [ ] 03.3 — Teacher attempt header as badges + stat tiles → `feat(teacher): redesign attempt summary`
- [ ] 03.4 — Student result: duration, accuracy, leaderboard button → `feat(student): add duration and accuracy to result`
- [ ] 03.5 — Docs pass → `docs: update docs for phase v1/03`

## Done criteria
- [ ] Lint + build pass; ranking `.scratch/` checks pass
- [ ] Leaderboard API never exposes answers/events/snapshots (re-check)
- [ ] Docs match what was built; D-025 marked superseded

## How to verify
1. Two students submit with equal marks a minute apart → earlier one ranks higher on both boards.
2. Open a teacher attempt and a student result; compare with the old one-line summary.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
v1/04 adds the stats helper and charts.
