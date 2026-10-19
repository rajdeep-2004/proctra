# Architecture

> Last updated: 2026-10-19 (phase 01 close) — Static structure of the system. Runtime behavior lives in system-design.md.

## 1. Overview
Proctra is **one Next.js application** (UI + server-side route handlers) deployed on Vercel, wrapped
by a **thin Electron shell** for macOS. Electron does not contain business logic or secrets: it opens
the hosted app in a window, opens the kiosk-style exam window, grants camera permission, and reports
window events through a narrow preload bridge. All authorization, deadlines, grading and storage
happen in Next.js route handlers, which talk to **MongoDB Atlas** (via Mongoose) and **Cloudinary**
(snapshot images).

## 2. Component diagram
```mermaid
flowchart LR
  subgraph Mac["Student/teacher Mac"]
    Main[Electron main process]
    Pre[Preload bridge<br/>window.proctra]
    Win[Main window<br/>dashboards]
    Exam[Exam window<br/>kiosk]
    Main --> Win
    Main --> Exam
    Pre -. IPC .- Main
  end
  Win -- HTTPS --> Next
  Exam -- HTTPS --> Next
  subgraph Vercel
    Next[Next.js app<br/>pages + /api/v1 route handlers]
  end
  Next --> DB[(MongoDB Atlas)]
  Next --> CL[(Cloudinary<br/>private snapshots)]
```

## 3. Tech stack
| Layer | Choice | Why (link decision) |
|---|---|---|
| Desktop shell | Electron 44.9 (Node 24) + electron-builder (phase 07) | D-002, D-012 |
| Frontend | Next.js 16.4 (App Router, Cache Components) + React 19.3 + TypeScript | D-003 |
| Styling / UI | Tailwind CSS + shadcn/ui; DevClub UI + GSAP only in polish | D-015 |
| Backend | Next.js route handlers under `/api/v1` + service layer | D-003 |
| Validation | Zod | D-011 |
| Database | MongoDB Atlas (free tier) + Mongoose | D-004 |
| Auth | Auth.js (NextAuth v5) Credentials provider, JWT session cookie, bcryptjs | D-005 |
| Image storage | Cloudinary (`type: authenticated`, server-side upload) | D-008 |
| Cache / queue | None | D-014 |
| Hosting | Vercel project `proctra`, manual `vercel deploy --prod` from the CLI → https://proctra-mu.vercel.app | D-002, D-031 |
| Package manager | npm | D-015 |

## 4. Codebase layout
```
proctra/
├── electron/               # Electron main + preload (TypeScript, compiled to electron/dist/)
│   ├── main.ts             # windows, kiosk exam window, permissions, IPC handlers
│   ├── preload.ts          # exposes window.proctra (narrow API only)
│   ├── offline.html        # shown when the app URL can't be reached
│   ├── build/              # macOS entitlements, icon (phase 07)
│   └── tsconfig.json
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # sign-in, sign-up pages
│   │   ├── student/        # student dashboard, quiz detail, profile, results
│   │   ├── teacher/        # teacher dashboard, quiz editor, submissions, leaderboard
│   │   ├── exam/[attemptId]/ # exam page (loaded inside the kiosk window)
│   │   └── api/v1/         # route handlers (thin: auth → validate → service → respond)
│   ├── components/
│   │   ├── ui/             # shadcn/ui generated components (not hand-edited much)
│   │   ├── auth/, layout/  # sign-in/up forms, app header
│   │   ├── quiz/           # quiz editor, question card, status/availability badges
│   │   └── local-time.tsx  # renders an instant in the viewer's time zone (D-039)
│   ├── auth.ts, auth.config.ts # Auth.js setup (full / proxy-safe shared part)
│   ├── lib/                # server: db, env, api-response, session · browser: api-client, datetime, use-is-client · utils (cn) · later: cloudinary (05), desktop (05)
│   ├── models/             # Mongoose models (User, Quiz, Attempt, Snapshot, ProctorEvent)
│   ├── schemas/            # Zod request schemas, shared by route handlers and forms
│   ├── services/           # business logic: quiz, attempt, grading, leaderboard, snapshot
│   └── types/              # shared TS types, window.proctra typing
├── scripts/                # seed-teachers.ts (run with tsx)
├── docs/
├── electron-builder.yml    # .dmg packaging config
└── package.json            # single package for Next.js + Electron
```
- `electron/` — only desktop concerns. **Must not** import from `src/`, hold secrets, or talk to the DB.
- `src/app/api/v1/` — HTTP only. **Must not** contain business rules or Mongoose queries.
- `src/services/` — all business rules and DB access. **Must not** read `Request`/cookies directly.
- `src/models/` — schemas and indexes only. No business logic.
- `src/components/` — UI only. **Must not** import models or services (server components in `app/` may call services for reads).
- `scripts/` — one-off admin scripts; never imported by the app.

## 5. Modules and responsibilities
| Module | Owns | Depends on | Must not |
|---|---|---|---|
| Electron main | Windows, kiosk mode, camera permission, navigation allow-list, IPC | APP_URL config | Hold DB/Cloudinary secrets; trust renderer input without validation |
| Preload bridge | `window.proctra` API (start/end exam, window events) | Electron `contextBridge`, `ipcRenderer` | Expose `ipcRenderer`, Node, or fs to the page |
| Auth (`src/auth.ts`, `lib/session.ts`) | Sign-in, session cookie, `requireUser(role?)` helper | User model, bcryptjs | Be bypassed by any `/api/v1` handler |
| Quiz service | Quiz CRUD, publish/unpublish/archive, edit lock | Quiz, Attempt models | Return `correctOption` to students |
| Attempt service | Start/resume, save answer, submit, lazy finalization | Quiz, Attempt, grading | Trust client time, score or role |
| Grading service | Score computation (pure function) | none | Touch the DB |
| Leaderboard service | Competition ranking per quiz | Attempt model | Expose snapshots/events |
| Snapshot service | Upload to Cloudinary, record metadata, signed URLs | Cloudinary SDK, Snapshot model | Store image bytes in MongoDB |
| Proctor events | Record and list window/camera events | ProctorEvent model | Label events as cheating |

## 6. Layering rules
```
page / client component ──fetch──▶ route handler ──▶ service ──▶ model ──▶ MongoDB
server component (reads) ─────────────────────────▶ service
```
- Route handlers do exactly: `requireUser(role)` → parse body/params with Zod → call one service
  function → wrap result in the standard response shape.
- Services receive plain values (`userId`, `role`, parsed input) and throw typed `AppError`s.
- Only services import models. Only `lib/db.ts` opens the connection.
- Client components never import server-only modules (`server-only` package guard on lib/services).

## 7. External services
| Service | Used for | Failure impact |
|---|---|---|
| MongoDB Atlas | All persistent data | App unusable; API returns 500, UI shows retry |
| Cloudinary | Storing snapshot JPEGs (private) | Snapshot uploads fail → logged as events; exam continues |
| Vercel | Hosting the Next.js app | Electron app shows "cannot reach server" screen |

## 8. Auth and authorization
- **Identity:** email + password. Students register via `/sign-up` (Server Action, D-034) or
  `POST /api/v1/auth/register`; teachers are created by `npm run seed` (D-036). Passwords hashed with
  bcryptjs (cost 10); rules in D-032. Auth.js `5.0.0-beta.32`, pinned (D-033).
- **Session:** Auth.js JWT strategy in an httpOnly, secure, SameSite=Lax cookie. Token holds
  `userId`, `role`, `name`. Electron uses a persistent session partition so the cookie survives restarts,
  and flushes the cookie store to disk on every change so a crash can't undo a sign-out (D-035).
- **Roles:** `student`, `teacher`. (`admin` = a teacher created by seed; no separate powers in V1.)
- **Enforcement:** every `/api/v1` handler calls `requireUser("teacher" | "student")`. Ownership is
  checked in services (teacher owns quiz; student owns attempt). `src/proxy.ts` (Next 16's name for
  middleware) only redirects for UX — it is **not** the security boundary. Pages re-check with
  `requirePageUser(role)` inside `<Suspense>` (D-035).
- Students never receive `correctOption` until results are released for that attempt.

## 9. Error handling and logging conventions
- Services throw `AppError(code, message, status)`; a `withHandler()` wrapper in `lib/api-response.ts`
  converts it to `{ error: { code, message, details } }`. Unknown errors → `500 INTERNAL`, logged with
  `console.error` (visible in Vercel logs) without request bodies or passwords.
- Client fetch helper unwraps `{ data }` or throws the error object; UI shows a toast or inline message.
- Electron main logs to stdout (dev) only.

## 10. Configuration
| Env var | Purpose | Required | Example |
|---|---|---|---|
| `MONGODB_URI` | Atlas connection string | yes | `mongodb+srv://user:pass@cluster/proctra` |
| `AUTH_SECRET` | Auth.js JWT signing secret | yes | output of `npx auth secret` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account | yes | `demo` |
| `CLOUDINARY_API_KEY` | Cloudinary key | yes | `1234567890` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret (server only) | yes | `abc...` |
| `SEED_TEACHER_EMAIL` / `SEED_TEACHER_PASSWORD` / `SEED_TEACHER_NAME` | Seed script input | for seeding | `teacher@uni.edu` |
| `PROCTRA_APP_URL` | URL the Electron shell loads (baked in at package time) | yes (Electron) | `http://localhost:3000` / `https://proctra-mu.vercel.app` |

All server env reads go through `env()` in `src/lib/env.ts` (validated with Zod on first use, D-028; keys are added in the phase that needs them). Electron reads only `PROCTRA_APP_URL`. `.env.example` lists every
key; real values live in `.env` (gitignored) locally and in Vercel project settings for production.
