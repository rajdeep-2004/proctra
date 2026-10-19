# Phase 02 — Auth & roles

| | |
|---|---|
| Status | in-progress |
| Branch | `phase/02-auth` |
| Depends on | Phase 01 |
| PRD features | F-01 |
| Target | 2026-10-20 (day 2) |

## Goal
Students can sign up, everyone can sign in and out, users land on their role's dashboard, and every
teacher-only route rejects students on the server.

## Previous phase summary
From phase 01 (Foundation, merged 2026-10-19):
- **Exists:** Next.js 16.4 + Tailwind v4 + shadcn/ui (Radix, `Button` only); landing page with a disabled
  "Sign in" button to wire up; `env()` in `src/lib/env.ts` (only `MONGODB_URI` so far); `connectDB()` in
  `src/lib/db.ts`; `AppError`, `withHandler`, `ok`, `created` in `src/lib/api-response.ts`;
  `GET /api/v1/health`; Electron shell with persistent session partition `persist:proctra` (cookies survive
  restarts); production at https://proctra-mu.vercel.app.
- **Rely on:** handler pattern `export const POST = withHandler(async (req) => …)`; Zod errors auto-map to 400;
  call `await connection()` in GET handlers; scratch checks run with `npx tsx --conditions=react-server --test`.
- **Watch out:** Next.js 16.4 + Cache Components — read `node_modules/next/dist/docs/` first (route guards
  are `proxy.ts`; session reads go inside `<Suspense>`). Verify Auth.js v5 works with this before building on
  it (fallback in D-005: `jose` + own cookie).
- **New env keys this phase:** `AUTH_SECRET`, `SEED_TEACHER_EMAIL`, `SEED_TEACHER_PASSWORD`, `SEED_TEACHER_NAME`
  — add to `.env.example`, `.env` (user fills real values) and Vercel.
- Decisions: D-026 – D-031.

## In scope — exact features
1. **User model + registration**
   - Acceptance: `POST /api/v1/auth/register` creates a `student` (bcryptjs hash); duplicate email → `409`; a `role` in the body is ignored.
2. **Auth.js sign-in**
   - Acceptance: Credentials sign-in with JWT cookie (12 h); wrong credentials show a generic error; sign-out works; session survives an Electron restart.
3. **Role routing + guards**
   - Acceptance: `/student/*` and `/teacher/*` redirect to the right place by role; `requireUser(role)` returns `401`/`403` from API routes; `GET /api/v1/me` works.
4. **Dashboard shells**
   - Acceptance: empty student and teacher dashboards with header (name, sign-out).
5. **Teacher seed script**
   - Acceptance: `npm run seed` creates/updates the teacher from `SEED_TEACHER_*` env; running it twice doesn't duplicate.

## Out of scope
- Password reset, email verification, profile editing, admin UI.

## Relevant docs
- `database-schema.md` → User
- `api-contracts.md` → Auth, `GET /me`
- `architecture.md` → §8 auth
- `decisions.md` → D-005, D-023

## Tasks
- [x] 02.1 — User model, register Zod schema, user service, `POST /api/v1/auth/register` → `feat(auth): add user model and student registration`
- [x] 02.2 — Auth.js config (Credentials, JWT callbacks), `requireUser`, `GET /api/v1/me`, Electron persistent session partition → `feat(auth): add credentials sign-in and role helpers`
- [x] 02.3 — Sign-in / sign-up pages (shadcn forms), sign-out → `feat(auth): add sign-in and sign-up pages`
- [ ] 02.4 — Route guard (middleware/proxy) + student/teacher dashboard shells → `feat(auth): add role routing and dashboard shells`
- [ ] 02.5 — `scripts/seed-teachers.ts` + `npm run seed` (tsx) → `feat(auth): add teacher seed script`
- [ ] 02.6 — Update docs → `docs: update docs for phase 02`

## Done criteria
- [ ] Student can sign up → lands on `/student`; seeded teacher signs in → lands on `/teacher`
- [ ] Student visiting `/teacher` is redirected; student calling a teacher API gets `403` (checked with curl/scratch script)
- [ ] Passwords never appear in responses or logs
- [ ] Works inside the Electron window, session persists across restart
- [ ] Docs match what was built; decisions logged

## How to verify
1. `npm run seed` → sign in as teacher. 2. Sign up a student in Electron, quit, reopen → still signed in.
3. `.scratch/auth-check.mjs`: call `/api/v1/me` without cookie (401) and a teacher route with a student cookie (403).

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
Phase 03 builds quiz management on top of `requireUser("teacher")` and the dashboard shells.
