# Phase v1/04 — Analytics: results & profile

| | |
|---|---|
| Status | done |
| Branch | `phase/v1-04-analytics` |
| Depends on | Phase v1/03 |
| Issues | 1.6, 2.2 |

## Goal
Teachers see how a quiz went at a glance; students see how they are doing over time.

## Previous phase summary
v1/03 (merged 6ebb611): leaderboard ties go to the earlier finish (D-059, supersedes D-025), boards show a "Finished"
column with seconds, the teacher attempt page and student result use stat tiles + answer tags, and accuracy is
correct ÷ answered ("No answers" when nothing was answered, D-060). Reuse here:
- `StatTile` / `StatGrid` (`src/components/results/stat-tile.tsx`) and `ResultCounts` (`result-counts.tsx`).
- `src/lib/attempt-stats.ts`: `durationMs`, `formatDuration`, `accuracy`, `formatPercent` (pure, tested in `.scratch/`).
- `LocalTime format="date"` (`src/lib/datetime.ts` `formatLocal`) for the date-only "Taken" column (2.2).
- Pages to change: `src/app/student/profile/page.tsx` (uses `listMyAttempts`) and
  `src/app/teacher/quizzes/[quizId]/results/page.tsx`.
- Release rules (D-049) still apply: never show marks or accuracy for unreleased results.

## In scope — exact features
1. **Stats helper**
   - Pure functions (no DB): count, mean, median, min, max, accuracy, score-percentage, histogram buckets.
   - Acceptance: `.scratch/` checks incl. empty list, one item, even/odd median, negative marks.
2. **Charts dependency** — user decision 2026-10-22 (stat cards + small charts)
   - shadcn `chart` component (adds `recharts`); justify in `decisions.md`. Charts only on analytics pages, never on exam screens.
3. **Teacher results analytics (1.6)**
   - Replace "1 submitted · 0 in progress · average 0 / 2" with stat tiles: Submitted, In progress, Average, Median,
     Highest, Lowest (marks / max), plus a score distribution chart. Stats use finished attempts only.
4. **Student profile analytics + table (2.2)**
   - Tiles: Tests taken, Average score %, Best score %, Accuracy; small score-% trend chart over time (released results only).
   - "Taken" column shows the date only; time moves out. Status stays its own column.
   - Unreleased results are excluded from stats (never leak marks before release).

## Out of scope
- Teacher's view of a single student (v1/05).

## Relevant docs
- `api-contracts.md` → `GET /api/v1/teacher/quizzes/:quizId/attempts`, `GET /api/v1/me/attempts`
- `decisions.md` → D-049 (release rules)

## Tasks
- [x] 04.1 — Stats helper → `feat(results): add stats helper`
- [x] 04.2 — Add shadcn chart + recharts → `chore(ui): add chart component`
- [x] 04.3 — Teacher results analytics section → `feat(teacher): add quiz results analytics`
- [x] 04.4 — Student profile analytics + date-only Taken column → `feat(student): add profile analytics`
- [x] 04.5 — Docs pass → `docs: update docs for phase v1/04`

## Done criteria
- [x] Lint + build pass; stats `.scratch/` checks pass
- [x] Charts readable in light and dark mode, have text alternatives, respect reduced motion
- [x] No unreleased marks visible to students anywhere
- [x] Docs match what was built; decisions logged

## How to verify
1. A quiz with 3+ finished attempts → check tiles against hand-computed numbers.
2. Student with several released results → profile tiles + trend; an unreleased one is excluded.

## Phase summary
- **Built:** pure stats helper (`src/lib/score-stats.ts`: summary, score %, pooled accuracy, 10% histogram);
  shadcn `chart` + recharts; teacher results page now shows six tiles (Submitted, In progress, Average, Median, Highest,
  Lowest) and a score distribution bar chart; student profile shows Tests taken, Average score, Best score, Accuracy and a
  score-over-time line chart, and the "Taken" column is date only. `/me/attempts` released scores now carry answer counts.
- **Key decisions:** D-061 (median, pooled accuracy, bucket edges, "Below 0%"), D-062 (recharts, one grey series, hidden
  data table, no animation), D-063 (released-only analytics, "Tests taken" counts all finished, trend drawn after hydration).
- **Known limitations:** the app has no dark-mode switch yet; dark was checked by forcing the `.dark` class. The trend chart
  needs 2+ released results. The teacher's Lowest/Highest show raw marks; negative marks print as "-2".
- **Next phase should know:** reuse `ProfileAnalytics`' logic for v1/05 (same four tiles + `ScoreTrendChart`), but feed it
  only this teacher's quizzes. Consider moving the tile maths into a shared helper then (D-063 "Revisit if").
  `useIsClient` (`src/lib/use-is-client.ts`) is the hook for anything that needs the viewer's time zone.

## Next phase preview
v1/05 reuses the stats helper and chart for the teacher's student page.
