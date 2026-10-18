# Phase 01 — Foundation

| | |
|---|---|
| Status | in-progress |
| Branch | `phase/01-foundation` |
| Depends on | — |
| PRD features | groundwork for all (F-14 deploy path) |
| Target | 2026-10-19 (day 1) |

## Goal
A Next.js app with Tailwind + shadcn/ui, validated env config, a working MongoDB connection and health
endpoint, an Electron shell that loads it, and a first manual Vercel deploy.

## Previous phase summary
None — first phase. Planning docs are complete (prd, architecture, system-design, schema, API).

## In scope — exact features
1. **Next.js skeleton**
   - Acceptance: `npm run dev` serves a landing page at `http://localhost:3000` styled with Tailwind + a shadcn `Button`.
2. **Config**
   - Acceptance: `src/lib/env.ts` validates env with Zod and fails fast with a clear message; `.env.example` lists every key; `.env` exists with placeholders.
3. **DB + API conventions**
   - Acceptance: `GET /api/v1/health` returns `{ data: { ok: true, db: "up" } }` with a real Atlas URI, and `503` with `db: "down"` when the URI is wrong. `AppError` + `withHandler` produce the error shape from `api-contracts.md`.
4. **Electron shell**
   - Acceptance: `npm run electron` opens a window loading `PROCTRA_APP_URL`; security flags per D-009; navigation outside the app origin is blocked; an offline screen with Retry appears if the server is down. Preload exposes only `window.proctra.isDesktop`.
5. **First deploy**
   - Acceptance: the app is live on a Vercel URL and `/api/v1/health` returns `db: "up"` there.

## Out of scope
- Auth, models, any feature UI (phase 02+). Kiosk window, camera IPC (phase 05). Packaging (phase 07).

## Relevant docs
- `architecture.md` → §4 layout, §6 layering, §9 errors, §10 config
- `api-contracts.md` → conventions, `GET /health`
- `decisions.md` → D-002, D-003, D-004, D-009, D-011

## Tasks
- [x] 01.1 — Scaffold Next.js (App Router, TS, Tailwind, ESLint, `src/`), npm scripts → `chore: scaffold next.js app`
- [x] 01.2 — Init shadcn/ui, base layout + landing page → `chore(ui): set up shadcn/ui and base layout`
- [x] 01.3 — `lib/env.ts` (Zod), `.env.example`, `.env` placeholders → `feat(config): add validated env loader`
- [x] 01.4 — `lib/db.ts` cached Mongoose connection, `lib/api-response.ts` (`AppError`, `withHandler`), `GET /api/v1/health` → `feat(api): add db connection and health endpoint`
- [x] 01.5 — Electron main + preload (TS → `electron/dist`), security flags, origin allow-list, offline screen, `npm run electron` → `feat(desktop): add electron shell`
- [x] 01.6 — Vercel project + env vars, first deploy (user runs login) → `chore(deploy): configure vercel deployment`
- [ ] 01.7 — Update docs touched by this phase → `docs: update docs for phase 01`

## Done criteria
- [ ] `npm run dev`, `npm run build` and `npm run lint` succeed with no errors
- [ ] Health endpoint returns `db: "up"` locally and on Vercel
- [ ] Electron window shows the app; external navigation blocked
- [ ] No secrets committed; `.env` gitignored
- [ ] Docs match what was built; decisions logged

## How to verify
1. Fill real `MONGODB_URI` in `.env` → `npm run dev` → open `/api/v1/health`.
2. Break the URI → health returns `503`.
3. `npm run electron` (with dev server running) → app window loads; stop dev server → offline screen.
4. Open the Vercel URL `/api/v1/health`.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
Phase 02 adds users, Auth.js sign-in/sign-up, role routing and the teacher seed script — it needs `lib/db.ts`, `lib/env.ts` and `withHandler` from this phase.
