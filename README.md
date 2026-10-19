# Proctra

A macOS desktop app for timed multiple-choice exams with lightweight, honest proctoring: a full-screen exam window,
the camera on during the exam, and a still photo every 10 seconds. Teachers write quizzes and see results;
students take exams and see their marks and a live leaderboard.

Built as a university capstone. It is **not** an OS lockdown or a cheating detector. See [Limitations](#limitations).

## Features

**Teachers**
- Create quizzes: single-correct MCQs with 2–6 options; questions can be added, edited, reordered and removed.
- Marking per quiz: points for correct, wrong and unanswered answers (negative and fractional marks allowed).
- A fixed exam slot (start → end, 1 min–5 h). The duration is calculated from it. Once students start, the end time can
  only be extended.
- Optional "show results at" time; publish / unpublish / archive.
- Results per quiz: submissions with marks, event and snapshot counts, and the average.
- Per-student detail: their answers next to the correct ones, a neutral event timeline, and the snapshot gallery
  (private images behind signed links that expire after 10 minutes).
- Live leaderboard with shared ranks for ties (1, 1, 3).

**Students**
- Sign up and see published quizzes with a live "Starts in… / Ends in…" countdown (based on server time).
- Camera check, then a full-screen kiosk exam window: timer, one question at a time, question palette, mark for review.
- Every click is saved immediately. If the connection drops, answers are kept on the device and retried. Quitting or a
  crash can be resumed; time keeps running.
- Manual submit with confirmation, automatic submit at the end time (also done by the server if the laptop is off).
- Result page (score, review), profile with all attempts, and a live leaderboard after finishing.

## How it works

```
Proctra.app (Electron shell, macOS)  ──HTTPS──▶  Next.js app on Vercel  ──▶  MongoDB Atlas
  main window + kiosk exam window                pages + /api/v1 routes    └▶  Cloudinary (private snapshots)
  camera permission, window events
```

- The Electron app holds **no secrets and no business logic**. It loads the hosted site and adds desktop powers through
  a tiny bridge (`window.proctra`: `requestCamera`, `startExam`, `endExam`).
- The **server decides everything that matters**: who may do what, deadlines, saving, grading. The client is never trusted
  with time, score or role.
- No queues or background jobs: an attempt whose deadline has passed is submitted and graded the next time anyone reads it.

Full design docs live in [`docs/`](docs/README.md). [`docs/decisions.md`](docs/decisions.md) explains every decision and why.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · DevClub UI · GSAP ·
MongoDB + Mongoose · Auth.js v5 (credentials, JWT cookie) · Zod · Cloudinary · Electron 44 · electron-builder · Vercel.

## Getting started (development)

### Prerequisites
- macOS, Node.js **20.9+**, npm
- A **MongoDB Atlas** cluster. Network Access must allow your IP (and `0.0.0.0/0` if you deploy to Vercel).
- A **Cloudinary** account. The API key's **role must allow creating assets**: a read-only key can connect but uploads fail with 403.

### 1. Install and configure
```bash
npm install
cp .env.example .env
```
Fill in `.env`:

| Variable | What it is |
|---|---|
| `MONGODB_URI` | Atlas connection string ending in `/proctra?retryWrites=true&w=majority` |
| `AUTH_SECRET` | Random secret for session cookies: `openssl rand -base64 32` (at least 32 characters) |
| `SEED_TEACHER_NAME` / `SEED_TEACHER_EMAIL` / `SEED_TEACHER_PASSWORD` | The teacher account `npm run seed` creates |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Snapshot storage. If missing, only snapshot uploads fail; the app still works |
| `PROCTRA_APP_URL` | Which site the **dev** Electron shell opens (default `http://localhost:3000`) |

### 2. Create a teacher
Teachers can't self-register.
```bash
npm run seed            # creates/updates the teacher from SEED_TEACHER_* (safe to run again)
```

### 3. Run
```bash
npm run dev             # Next.js on http://localhost:3000
npm run electron        # in a second terminal: the desktop app (exams only start here)
```

| Command | Purpose |
|---|---|
| `npm run lint` | ESLint + TypeScript (web and Electron) |
| `npm run build` | Production build of the website |
| `npm run dist` | Build the macOS installer (see below) |

Dev-only switches for testing without taking over your screen (ignored in the packaged app):
`PROCTRA_FAKE_CAMERA=1` (Chromium's fake camera) and `PROCTRA_KIOSK=0` (exam in a normal window).

## Building and installing the macOS app

```bash
npm run dist            # → release/Proctra-0.1.0-mac-universal.dmg
```
- Universal (Apple Silicon + Intel), about 220 MB. The app loads the production site,
  `https://proctra-mu.vercel.app`, which is set in `electron-builder.yml` (`extraMetadata.proctraAppUrl`). To build for
  another server:
  `npm run dist -- -c.extraMetadata.proctraAppUrl=https://your-deployment.example`.
- The app is **ad-hoc signed, not notarized** (no Apple Developer account). To install:
  1. Open the `.dmg` and drag **Proctra** to Applications.
  2. The first time, **right-click Proctra → Open → Open**. A double-click shows "can't be opened" until you do this once.
  3. If macOS says the app "is damaged" (common for files downloaded in a browser), run
     `xattr -cr /Applications/Proctra.app` once.
- When you start your first exam, macOS asks for camera access. Allow it. If you denied it, enable it in
  **System Settings → Privacy & Security → Camera → Proctra**.

## Deploying the website

Deploys are manual (no CI):
```bash
npx vercel deploy --prod
```
Set `MONGODB_URI`, `AUTH_SECRET` and the three `CLOUDINARY_*` variables in the Vercel project. Check the deploy with
`/api/v1/health`, which should return `{"data":{"ok":true,"db":"up"}}`.
(On a non-Vercel host, also set `AUTH_TRUST_HOST=true`.)

## Limitations

These are deliberate, and documented in `docs/`:
- **Kiosk mode is not a lockdown.** macOS kiosk mode hides the Dock and menu bar and blocks app switching and the
  Force Quit dialog. **Cmd+Q is kept working on purpose**: the attempt stays active, so the student can resume or it
  auto-submits. Phones, other computers, second screens and the power button are not controlled.
- **Proctoring is neutral.** There is no face detection, video recording or "suspicion score". Focus changes, camera
  disconnects and failed uploads are logged as facts, never as evidence of cheating.
- **Desktop-only is enforced by the pages.** A determined user could call the start API from a browser. The server still
  enforces identity, the time slot and grading, and the missing camera and kiosk data shows in the teacher's view.
- **Time lost** to a disconnect, a dead battery or a lost camera is not given back.
- **Not yet implemented:** automatic snapshot deletion (choose a retention period before real use), rate limiting, a
  Content-Security-Policy header, and code signing / notarization.

## Project layout

```
electron/        Electron main + preload (shell only), offline page, packaging icon
src/app/         pages (auth, student, teacher, exam) and /api/v1 route handlers
src/services/    business rules: quizzes, attempts, grading, results, snapshots, events
src/models/      Mongoose models · src/schemas/ Zod validation · src/lib/ db, auth, env, cloudinary
scripts/         seed-teachers.ts
docs/            PRD, architecture, system design, schema, API contracts, decisions, phases
```
