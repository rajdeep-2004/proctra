# Progress

**Current phase:** 06 — Results, profile & leaderboard (`in-progress`)
**Branch:** `phase/06-results`
**Profile:** lean
**Deadline:** 2026-10-25 (packaged `.dmg` + README)

## Phases
| # | Phase | Status | Branch | Target | Started | Closed |
|---|---|---|---|---|---|---|
| 01 | Foundation | done | phase/01-foundation | 10-19 | 2026-10-19 | 2026-10-19 |
| 02 | Auth & roles | done | phase/02-auth | 10-20 | 2026-10-19 | 2026-10-19 |
| 03 | Quiz management | done | phase/03-quiz-management | 10-20 → 10-21 | 2026-10-19 | 2026-10-19 |
| 04 | Taking the exam | done | phase/04-exam | 10-21 → 10-22 | 2026-10-19 | 2026-10-19 |
| 05 | Kiosk window & camera | done | phase/05-kiosk-camera | 10-23 | 2026-10-19 | 2026-10-19 |
| 06 | Results, profile & leaderboard | in-progress | phase/06-results | 10-24 | 2026-10-20 | |
| 07 | Ship: packaging, README, polish | not-started | phase/07-ship | 10-25 | | |

Status values: `not-started` → `in-progress` → `review` → `done`

## Session log
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
- No rate limiting on API routes (system-design §11).
- Manual deploys only (`npx vercel deploy --prod` from `main` after each merge) (D-031).
- Auth.js is a pinned **beta** (`5.0.0-beta.32`); fallback plan is `jose` + own cookie (D-033).
- Sign-in has no rate limiting / lockout (brute-force possible; bcrypt cost slows it).
- No Content-Security-Policy header yet (Electron warns in dev). Add a CSP in phase 07 hardening.
- Snapshots have no automatic retention/deletion yet (PRD open question 1).

## Parked ideas
- Drag-and-drop question reordering (up/down buttons for now).
- Resume at the last viewed question instead of question 1.
- Retakes; cohort assignment; configurable snapshot interval; automated snapshot retention cleanup; Windows build; code signing (PRD §5 Later).
