# Progress

**Current phase:** 02 — Auth & roles (`not-started`)
**Branch:** —
**Profile:** lean
**Deadline:** 2026-10-25 (packaged `.dmg` + README)

## Phases
| # | Phase | Status | Branch | Target | Started | Closed |
|---|---|---|---|---|---|---|
| 01 | Foundation | done | phase/01-foundation | 10-19 | 2026-10-19 | 2026-10-19 |
| 02 | Auth & roles | not-started | phase/02-auth | 10-20 | | |
| 03 | Quiz management | not-started | phase/03-quiz-management | 10-20 → 10-21 | | |
| 04 | Taking the exam | not-started | phase/04-exam | 10-21 → 10-22 | | |
| 05 | Kiosk window & camera | not-started | phase/05-kiosk-camera | 10-23 | | |
| 06 | Results, profile & leaderboard | not-started | phase/06-results | 10-24 | | |
| 07 | Ship: packaging, README, polish | not-started | phase/07-ship | 10-25 | | |

Status values: `not-started` → `in-progress` → `review` → `done`

## Session log
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

## Parked ideas
- Retakes; cohort assignment; configurable snapshot interval; automated snapshot retention cleanup; Windows build; code signing (PRD §5 Later).
