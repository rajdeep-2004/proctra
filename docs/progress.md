# Progress

**Current release:** v1 (target tag `v1.0.0`, D-056)
**Current phase:** v1/06 — Release v1.0.0 (`in-progress`)
**Branch:** phase/v1-06-release
**Profile:** lean

## Phases
Phase files live in `docs/phases/vN/`; a phase id is `vN/NN` (D-055).

### v1 — next release (from the user's v1 issues list, planned 2026-10-22)
| # | Phase | Status | Branch | Issues | Started | Closed |
|---|---|---|---|---|---|---|
| 01 | Copy & navigation cleanup | done | phase/v1-01-copy-nav | 1.2, 1.3, 1.4, 2.3, 3.1, 3.2 | 2026-10-22 | 2026-10-22 |
| 02 | Quiz list tabs | done | phase/v1-02-quiz-tabs | 1.1, 2.1 | 2026-10-22 | 2026-10-22 |
| 03 | Leaderboard & attempt details | done | phase/v1-03-leaderboard-details | 1.4, 1.5, 2.3 | 2026-10-22 | 2026-10-22 |
| 04 | Analytics: results & profile | done | phase/v1-04-analytics | 1.6, 2.2 | 2026-10-22 | 2026-10-22 |
| 05 | Teacher's student view | done | phase/v1-05-teacher-student-view | 1.4 | 2026-10-22 | 2026-10-22 |
| 06 | Release v1.0.0 | in-progress | phase/v1-06-release | — | 2026-10-23 | |
| — | ~~Production performance~~ | dropped | — | 3.3 | 2026-10-22 | 2026-10-22 |

### v0 — shipped as v0.1.0 (deadline 2026-10-25 met)
| # | Phase | Status | Branch | Target | Started | Closed |
|---|---|---|---|---|---|---|
| 01 | Foundation | done | phase/01-foundation | 10-19 | 2026-10-19 | 2026-10-19 |
| 02 | Auth & roles | done | phase/02-auth | 10-20 | 2026-10-19 | 2026-10-19 |
| 03 | Quiz management | done | phase/03-quiz-management | 10-20 → 10-21 | 2026-10-19 | 2026-10-19 |
| 04 | Taking the exam | done | phase/04-exam | 10-21 → 10-22 | 2026-10-19 | 2026-10-19 |
| 05 | Kiosk window & camera | done | phase/05-kiosk-camera | 10-23 | 2026-10-19 | 2026-10-19 |
| 06 | Results, profile & leaderboard | done | phase/06-results | 10-24 | 2026-10-20 | 2026-10-20 |
| 07 | Ship: packaging, README, polish | done | phase/07-ship | 10-25 | 2026-10-20 | 2026-10-20 |

Status values: `not-started` → `in-progress` → `review` → `done`

## Session log
### 2026-10-23 (manual E2E test fixes)
- Database wiped and reseeded with 2 teachers + 5 students for the user's manual test (accounts in `.scratch/`, not committed).
- Fixed from the test: removed the "Live: ranks may change" and "Equal marks" notes from the leaderboard; the kiosk exam
  window now locks Space swiping even when the app was already full screen (D-066). User confirmed both in the dev app.
- Merged `fix/v1-kiosk-fullscreen-leaderboard-copy` to `main` and deployed. The .dmg gets the desktop fix in v1/06.
- Next: `/phase-start v1/06` (release v1.0.0).

### 2026-10-22 (v1/06 performance, dropped)
- Measured production before any change: functions run in `iad1` (Washington, D.C.), Atlas in Mumbai; warm API calls
  0.8–1.2 s, first request after 10 min idle 5.3 s; `/api/v1/me/attempts` hung twice early in a run (not reproduced on demand).
- User decision: drop the performance phase. They attribute the slowness to cold starts and find deeper tuning out of scope
  for a capstone (D-065). Old phase 07 (release) is now v1/06. Nothing was changed in code or production.
- Next: `/phase-start v1/06` (release v1.0.0).

### 2026-10-22 (phase v1/05)
- Done: tasks 05.1–05.3. Teacher's student page + API scoped to the teacher's own quizzes (D-064); tile maths shared with
  the profile (`historyStats`, `HistoryAnalytics`); names on results/attempt pages link to it.
- Verified: lint + build, unit tests (10 files; score-stats 11/11), API 13/13 (owner 200, other teacher 404, student 403,
  bad id 400, unknown 404 with the same message, signed out 401, no answers leaked), page 9/9 incl. 375px and other-teacher
  404, v1/04 profile re-run green.
- Note: older scratch fixtures expired when their quizzes closed (expected); re-run their setup scripts to reuse them.
- Follow-up: removed the "results on your quizzes only" note under the student's email (578a1b0, user request).
- Next: approved and merged to `main` (e2555fc); `/phase-start v1/06` (production performance).

### 2026-10-22 (phase v1/04)
- Done: tasks 04.1–04.5 + one refactor (reuse `useIsClient`). Stats helper (D-061), recharts via shadcn chart (D-062),
  teacher results tiles + distribution, student profile tiles + trend + date-only Taken (D-063).
- Verified: lint + build, unit tests (9 files, new score-stats 8/8), browser/API checks: teacher 5/5, profile 7/7, 375px 2/2,
  plus v1/01 and v1/03 page checks re-run green. Fixture with negative marks, an in-progress attempt and an unreleased result.
- Next: approved and merged to `main` (96db24e); `/phase-start v1/05` (teacher's student view).

### 2026-10-22 (phase v1/03)
- Done: tasks 03.1–03.5. Earlier finish wins ties (D-059, supersedes D-025); finish times on boards; attempt summaries as tiles + tags; result duration/accuracy (D-060).
- Verified: lint + build, unit tests (8 files), browser/API checks 20/20 incl. unreleased results showing nothing extra.
- Follow-up: removed the "Correct out of answered" hint from the student Accuracy tile (1ae9b0a, user request).
- Next: approved and merged to `main` (6ebb611); `/phase-start v1/04` (analytics).

### 2026-10-22 (phase v1/02)
- Done: tasks 02.1–02.4. URL tabs on both dashboards + teacher title search (D-058).
- Verified: lint + build, unit tests (7 files incl. new quiz-tabs 5/5), browser checks 15/15 with fixtures in every state.
- Merge: an uncommitted editor change (`parse,Tab`) was committed with the user's comment removal and merged while lint was failing (my chained command didn't stop on the error). Fixed in d30df07 and re-merged (9ca4958); lint + build green on `main`. Merge steps now stop on the first failure.
- Next: approved and merged to `main`; `/phase-start v1/03` (leaderboard & attempt details).

### 2026-10-22 (phase v1/01)
- Done: tasks 01.1–01.4. Header simplified, shared back button, em dashes removed from all UI copy, results disclaimer removed (D-057).
- Verified: lint + build, scratch unit tests (6/6 files), signed-in browser check of 9 pages (9/9).
- Next: approved and merged to `main` (0b292a8); `/phase-start v1/02` (quiz list tabs).

### 2026-10-22 (v1 planning)
- Done: brainstormed the v1 issues list with the user; phases moved to `docs/phases/v0/`, v1 plan in `docs/phases/v1/` (7 phases); global phase rules/commands now take `vN/NN` ids (D-055); release tag v1.0.0 (D-056); issues file removed (content lives in the phase files).
- User decisions: earlier finish wins leaderboard ties; stat cards + small charts (recharts); teacher's student page scoped to their own quizzes; tabs for quiz lists.
- Next: `/phase-start v1/01`.
- Answered: Atlas cluster is AWS ap-south-1 (Mumbai), used in v1/06; keep en dashes in time ranges.

### 2026-10-20 (post-release)
- Done: GitHub Release v0.1.0 with both installers (https://github.com/rajdeep-2004/proctra/releases/tag/v0.1.0); README links to the latest release.

### 2026-10-20 (phase 07)
- Done: tasks 07.1–07.6 — .dmg packaging (now per-chip, D-054), snapshot gallery (8/8), DevClub counter + GSAP (regressions green), README (industry-style, no "capstone"), production deployed and verified end to end by the user from the installed .dmg.
- Found + fixed: Vercel upload failed on the 218 MB .dmg (`.vercelignore` now excludes `release/`); shared .dmg blocked by Gatekeeper and 518 MB (universal) → per-chip installers + per-macOS install steps.
- Next: phase 07 approved and merged to `main` (02e7cd9); production redeployed from `main`. Project complete.
- Blockers: none. Deadline 2026-10-25 met early.

### 2026-10-20 (phase 06)
- Done: tasks 06.1–06.5 — student profile (9/9), teacher results + attempt detail (16/16), live leaderboard (15/15 + ranking unit tests + live browser update), result release end to end (11/11).
- User decision: live leaderboard for students who finished, updating as others finish (D-049).
- Next: phase 06 approved, merged to `main` (c82a487) and deployed; `/phase-start 07` (packaging .dmg, README, snapshot gallery, polish).
- Blockers: none. Schedule: ahead (deadline 2026-10-25).

### 2026-10-19 (phase 05)
- Done: tasks 05.1–05.5 — desktop bridge + kiosk window, camera gate + desktop-only, event log + camera-loss overlay (11/11 API), snapshots to private Cloudinary (8/8 API + live privacy check).
- Fixed: kiosk exit left the result window off-screen (macOS Spaces, D-047) — found in the user's real run, confirmed fixed by the user.
- Fixed: Cmd+Q did nothing in the kiosk exam (macOS kiosk disables the app menu) → scoped Cmd+Q shortcut quits; resume works (D-048, user-confirmed).
- Cloudinary setup issues resolved with the user: empty secret, disabled key, key role without "create".
- Next: phase 05 approved, merged to `main` (df73bb4) and deployed; `/phase-start 06` (results, profile, leaderboard).
- Blockers: none. Schedule: ahead.

### 2026-10-19 (phase 04)
- Done: tasks 04.1–04.6 — attempt model + grading, attempt API (32/32 checks), exam UI, autosave queue (8 unit + offline/reload e2e), submit/auto-submit/result/resume.
- Note: during one timed test, answers appeared that the script didn't click (likely manual clicks in the visible test window); a clean timestamped re-run confirmed correct timing and grading.
- Next: phase 04 approved, merged to `main` (aa1404c) and deployed; `/phase-start 05` (kiosk window + camera).
- Blockers: Cloudinary account + keys needed for phase 05. Schedule: ahead (phases 01–04 done on day 1).

### 2026-10-19 (phase 03)
- Done: tasks 03.1–03.5 — quiz model + validation, teacher API (24/24 checks), editor + dashboard, student list/detail (15 checks + screenshots).
- Found: user's long-running `next dev` stopped running the proxy (restart fixes); `next start` locally needs `AUTH_TRUST_HOST=true`.
- Change request: fixed exam slot (start/end, derived duration), extend-only end time, live countdown (03.6–03.8, D-041). Found + fixed a Zod refine crash (no-timezone date → 500).
- Next: phase 03 approved, merged to `main` (3976d07) and deployed; `/phase-start 04` (biggest phase: exam, autosave, grading).
- Blockers: none. Schedule: on track (phase 03 finished on day 1).

### 2026-10-19 (phase 02)
- Done: tasks 02.1–02.6 — registration, Auth.js sign-in/out, requireUser/requirePageUser, proxy redirects, dashboard shells, teacher seed. Verified locally, in Electron and on a Vercel preview.
- Fixed along the way: Next 16 proxy export shape, Cache Components "blocking route" from auth(), sign-out lost on Electron crash.
- Next: phase 02 approved and merged to `main` (ed8565d) and deployed to production; `/phase-start 03`.
- Blockers: none.

### 2026-10-19 (phase 01)
- Done: tasks 01.1–01.7 — Next.js + shadcn scaffold, env loader, DB + health, Electron shell, Vercel deploy (https://proctra-mu.vercel.app).
- Next: phase 01 approved and merged to `main` (bc8002f); `/phase-start 02`.
- Blockers: none.

### 2026-10-19
- Done: kickoff interview; PRD, architecture, system design, schema, API contracts, decisions D-001–D-025, phase plan.
- Next: `/phase-start 01`.
- Blockers: none. User needs MongoDB Atlas, Cloudinary and Vercel accounts before phases 01/05.

## Known debt
- Vercel functions run in `iad1`, far from the Atlas cluster (Mumbai): every DB round trip crosses the world; cold start ~5 s.
  A rare long hang was seen on `/api/v1/me/attempts` (D-065).
- No rate limiting on API routes (system-design §11).
- Manual deploys only (`npx vercel deploy --prod` from `main` after each merge) (D-031).
- Auth.js is a pinned **beta** (`5.0.0-beta.32`); fallback plan is `jose` + own cookie (D-033).
- Sign-in has no rate limiting / lockout (brute-force possible; bcrypt cost slows it).
- No Content-Security-Policy header yet (Electron warns in dev). Add a CSP in phase 07 hardening.
- Snapshots have no automatic retention/deletion yet (PRD open question 1).

## Parked ideas
- Production performance (ex v1/06, D-065): pin functions to `bom1` (Mumbai) via `vercel.json` `regions`; add
  `socketTimeoutMS` / `maxIdleTimeMS` to the Mongo connection; re-measure with `.scratch/perf.mts`.
- Drag-and-drop question reordering (up/down buttons for now).
- Pluralize counts on student quiz cards ("1 questions" → "1 question"); found in v1/02.
- Resume at the last viewed question instead of question 1.
- Developer ID signing + notarization (removes Gatekeeper steps).
- Retakes; cohort assignment; configurable snapshot interval; automated snapshot retention cleanup; Windows build; code signing (PRD §5 Later).
