# Decision Log

Every non-trivial decision made while building this project, with the reasoning behind it.
Written so that someone reading it after the project is finished can understand **what** was built,
**why** it was built that way, and **how** the logic works.

Rules:
- Append new entries at the bottom. Never delete an entry; if a decision changes, add a new entry
  and mark the old one `Superseded by D-###`.
- Log as you go, not at the end of a phase.
- Small choices: fill Context, Decision, Why, Files. Architectural or tricky ones: fill everything.

## Index
| ID | Date | Phase | Title | Status |
|---|---|---|---|---|
| D-001 | 2026-10-19 | 00 | Use the lean profile | Active |
| D-002 | 2026-10-19 | 00 | Electron as a thin shell around a hosted Next.js app | Active |
| D-003 | 2026-10-19 | 00 | One Next.js codebase: route handlers + service layer | Active |
| D-004 | 2026-10-19 | 00 | MongoDB Atlas + Mongoose | Active |
| D-005 | 2026-10-19 | 00 | Auth.js Credentials with JWT session cookies | Active |
| D-006 | 2026-10-19 | 00 | Server-authoritative deadline with lazy finalization | Active (formula amended by D-041) |
| D-007 | 2026-10-19 | 00 | Per-answer autosave with a local pending queue | Active |
| D-008 | 2026-10-19 | 00 | Snapshots uploaded through the server to private Cloudinary | Active |
| D-009 | 2026-10-19 | 00 | Electron security model and narrow preload bridge | Active |
| D-010 | 2026-10-19 | 00 | Camera-loss policy: block start, pause overlay mid-exam | Active |
| D-011 | 2026-10-19 | 00 | Zod for all input validation | Active |
| D-012 | 2026-10-19 | 00 | Package an unsigned universal macOS .dmg with electron-builder | Active |
| D-013 | 2026-10-19 | 00 | Desktop-only exam is a UX check, not a security guarantee | Active |
| D-014 | 2026-10-19 | 00 | No cache, queue or background infrastructure | Active |
| D-015 | 2026-10-19 | 00 | npm, Tailwind + shadcn/ui first, DevClub/GSAP in polish | Active |
| D-016 | 2026-10-19 | 00 | Every published quiz is visible to all students | Active |
| D-017 | 2026-10-19 | 00 | Feature-sliced phases instead of backend-first | Active |
| D-018 | 2026-10-19 | 00 | Embed questions inside the quiz document | Active |
| D-019 | 2026-10-19 | 00 | Store answers as a map keyed by question id | Active |
| D-020 | 2026-10-19 | 00 | Snapshots and proctor events in their own collections | Active |
| D-021 | 2026-10-19 | 00 | Copy studentName onto the attempt | Active |
| D-022 | 2026-10-19 | 00 | Quiz editor saves the whole quiz; lock questions after first attempt | Active |
| D-023 | 2026-10-19 | 00 | Role-prefixed routes and 404 for other students' attempts | Active |
| D-024 | 2026-10-19 | 00 | Grading as a pure function with a stored breakdown | Active |
| D-025 | 2026-10-19 | 00 | Competition ranking computed on read | Active |
| D-026 | 2026-10-19 | 01 | Keep Next.js 16.4 defaults: Cache Components + Partial Prefetching | Active |
| D-027 | 2026-10-19 | 01 | shadcn/ui on Radix (nova preset) and its runtime deps | Active |
| D-028 | 2026-10-19 | 01 | Lazy, validated env access; keys added per phase | Active |
| D-029 | 2026-10-19 | 01 | Mongo connection settings and the standard API wrapper | Active |
| D-030 | 2026-10-19 | 01 | Electron shell details: single instance, offline page, dev env loading | Active |
| D-031 | 2026-10-19 | 01 | Deploy with the Vercel CLI; env vars set from .env without echoing | Active |
| D-032 | 2026-10-19 | 02 | Registration and password handling rules | Active |
| D-033 | 2026-10-19 | 02 | Auth.js v5 beta wiring: pinned version, split + lazy config | Active |
| D-034 | 2026-10-19 | 02 | Auth forms use Server Actions (exception to D-003) | Active |
| D-035 | 2026-10-19 | 02 | Route guarding: proxy redirects + page re-checks; cookie flush in Electron | Active |
| D-036 | 2026-10-19 | 02 | Teacher seed script with tsx; never silently promote a student | Active |
| D-037 | 2026-10-19 | 03 | Quiz validation in two layers; times are UTC with explicit offsets | Active |
| D-038 | 2026-10-19 | 03 | Quiz service: validate in memory, write with one conditional update | Active |
| D-039 | 2026-10-19 | 03 | Quiz editor: browser-only render, whole-quiz save, local-time display | Active |
| D-040 | 2026-10-19 | 03 | Student quiz views: projection-only reads; streamed 404 pages | Active |
| D-041 | 2026-10-19 | 03 | Fixed exam slot: duration derived from start/end; extend-only end time | Active |
| D-042 | 2026-10-19 | 04 | Attempt lifecycle: insert-or-read start, atomic grade-and-close with optimistic retry | Active |
| D-043 | 2026-10-19 | 04 | Exam UI: one question at a time, native radios, shared server clock | Active |
| D-044 | 2026-10-19 | 04 | Submit only after saves are confirmed; auto-submit with server backstop | Active |
| D-045 | 2026-10-19 | 05 | Kiosk exam window lifecycle, camera-only permission, dev test switches | Active |
| D-046 | 2026-10-19 | 05 | Proctor events and the hidden exam camera | Active |
| D-047 | 2026-10-19 | 05 | Leave kiosk before revealing the result window (macOS Spaces bug) | Active |
| D-048 | 2026-10-19 | 05 | Cmd+Q quits during the kiosk exam (scoped global shortcut) | Active |
| D-049 | 2026-10-20 | 06 | Live leaderboard for students who finished; profile lists active attempts | Active |
| D-050 | 2026-10-20 | 06 | Teacher results: separate service, sorted submissions, paired event timeline | Active |
| D-051 | 2026-10-20 | 07 | Packaging: shell-only bundle, baked production URL, ad-hoc signature, generated icon | Active |
| D-052 | 2026-10-20 | 07 | Snapshot gallery: on-demand, signed 10-minute download links | Active |
| D-053 | 2026-10-20 | 07 | Light DevClub UI + GSAP polish via the shadcn registry | Active |
| D-054 | 2026-10-20 | 07 | Per-chip installers instead of universal; install steps for macOS 15+ | Active |

---

## Entry template (copy below the last entry)

### D-### — <Short title>
- **Date:** YYYY-MM-DD
- **Phase:** NN — <phase name>
- **Status:** Active | Superseded by D-### | Reverted
- **Type:** stack | architecture | data | api | algorithm | edge-case | tooling | assumption

**Context**
What problem or question came up, and what constraints mattered.

**Decision**
What was chosen, in one or two sentences.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| | |

**Why**
The reasoning. What made this the right choice for this project at this stage.

**How it works**
Walk through the logic step by step in plain language, as if teaching it. Include a small code
snippet or pseudo-code if it helps. Mention the edge cases it handles.

**Files touched**
- `path/to/file.ts` — what changed

**Concepts worth learning**
Terms, patterns or ideas this decision relies on (e.g. "optimistic concurrency", "idempotency key"),
each with one line explaining it.

**Revisit if**
The conditions under which this decision should be reconsidered.

---


### D-001 — Use the lean profile
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** tooling

**Context**
`idea.md` explicitly excludes a testing plan, Docker and CI/CD. The deadline is one week.

**Decision**
Profile `lean`: only product code is committed. Verification uses throwaway scripts in `.scratch/` (gitignored).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| `full` profile | Contradicts the course scope and costs time we don't have |

**Why**
Matches the brief and keeps every hour on features.

**Files touched**
- `CLAUDE.md`, `.gitignore`

**Revisit if**
The course later asks for automated tests.

---

### D-002 — Electron as a thin shell around a hosted Next.js app
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** architecture

**Context**
Students on many different Macs must share one database. A desktop app also needs secrets (MongoDB URI,
Cloudinary secret) somewhere. Anything shipped inside an Electron app can be unzipped and read by its user.

**Decision**
Deploy the Next.js app (UI + API) to Vercel. The Electron app contains no business logic and no secrets:
its main window simply loads `PROCTRA_APP_URL`, and it adds desktop-only powers (kiosk exam window,
camera permission).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Run Next.js server inside Electron (local server per laptop) | Each laptop would need the DB credentials → any student could read/modify every result |
| Static export bundled into Electron + separate API server | Two deployables and an extra Express server, which the brief rules out |
| Local-only server on the teacher's laptop | Demo limited to one network; fragile |

**Why**
A browser-style client talking to one trusted server is the standard way to keep secrets and rules on
the server. Vercel's free tier deploys Next.js with zero config.

**How it works**
1. `electron/main.ts` creates a `BrowserWindow` and calls `loadURL(PROCTRA_APP_URL)`.
2. The page is the same one you'd see in Chrome, so sign-in sets a normal cookie; Electron keeps it
   in a persistent session partition (`persist:proctra`) so users stay signed in across restarts.
3. When a student starts an exam, the page asks Electron (via the preload bridge, D-009) to open a
   second window in kiosk mode at `/exam/<attemptId>`.
4. For local development `PROCTRA_APP_URL=http://localhost:3000`; for the packaged `.dmg` it points at the Vercel URL.

**Files touched**
- `electron/main.ts`, `electron/preload.ts`, `electron-builder.yml` (from phase 01)

**Concepts worth learning**
- **Thin client:** the client only renders and forwards input; the server owns rules and data.
- **Trust boundary:** the line beyond which you can't trust code (here: everything on the student's Mac).

**Revisit if**
The app must work offline, or the course forbids hosting on Vercel.

---

### D-003 — One Next.js codebase: route handlers + service layer
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** architecture

**Context**
The brief says "no separate Express server". We still want a clean API that's easy to document and
explain, and business rules that aren't scattered across pages.

**Decision**
Use Next.js App Router route handlers under `/api/v1/*` for all mutations and client-side reads. Each
handler is thin; business logic lives in `src/services/`, and only services touch Mongoose models.
Server components may call services directly for initial page data.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Server Actions for everything | Harder to document as API contracts; the Electron/exam page fetch patterns (retry queue, multipart snapshots) fit plain HTTP better |
| Logic directly in route handlers | Rules like "attempt must be active" would be duplicated across handlers and pages |
| Separate Express API | Explicitly excluded by the brief |

**Why**
Layering (handler → service → model) makes each rule live in exactly one place, and HTTP endpoints map
1:1 to `api-contracts.md`.

**How it works**
```ts
// src/app/api/v1/attempts/[id]/submit/route.ts
export const POST = withHandler(async (req, { params }) => {
  const user = await requireUser("student");          // 401/403
  const { id } = AttemptIdParam.parse(await params);  // 400
  return submitAttempt({ attemptId: id, studentId: user.id }); // service does the rest
});
```
`withHandler` turns thrown `AppError`s into the standard error JSON and wraps results in `{ data }`.

**Concepts worth learning**
- **Layered architecture:** each layer only calls the one below it.
- **Separation of concerns:** HTTP parsing vs business rules vs persistence.

**Revisit if**
Handlers start containing business logic, or the project grows a second client needing a different API.

---

### D-004 — MongoDB Atlas + Mongoose
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** stack

**Context**
The brief specifies MongoDB + Mongoose. Data is document-shaped (a quiz with its questions; an attempt with its answers).

**Decision**
MongoDB Atlas free tier (M0) with Mongoose; connection cached in a module-level global in `src/lib/db.ts`.

**Why**
Matches the brief; embedding questions in a quiz and answers in an attempt means one read per screen.
Caching the connection matters on Vercel because each serverless invocation would otherwise open a new connection.

**Concepts worth learning**
- **Connection reuse in serverless:** warm function instances keep module globals, so a cached promise avoids reconnecting each request.

**Revisit if**
Data becomes highly relational (many-to-many cohorts, analytics joins).

---

### D-005 — Auth.js Credentials with JWT session cookies
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** architecture

**Context**
Email/password sign-in, two roles, teacher accounts seeded (no public teacher sign-up). The brief suggests Auth.js.

**Decision**
Auth.js (NextAuth v5) Credentials provider, JWT session strategy, httpOnly cookie, 12 h max age.
Passwords hashed with `bcryptjs`. A `requireUser(role?)` helper is the only way handlers read the user.
Student sign-up is our own `POST /api/v1/auth/register` endpoint (Auth.js doesn't do registration).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Hand-rolled JWT with `jose` | More security-sensitive code to write and explain |
| Database sessions | Extra collection + DB hit per request; no benefit at this size |
| OAuth (Google) | Teachers must be provisioned anyway; adds external setup |

**Why**
Auth.js handles cookie signing, CSRF on its own endpoints, and session reading; we only write "check
password" and "put role in token".

**How it works**
1. `authorize({ email, password })` → find user → `bcrypt.compare` → return `{ id, role, name }` or `null`.
2. `jwt` callback copies `id`/`role` into the token; `session` callback exposes them.
3. `requireUser("teacher")` calls `auth()`, throws `401` if no session, `403` if wrong role.
4. 12 h max age so a session can't expire mid-exam.
5. `bcryptjs` (pure JS) is used instead of `bcrypt` (native) so it runs on Vercel without native builds.

**Concepts worth learning**
- **Password hashing with salt:** slow hash so leaked hashes are expensive to crack.
- **JWT session:** signed token in a cookie; server verifies signature instead of looking up a session.
- **Authentication vs authorization:** who you are vs what you may do.

**Revisit if**
We need instant session revocation (JWTs stay valid until expiry), or Auth.js v5 proves incompatible with the pinned Next.js version (fallback: `jose` + our own cookie).

---

### D-006 — Server-authoritative deadline with lazy finalization
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active — deadline formula amended by D-041 (lazy finalization unchanged)
- **Type:** algorithm

**Context**
The exam must auto-submit at the deadline even if the student's laptop dies. Vercel has no always-on
process, and the brief rules out queues/background infrastructure.

**Decision**
The server computes `deadline = min(startedAt + duration, quiz.endsAt)` once, when the attempt is created.
Expired attempts are finalized **lazily**: any code path that reads an attempt first runs
`finalizeIfExpired()`, which atomically closes and grades it if `now > deadline + 5 s grace`.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Trust the client timer | A modified client could never submit or extend time |
| Cron job every minute (Vercel cron) | Hobby plan cron is limited; adds infra for no visible benefit |
| setTimeout on server | Serverless functions don't live long enough |

**Why**
Nobody can observe an expired-but-not-finalized attempt, because every observer finalizes it first.
So it behaves exactly like a real-time scheduler, with zero infrastructure.

**How it works**
```ts
async function finalizeIfExpired(attempt) {
  if (attempt.status !== "active" || Date.now() <= attempt.deadline + GRACE_MS) return attempt;
  const closed = await Attempt.findOneAndUpdate(
    { _id: attempt._id, status: "active" },            // only one caller can win
    { status: "auto_submitted", submittedAt: attempt.deadline },
    { new: true });
  return closed ? gradeAndSave(closed) : Attempt.findById(attempt._id); // lost the race → read result
}
```
- Capping at `quiz.endsAt` means a student starting 5 min before the window closes gets 5 min, not the full duration.
- The 5 s grace absorbs network latency for answers clicked right before zero.
- `submittedAt` is set to the deadline (not "now") so late finalization doesn't make it look late.

**Concepts worth learning**
- **Lazy evaluation:** do work when the result is needed, not on a schedule.
- **Compare-and-set:** update only if the current state matches what you expect (`status: "active"`).

**Revisit if**
Something must happen at the deadline without anyone reading (e.g. emailing results), or quizzes grow large enough that finalizing on read is slow.

---

### D-007 — Per-answer autosave with a local pending queue
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** algorithm

**Context**
Answers must survive crashes/power loss and brief network drops, and the UI must never claim "saved"
before the server confirms (brief §10).

**Decision**
Every answer change is saved immediately with one request per change, updating only that answer
atomically in MongoDB. The client keeps unconfirmed answers in `localStorage` and a sequential,
coalescing save queue retries them with backoff.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Save all answers every N seconds | Up to N seconds of answers lost on power cut |
| Save only on submit | Everything lost on crash |
| Redis write buffer | Extra infra; MongoDB handles ~10 writes/s trivially (D-014) |
| Parallel requests per change | Out-of-order arrival can overwrite a newer answer with an older one |

**Why**
Smallest possible loss window (only an in-flight click), simple to reason about, honest status indicator.

**How it works**
1. Student clicks option → state updates instantly → entry `{questionId, option, marked}` stored under
   `proctra:pending:<attemptId>` in localStorage → enqueued.
2. Queue sends one `PUT` at a time. If the same question changes while a request is in flight, the
   queue keeps only the newest value for the next send (coalescing).
3. 200 → remove from pending. Network error → retry 1 s, 2 s, 4s … capped at 10 s. 409 `ATTEMPT_CLOSED`
   → stop, go to result screen.
4. On exam page load (including resume), leftover pending entries are replayed first.
5. Server: `updateOne({ _id, studentId, status: "active", deadline: { $gt: now - grace } }, { $set: { "answers.<qid>": … } })`
   — a single atomic write that can't touch other answers or a closed attempt.

**Implementation (phase 04)**
`SaveQueue` (`src/components/exam/save-queue.ts`) is plain TypeScript, wrapped by `useAutosave()`. HTTP outcome →
queue action: `200` ok, `409` closed (stop + go to result page), `400/404` drop (retrying can't fix it), anything else or a
network error → retry with backoff 1/2/4/8/10 s (and immediately on the browser's `online` event). The exam renders
browser-only so the first render can overlay unconfirmed `localStorage` answers on the server copy.
Verified: `.scratch/save-queue.test.ts` (8 cases: coalescing, replay after "crash", retry sends the newest value,
closed, drop, flush, no storage) and an Electron scenario that blocked `/answers/` requests via CDP: answer → "retrying"
+ local copy → **page reload while offline still shows it** → network back → saved, local copy cleared, server has it.
Limitation: Chromium also writes `localStorage` to disk lazily, so a hard crash within ~1–2 s of a click can still lose
that last unconfirmed answer — the window this design accepts.

**Concepts worth learning**
- **Optimistic UI:** show the change immediately, reconcile with the server after.
- **Idempotent writes:** sending the same "set answer to 2" twice has the same effect as once, so retries are safe.
- **Exponential backoff:** wait longer between each retry to avoid hammering a failing server.

**Revisit if**
Per-click requests become a cost/load problem (then batch with a short debounce).

---

### D-008 — Snapshots uploaded through the server to private Cloudinary
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** architecture

**Context**
A JPEG every 10 s per student must reach Cloudinary, be linked to the attempt, and never be publicly reachable.

**Decision**
The exam page POSTs each JPEG (~40 KB) to `/api/v1/attempts/:id/snapshots`; the server checks the attempt
is active and owned by the student, uploads to Cloudinary with `type: "authenticated"`, then stores
`{attemptId, publicId, capturedAt}` in MongoDB.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Direct browser → Cloudinary signed upload, then report `publicId` | Two requests per snapshot, and the server has to trust a client-reported ID |
| Store images in MongoDB | The brief forbids it; bloats the DB |
| Public Cloudinary URLs | Anyone with the link could view student images |

**Why**
One request, and the server controls folder, naming and access rules. 40 KB is far below Vercel's 4.5 MB body limit.

**How it works**
Canvas grabs a frame from a hidden `<video>` → `canvas.toBlob("image/jpeg", 0.7)` → `FormData` → POST.
Server validates type/size (≤ 500 KB) → `cloudinary.uploader.upload_stream({ type: "authenticated", folder })`.
Teachers (S-01) get `cloudinary.url(publicId, { sign_url: true, type: "authenticated" })` links.

**Implementation (phase 05)**
`src/lib/cloudinary.ts` validates the three `CLOUDINARY_*` keys separately from `env()` — if they're missing, only snapshot
uploads fail (502 → `snapshot_failed` event), the rest of the app keeps working. `useSnapshots` captures via
`useExamCamera().grabFrame()` (640×480 JPEG ≈ 7–40 KB) only while the attempt is active **and** the camera is live.
The server checks the JPEG magic bytes (`FF D8 FF`), size ≤ 500 KB, ownership, active + within deadline grace.
Verified live: 4 snapshots ~10 s apart; Cloudinary `type: authenticated`; public URL → 404, unsigned authenticated URL → 401,
signed URL → 200 image/jpeg; snapshot count unchanged 25 s after submit; failure path (secret missing) → `snapshot_failed`
events and an unaffected exam.

**Gotcha:** newer Cloudinary accounts give API keys **roles**. Our key could ping but uploads returned
`403 … missing permissions (actions=["create"])` until the key's role allowed creating assets. A disabled key returns
`disabled api_key`. The SDK rejects with plain `{ message, http_code }` objects (not `Error`), so logs print those fields.

**Concepts worth learning**
- **Signed URLs:** a URL containing a signature made with a secret, so only the server can produce valid links.

**Revisit if**
Upload volume hits Vercel bandwidth/invocation limits → switch to direct signed uploads.

---

### D-009 — Electron security model and narrow preload bridge
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** architecture

**Context**
The Electron windows load remote web content. If that content could reach Node.js APIs, any XSS would
become full control of the student's Mac.

**Decision**
`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. The preload exposes exactly:
`window.proctra = { isDesktop: true, requestCamera(), startExam(attemptId), endExam(attemptId) }`.
Main validates every IPC argument, only allows navigation to the app origin, and grants the `media`
permission only to that origin.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Expose `ipcRenderer` directly | Page could send any channel/arguments |
| `nodeIntegration: true` | Remote page gets filesystem/process access |

**How it works**
- `contextBridge.exposeInMainWorld("proctra", {...})` gives the page plain functions that call `ipcRenderer.invoke` on fixed channel names.
- `startExam(id)`: main checks `/^[a-f0-9]{24}$/`, creates `BrowserWindow({ kiosk: true, closable: false })`,
  loads `/exam/<id>`, hides the main window. The server still checks the attempt belongs to the user.
- `requestCamera()`: main calls `systemPreferences.askForMediaAccess("camera")` (macOS TCC prompt).
- `will-navigate` / `setWindowOpenHandler` deny any URL outside `PROCTRA_APP_URL`'s origin.

**Concepts worth learning**
- **Context isolation:** the page's JS and the preload's JS run in separate worlds.
- **Least privilege:** expose only the capabilities a feature needs.
- **macOS TCC:** the OS permission system behind "App wants to access the camera".

**Revisit if**
A new desktop capability is needed — add one narrowly scoped function, never a generic channel.

---

### D-010 — Camera-loss policy: block start, pause overlay mid-exam
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** edge-case

**Context**
`idea.md` left the camera-failure policy to the course owner. Chosen in kickoff: "block everything".

**Decision**
No camera → the attempt cannot start. Camera lost mid-attempt → blocking overlay until it returns;
answers can't be changed meanwhile; the server deadline keeps running; `camera_lost`/`camera_restored` events logged.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Allow and just log | User chose stricter policy |
| Pause the timer while camera is lost | Server would have to trust client-reported pause time; abusable |

**How it works**
Video track `ended` → overlay + event → retry `getUserMedia` every 2 s → success → hide overlay + event.

**Start gate (implemented in phase 05, `src/lib/camera.ts`)**
Start/Resume first calls `window.proctra.requestCamera()` (macOS prompt only if undecided), then a real
`getUserMedia({ video: true })` test that is stopped immediately. Each failure gets its own instruction: permission
(`NotAllowedError` → System Settings → Privacy & Security → Camera), no camera (`NotFoundError`), camera busy
(`NotReadableError`). No attempt is created unless the check passes (verified: 3 forced errors → 0 attempts).

**Revisit if**
Course requires time accommodations for hardware failures.

---

### D-011 — Zod for all input validation
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** tooling

**Decision**
Every request body/param is parsed with a Zod schema from `src/schemas/`; the same schemas validate forms on the client and env vars in `lib/env.ts`.

**Why**
One definition gives runtime validation + TypeScript types; failure maps cleanly to `400 VALIDATION_ERROR`.

**Revisit if**
Never likely for this project.

---

### D-012 — Package an unsigned universal macOS .dmg with electron-builder
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** tooling

**Context**
The course requires a packaged `.dmg`. Demo is macOS only; we don't know if the demo Mac is Apple Silicon or Intel. No Apple Developer account.

**Decision**
electron-builder, target `dmg`, arch `universal`, unsigned. `Info.plist` gets `NSCameraUsageDescription`
(required for macOS to show the camera prompt). `PROCTRA_APP_URL` is baked into the build.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Electron Forge | Fine too; electron-builder's single YAML config is simpler for just a dmg |
| Signed + notarized | Needs a paid Apple Developer account |

**How it works**
`npm run dist` → compiles `electron/*.ts` → electron-builder bundles only `electron/dist` + `package.json`
(no Next.js code needed — the UI is loaded from Vercel). First launch: right-click → Open to bypass Gatekeeper.

**Concepts worth learning**
- **Gatekeeper / notarization:** macOS checks that apps are signed by a known developer.
- **Universal binary:** one app containing both arm64 and x64 code.

**Revisit if**
The course rejects unsigned apps (PRD open question 2).

---

### D-013 — Desktop-only exam is a UX check, not a security guarantee
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** assumption

**Context**
The exam page is a normal web URL. A student could open it in Chrome to avoid kiosk mode.

**Decision**
The start button requires `window.proctra?.isDesktop`, and the exam page refuses to render without it.
This is documented as a limitation; the server still enforces identity, deadline and grading, and a
Chrome session produces visible gaps (no kiosk, focus events) that teachers can see.

**Why**
Real client attestation is out of scope for a capstone (and the brief disclaims lockdown).

**Implemented (phase 05)** — `StartButton` shows "Use the Proctra desktop app" and disables Start when `window.proctra` is
missing; the exam page renders "Open this exam in the Proctra desktop app" instead of questions. Verified in headless Chrome.
As designed, the start **API** still works from a browser — the server enforces identity, the time slot and grading, and the
missing snapshots/events are visible to the teacher.

**Accessibility fix made alongside:** shadcn's `Alert` always set `role="alert"`, so informational notices (camera notice,
"desktop app" notice) were announced like errors. `Alert` now defaults to `role="alert"` only for the `destructive` variant and
`role="note"` otherwise.

**Revisit if**
Exams become high-stakes.

---

### D-014 — No cache, queue or background infrastructure
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** architecture

**Context**
Peak load is ~100 students × (1 save + 1 snapshot) per ~10 s ≈ 20 req/s. The brief forbids Redis/queues.

**Decision**
MongoDB is the only store; deadlines use lazy finalization (D-006); no data caching.

**Why**
The load is far below what one Atlas cluster handles, and every extra system is something else to deploy, keep in sync and explain.

**Revisit if**
Load grows by 10×+ or a feature genuinely needs scheduled work.

---

### D-015 — npm, Tailwind + shadcn/ui first, DevClub/GSAP in polish
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** stack

**Decision**
npm as package manager (user choice). Build every screen with shadcn/ui on Tailwind first. DevClub UI
components and GSAP transitions are added only in the final phase (S-02), and never on exam controls.

**Why**
shadcn/ui gives accessible forms/tables/dialogs immediately; DevClub integration has unknown setup cost,
so it shouldn't block the core flow with a one-week deadline.

**Revisit if**
DevClub turns out to be trivial to install — then use its components earlier where they fit.

---

### D-016 — Every published quiz is visible to all students
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** data

**Context**
`idea.md` suggested cohorts or selected students; kickoff chose "all students".

**Decision**
No assignment model: a published, non-archived quiz is listed for every student; starting is allowed inside its availability window.

**Revisit if**
Multiple classes share one deployment → add a `cohort` field on users and `cohorts[]` on quizzes.

---

### D-017 — Feature-sliced phases instead of backend-first
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** tooling

**Decision**
Each phase builds one feature end to end (model → route → UI) and ends demoable. Plain exam (phase 04)
comes before kiosk + camera (phase 05) so the core logic is solid before desktop-specific layers.

**Why**
Next.js co-locates frontend and backend; vertical slices expose API design mistakes early and leave a
working app at every point of a one-week schedule.

**Revisit if**
n/a

---

### D-018 — Embed questions inside the quiz document
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** data

**Context**
Questions are always read and edited together with their quiz, and there are no question banks (non-goal).

**Decision**
`quiz.questions` is an embedded array; each question has its own `_id`, `text`, `options: string[]`, `correctIndex`.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Separate `questions` collection | Two queries per screen and multi-document updates for reorder, for no benefit |
| Options as sub-documents with ids | Options never get referenced individually; an index into a string array is enough |

**How it works**
Array order is display order, so reordering = rewriting the array. A 200-question quiz is well under
MongoDB's 16 MB document limit (~200 KB). Question `_id`s are kept across edits, so answer keys stay valid.

**Concepts worth learning**
- **Embedding vs referencing:** embed data that's owned by and read with its parent; reference data that's shared or grows unbounded.

**Revisit if**
Question banks or per-question reuse across quizzes are added.

---

### D-019 — Store answers as a map keyed by question id
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** data

**Context**
Autosave (D-007) must update exactly one answer atomically. In the kickoff chat the answers were sketched
as an array; while designing the schema the map turned out simpler.

**Decision**
`attempt.answers` is a Mongoose `Map<questionIdHex, { selectedIndex, markedForReview, savedAt }>`.
A missing key means "unanswered".

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Array of `{ questionId, … }` | Updating one element needs `arrayFilters` or pre-filling the array at start; upserting into it is awkward |
| Array indexed by question position | Breaks if questions are ever reordered; ties answers to order instead of identity |

**How it works**
```ts
await Attempt.updateOne(
  { _id: attemptId, studentId, status: "active", deadline: { $gt: new Date(Date.now() - GRACE_MS) } },
  { $set: { [`answers.${questionId}`]: { selectedIndex, markedForReview, savedAt: new Date() } } });
```
`questionId` is validated as 24-hex **and** as a question of this quiz before it is used in the key,
so it can't contain `.` or `$` (which would let a client write to other fields).

**Concepts worth learning**
- **Dot-notation updates:** `$set: { "answers.abc": … }` changes one nested key without touching the rest.
- **Operator injection:** building a field path from user input is dangerous unless the input is strictly validated.

**Revisit if**
Answers need history (every change) — then use a separate append-only collection.

---

### D-020 — Snapshots and proctor events in their own collections
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** data

**Decision**
`snapshots` and `proctorEvents` are separate collections referencing `attemptId` (and `quizId`).

**Why**
Both grow without a fixed bound (a 3-hour exam = 1080 snapshots; a student can blur the window hundreds of
times). Embedding would make the attempt document — which is read on every autosave — grow
continuously. They're also only read on the teacher's detail view, never with the exam.

**Revisit if**
n/a

---

### D-021 — Copy studentName onto the attempt
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** data

**Decision**
`attempt.studentName` is copied from the user when the attempt starts.

**Why**
Submissions and leaderboard lists then need one query instead of a `$lookup`/populate. Names can't be
changed in V1, so the copy can't go stale.

**Concepts worth learning**
- **Denormalization:** deliberately duplicating a small, rarely-changing value to make reads simpler.

**Revisit if**
Users can edit their names.

---

### D-022 — Quiz editor saves the whole quiz; lock questions after first attempt
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** api

**Context**
The brief requires add/edit/reorder/remove questions "before the quiz is attempted", and published quizzes must not silently change for students mid-attempt.

**Decision**
One `PUT /teacher/quizzes/:id` replaces the editable quiz state (the editor holds the whole quiz in form
state). When the first attempt starts, `quiz.locked` becomes `true`; after that only title,
instructions, `endsAt` and `resultsReleaseAt` may change.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Separate endpoints per question (POST/PATCH/DELETE/reorder) | 4–5 more endpoints and partial-state bugs; no benefit for single-teacher editing |
| Version quizzes and pin attempts to a version | Correct but complex; locking gives the same guarantee for V1 |

**How it works**
The service compares incoming questions/marking with the stored ones; if they differ and `locked` is
true → `409 QUIZ_LOCKED`. The write uses `{ _id, teacherId, locked: false }` as its condition for
question changes, so a student starting at the same moment can't race past it (system-design §4).

**Revisit if**
Teachers need to fix a typo after students started (then allow text-only edits that keep `correctIndex`).

---

### D-023 — Role-prefixed routes and 404 for other students' attempts
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** api

**Decision**
Teacher endpoints live under `/api/v1/teacher/*`; student endpoints are unprefixed. When a student asks
for an attempt that isn't theirs, the API returns `404`, not `403`.

**Why**
The prefix makes the required role obvious when reading a route, and `requireUser("teacher")` sits at the
top of every handler in that folder. Returning 404 avoids confirming that another student's attempt id exists.

**Revisit if**
A third role is added.

---

### D-024 — Grading as a pure function with a stored breakdown
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** algorithm

**Decision**
`grade(questions, marking, answers) → Score` is a pure function in `src/services/grading.ts`. Its result
is stored on the attempt at finalization.

**How it works**
```ts
for (const q of questions) {
  const a = answers.get(q._id.toHexString());
  if (a == null || a.selectedIndex == null) unanswered++;
  else if (a.selectedIndex === q.correctIndex) correct++;
  else incorrect++;
}
total = correct * marking.correct + incorrect * marking.incorrect + unanswered * marking.unanswered;
maxPossible = questions.length * marking.correct;
```
Rounded to 2 decimals to avoid float noise (e.g. `0.1 + 0.2`). Implemented in phase 04 as `src/services/grading.ts`
(no `server-only`, so `.scratch/grading.test.ts` checks it by hand: 9 cases incl. negative and fractional marks).
Storing the score means leaderboards and
profiles never re-grade; questions are locked (D-022), so the stored score can't go stale.

**Concepts worth learning**
- **Pure function:** same inputs → same output, no side effects; trivial to check by hand in `.scratch/`.

**Revisit if**
Per-question marks or regrading are added.

---

### D-025 — Competition ranking computed on read
- **Date:** 2026-10-19
- **Phase:** 00 — Planning
- **Status:** Active
- **Type:** algorithm

**Decision**
The leaderboard is computed per request from finalized attempts sorted by `score.total` desc, using
"standard competition ranking" (1, 1, 3).

**How it works**
Walk the sorted list; if a score equals the previous one, reuse the previous rank; otherwise
`rank = position + 1` (1-based). E.g. scores 36, 36, 32 → ranks 1, 1, 3. Ties are listed alphabetically.
With ≤ a few hundred attempts per quiz this is instant, so no stored rank is needed.

**Concepts worth learning**
- **Competition vs dense ranking:** competition skips ranks after ties (1,1,3); dense doesn't (1,1,2).

**Revisit if**
Quizzes reach thousands of attempts.

---

### D-026 — Keep Next.js 16.4 defaults: Cache Components + Partial Prefetching
- **Date:** 2026-10-19
- **Phase:** 01 — Foundation
- **Status:** Active
- **Type:** stack

**Context**
`create-next-app@16.4.2` enables `cacheComponents: true` and `partialPrefetching: true` by default. This
changes how pages and GET route handlers render compared with older Next.js tutorials (no
`export const dynamic = "force-dynamic"`; instead data is dynamic unless you opt into caching).

**Decision**
Keep both defaults. Never use `'use cache'` for per-user or exam data. Wrap components that read the
session/cookies or DB in `<Suspense>`, and call `await connection()` at the top of GET route handlers so
they always run at request time.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Turn Cache Components off (previous caching model) | Fights the framework defaults and the bundled docs; older model caches some things implicitly, which is riskier for exam data |

**Why**
In this model "fresh on every request" is the default and caching is explicit — exactly what an exam
app wants. The cost is adding `<Suspense>` boundaries around request-time data, which also gives
loading states for free.

**How it works**
- At build time Next.js prerenders a static "shell" of each page. Anything that reads cookies, headers
  or the database stops prerendering at that point and is streamed in at request time inside the
  nearest `<Suspense>` boundary (its fallback is shown first).
- A GET handler that touches the DB or request is automatically request-time; `connection()` makes
  that explicit for handlers (like `/health`) where it matters.

**Files touched**
- `next.config.ts` — kept as generated
- `docs/system-design.md` §6 — replaced the `force-dynamic` note

**Concepts worth learning**
- **Static shell / streaming:** send the unchanging HTML immediately, stream dynamic parts as they resolve.
- **Suspense boundary:** a React component that shows a fallback until its children's async work completes.

**Revisit if**
Auth.js or another library proves incompatible with Cache Components.

---

### D-027 — shadcn/ui on Radix (nova preset) and its runtime deps
- **Date:** 2026-10-19
- **Phase:** 01 — Foundation
- **Status:** Active
- **Type:** tooling

**Context**
shadcn CLI 4.22 asks for an underlying primitive library (Radix, Base UI, React Aria) and a visual preset,
and installs several runtime packages.

**Decision**
Radix primitives with the default `nova` preset (Lucide icons, Geist font). Dependencies it added:
`radix-ui` (accessible primitives), `class-variance-authority` (button/badge variants), `lucide-react`
(icons), `tw-animate-css` (enter/exit animations for dialogs), `shadcn` (provides `shadcn/tailwind.css`
imported by `globals.css`) and `cn` (class-name merging).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Base UI / React Aria base | Fewer examples; DevClub UI is "shadcn-compatible", most likely Radix-based |

**Why**
Radix is the most documented shadcn base, so fixes and examples are easy to find.

**How it works**
`npx shadcn add <component>` copies component source into `src/components/ui/` — we own that code.
`cn(...)` (from `src/lib/utils.ts`) joins class names and resolves Tailwind conflicts (`"p-2 p-4"` → `"p-4"`).

**Notes**
`cn` was unfamiliar (it replaces the usual `clsx` + `tailwind-merge`), so it was checked before keeping it:
published by shadcn from `github.com/shadcn-ui/cn`, no install scripts, no dependencies.
The layout exposes the Geist font as `--font-sans` because the generated theme reads that variable.
`shadcn` is a **devDependency**: the app only imports `shadcn/tailwind.css` at build time. Its CLI pulls in
`fast-glob` → `braces` (7 "high" npm-audit DoS findings for untrusted glob input — never reached by our app).
Keeping it out of production deps makes `npm audit --omit=dev` clean; `npm audit fix --force` was rejected
because it would downgrade shadcn to 1.0.

**Files touched**
- `components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

**Concepts worth learning**
- **Headless primitives:** Radix handles behaviour/accessibility (focus, keyboard, ARIA); styling is ours.
- **Supply-chain check:** before trusting a new package, check publisher, repo, install scripts and deps.

**Revisit if**
DevClub UI (S-02) requires a different base.

---

### D-028 — Lazy, validated env access; keys added per phase
- **Date:** 2026-10-19
- **Phase:** 01 — Foundation
- **Status:** Active
- **Type:** tooling

**Context**
Architecture §10 says env is validated with Zod "at startup". But `next build` imports server modules,
and validating at import time would break builds on any machine without a `.env`.

**Decision**
`src/lib/env.ts` exports `env()`, which parses `process.env` with Zod on first call and caches the result.
Error messages list variable **names** only, never values. The schema only contains keys the code
already uses; each phase adds its own (phase 02: `AUTH_SECRET`, `SEED_TEACHER_*`; phase 05: Cloudinary).
`server-only` makes importing it from a client component a build error, so secrets can't leak into the browser bundle.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Validate at import | Builds fail without real secrets |
| Read `process.env.X` directly | Typos become `undefined` at runtime; no single list of required config |
| Declare all future keys now | App would refuse to run until Cloudinary/Auth keys exist, blocking phase 01 |

**Files touched**
- `src/lib/env.ts`, `.env.example`

**Concepts worth learning**
- **Fail fast:** surface misconfiguration at the first use with a clear message instead of a confusing crash later.
- **`server-only`:** a marker package whose import throws in client bundles.

**Revisit if**
n/a

---

### D-029 — Mongo connection settings and the standard API wrapper
- **Date:** 2026-10-19
- **Phase:** 01 — Foundation
- **Status:** Active
- **Type:** architecture

**Context**
Every route needs the same connection handling and the same response/error shape from `api-contracts.md`.

**Decision**
- `src/lib/db.ts`: one cached `connectDB()` stored on `globalThis`, with `bufferCommands: false`,
  `serverSelectionTimeoutMS: 5000`, `maxPoolSize: 10`. A failed connect clears the cached promise so the next request retries.
- `src/lib/api-response.ts`: `AppError(code, message, status)`, `ok()`, `created()` and `withHandler()`.

**Why**
- `bufferCommands: false`: by default Mongoose silently queues queries while disconnected, so a request
  would hang instead of failing. Failing fast lets the exam client's retry logic (D-007) kick in.
- 5 s server selection: health and API calls return a clear error quickly when Atlas is unreachable.
- `globalThis`: Next.js dev hot-reload re-imports modules; a module-level variable would open a new connection each reload.

**How it works**
```ts
export const POST = withHandler(async (req) => {
  const input = Schema.parse(await req.json());   // ZodError → 400 VALIDATION_ERROR
  return created(await service.create(input));    // AppError → its status; anything else → 500 INTERNAL
});
```
Plain return values become `200 { data }`; returning a `Response` (e.g. `created()`) passes through.
Unknown errors are logged with method + path only (never the body, which may contain passwords).

**Files touched**
- `src/lib/db.ts`, `src/lib/api-response.ts`, `src/app/api/v1/health/route.ts`

**Concepts worth learning**
- **Higher-order function:** `withHandler` takes a function and returns a new function with extra behaviour (error handling).
- **Connection pooling:** reusing a small set of open DB connections instead of reconnecting per request.

**Revisit if**
We need request ids / structured logging.

---

### D-030 — Electron shell details: single instance, offline page, dev env loading
- **Date:** 2026-10-19
- **Phase:** 01 — Foundation
- **Status:** Active
- **Type:** architecture

**Context**
Building the shell from D-002/D-009 raised smaller questions: how dev reads `PROCTRA_APP_URL`, what
happens when the server is unreachable, and how the TypeScript is compiled.

**Decision**
- **Compile:** `electron/*.ts` → CommonJS in `electron/dist/` via its own `electron/tsconfig.json`
  (`npm run electron:build`). The root Next.js tsconfig excludes `electron/`; `npm run lint` type-checks both.
- **Config in dev:** `process.loadEnvFile(".env")` (built into Electron 44's Node 24) — no `dotenv`
  dependency. Variables already set in the shell win, so `PROCTRA_APP_URL=… npm run electron` overrides `.env`.
- **Offline:** on a main-frame `did-fail-load` (ignoring `ERR_ABORTED`, which redirects trigger) the window
  loads the local `electron/offline.html` with a Retry button. This replaced the planned `/health` polling — the
  load-failure event already tells us exactly when the server is unreachable.
- **Single instance lock:** a second launch focuses the existing window (two copies could open two exam windows).
- **Quit on last window close, also on macOS:** an exam app shouldn't keep running in the dock.
- **Permissions:** all denied for now; phase 05 allows camera for the app origin only.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Poll `/health` before loading | Extra request + timer for information `did-fail-load` already gives |
| `dotenv` package | Node 24 has `process.loadEnvFile` built in |
| Offline page as a `data:` URL | Harder to read/maintain; a file is also easy to allow-list exactly |

**How it works**
The navigation allow-list (`isAllowedUrl`) accepts only the app origin plus the exact offline-page file
path. The offline page's Retry reads the target from its query string; if someone tampers with it, the
allow-list still blocks anything outside the app origin. Verified in `.scratch/` via the DevTools protocol:
`window.proctra` present, `require`/`process` undefined, `window.open` → `null`, navigation to another
origin blocked, offline page + Retry loop works.

**Files touched**
- `electron/main.ts`, `electron/preload.ts`, `electron/offline.html`, `electron/tsconfig.json`,
  `src/types/proctra.d.ts`, `package.json` (`main`, scripts), `tsconfig.json`, `eslint.config.mjs`

**Concepts worth learning**
- **Main vs renderer process:** main is Node.js and owns windows; each renderer is a sandboxed web page.
- **Chrome DevTools Protocol (CDP):** the debugging API we used to script checks against the running app.

**Revisit if**
Phase 07 packaging needs a different way to provide `PROCTRA_APP_URL`.

---

### D-031 — Deploy with the Vercel CLI; env vars set from .env without echoing
- **Date:** 2026-10-19
- **Phase:** 01 — Foundation
- **Status:** Active
- **Type:** tooling

**Context**
The brief rules out CI/CD pipelines, but the app must be hosted so every student's Electron app reaches one server.

**Decision**
Vercel project `proctra` (account `rajdeep-2004`), deployed manually with `npx vercel deploy --prod`.
Production URL: **https://proctra-mu.vercel.app** (`proctra.vercel.app` was taken). Secrets are added with
`grep '^KEY=' .env | cut -d= -f2- | npx vercel env add KEY production` (and `preview`), so they never
appear on screen or in shell history. A `.vercelignore` excludes `.env*`, `.scratch/` and build output from uploads.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Vercel Git integration (auto-deploy on push) | It's effectively CI/CD, which the brief excludes; also deploys unreviewed phase branches |

**Gotchas hit**
- `vercel link` appends `.env*` to `.gitignore`. Placed after our `!.env.example` rule, it would stop
  `.env.example` being tracked, so that line was removed (our existing rules already ignore `.env.local`).
- `vercel link` writes a short-lived `VERCEL_OIDC_TOKEN` to `.env.local` (gitignored; not used by the app).

**How to deploy**
`npx vercel deploy --prod` from the repo root on `main` after a phase is merged, then
`curl https://proctra-mu.vercel.app/api/v1/health` should return `db: "up"`.

**Revisit if**
The course allows CI, or a stable custom domain is needed for the packaged app.

---

### D-032 — Registration and password handling rules
- **Date:** 2026-10-19
- **Phase:** 02 — Auth & roles
- **Status:** Active
- **Type:** edge-case

**Context**
Student self-registration and password sign-in have several quiet failure modes: role injection,
duplicate emails differing only by case, bcrypt's 72-byte limit, and revealing which emails exist.

**Decision**
- `registerStudent()` hardcodes `role: "student"`; the Zod schema doesn't even include `role`, so `{"role":"teacher"}` is dropped.
- Emails are trimmed + lower-cased in Zod **and** in the Mongoose schema; the unique index on `email` is the real
  guard (a duplicate-key error `11000` becomes `409 CONFLICT`, which also covers two sign-ups racing).
- Passwords: 8+ characters, max **72 bytes** (bcrypt ignores anything after 72 bytes, so longer passwords are rejected instead of silently truncated).
- `verifyCredentials()` always runs one `bcrypt.compare` — against a dummy hash when the email doesn't exist — and returns `null` for any failure.
- `passwordHash` has `select: false`; only `verifyCredentials` asks for it.
- `readJson()` turns malformed JSON into `400 VALIDATION_ERROR` instead of a 500.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Check "email exists" before inserting | Race-prone (two requests both see "not exists"); the unique index is atomic |
| Return early when the email isn't found | Faster response for unknown emails → attacker can enumerate accounts by timing |

**How it works**
bcrypt is deliberately slow (cost 10 ≈ 50–100 ms per hash). Without the dummy compare, "no such user"
would answer in ~1 ms and "wrong password" in ~70 ms, leaking which emails are registered.

**Files touched**
- `src/models/user.ts`, `src/schemas/auth.ts`, `src/services/user-service.ts`,
  `src/app/api/v1/auth/register/route.ts`, `src/lib/api-response.ts` (`readJson`)

**Concepts worth learning**
- **Timing attack / user enumeration:** learning secrets from how long a server takes to answer.
- **Mass assignment:** a client setting fields it shouldn't (here `role`) by adding them to the request body.

**Revisit if**
Email verification or password reset is added.

---

### D-033 — Auth.js v5 beta wiring: pinned version, split + lazy config
- **Date:** 2026-10-19
- **Phase:** 02 — Auth & roles
- **Status:** Active
- **Type:** architecture

**Context**
D-005 chose Auth.js v5. At phase start it turned out v5 has never left beta (`5.0.0-beta.32`, released
2026-07-20; roughly one release every 3–4 months). Next.js 16.4's own auth guide shows a hand-written
`jose` session instead. Asked the user: they chose to stay with Auth.js v5 beta.

**Decision**
- `next-auth` pinned **exactly** to `5.0.0-beta.32` (no `^`), so an install can never pull a different beta with breaking changes.
- **Split config:** `src/auth.config.ts` holds the session strategy, sign-in page and jwt/session
  callbacks with **no DB imports**; `src/auth.ts` adds the Credentials provider. The proxy (02.4) imports only the light part.
- **Lazy config:** `NextAuth(() => ({ …, secret: env().AUTH_SECRET }))` so the secret is validated at
  request time and `next build` works without secrets (D-028). `AUTH_SECRET` must be ≥ 32 chars.
- `requireUser(role?)` in `src/lib/session.ts` is the only way handlers read the user.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| `jose` + own cookie (recommended at the time) | User preferred Auth.js; kept as the fallback if the beta breaks |
| next-auth v4 stable | Legacy API built around the Pages Router |
| `^5.0.0-beta.32` range | Betas may break between releases; exact pin makes installs reproducible |

**How it works**
1. Sign-in form → `GET /api/auth/csrf` gives a token (also stored in a cookie) → `POST /api/auth/callback/credentials` with email, password, token.
2. Auth.js checks the token matches the cookie (CSRF protection), calls our `authorize()` → Zod parse →
   `verifyCredentials()` (D-032). `null` → redirect with `error=CredentialsSignin`.
3. On success the `jwt` callback copies `id` and `role` into the token; Auth.js encrypts it with
   `AUTH_SECRET` into the `authjs.session-token` cookie (HttpOnly, 12 h).
4. `auth()` decrypts the cookie on each request; the `session` callback exposes `user.id` and `user.role`.
5. Type extension: in this beta the JWT type lives in `@auth/core/jwt`, so that module is augmented (`src/types/next-auth.d.ts`).

Verified with curl (`.scratch`): signed-out `/me` → 401; wrong password and unknown email → identical
`CredentialsSignin` redirect; correct login (email in capitals) → `/me` returns the student; cookie HttpOnly
with 12.00 h expiry; sign-out → 401; sign-in without CSRF token → rejected.

**Files touched**
- `src/auth.ts`, `src/auth.config.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/session.ts`,
  `src/app/api/v1/me/route.ts`, `src/types/next-auth.d.ts`, `src/lib/env.ts`, `.env.example`

**Concepts worth learning**
- **CSRF (cross-site request forgery):** another site making your browser submit a form to ours with your cookies; the token proves the form came from our page.
- **Encrypted JWT session (JWE):** the session data travels in the cookie itself, encrypted, so the server needs no session table.
- **Module augmentation:** adding fields to a library's TypeScript interfaces from your own code.

**Revisit if**
A new beta is needed for a bug fix, or Auth.js breaks with a Next.js upgrade → switch to `jose` (Next's documented pattern).

---

### D-034 — Auth forms use Server Actions (exception to D-003)
- **Date:** 2026-10-19
- **Phase:** 02 — Auth & roles
- **Status:** Active
- **Type:** architecture

**Context**
D-003 says mutations go through `/api/v1` route handlers. But Auth.js's sign-in has to run on the server
and set its cookie, and its recommended App Router pattern is calling `signIn()` inside a Server Action.

**Decision**
Sign-in, sign-up and sign-out pages submit to Server Actions in `src/app/(auth)/actions.ts`. Those actions
call the same services as the API (`registerStudent`, Auth.js `signIn` → `verifyCredentials`), so rules
still live in one place. `POST /api/v1/auth/register` stays for API clients/scripts. Every other feature keeps using `/api/v1`.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Client `fetch` to `/api/v1/auth/register` then `signIn()` from `next-auth/react` | Two round trips, and client-side Auth.js adds a SessionProvider + extra JS |

**How it works**
1. The form is a Client Component using React's `useActionState(action, {})`; `pending` disables the button.
2. The action validates with the same Zod schema, then calls `signIn("credentials", { …, redirectTo: "/" })`.
3. On success `signIn` **throws** Next's redirect signal — the action must re-throw anything that isn't an
   `AuthError`, or the redirect would be swallowed.
4. On failure the action returns `{ error | fieldErrors, values }`; the form re-renders with messages and
   keeps name/email (never the password). Fields use `aria-invalid` + `aria-describedby` for screen readers.
5. Server Actions are POST-only and Next checks the `Origin` header, which gives CSRF protection for sign-out.

Verified in Electron via CDP: wrong password → generic alert, email kept; duplicate email → field error;
empty/invalid fields → three field errors; new sign-up → signed in immediately (`/me` returns the student).

**Files touched**
- `src/app/(auth)/actions.ts`, `src/app/(auth)/layout.tsx`, `src/app/(auth)/sign-in/page.tsx`,
  `src/app/(auth)/sign-up/page.tsx`, `src/components/auth/*`, `src/app/page.tsx`, shadcn `card/input/label/alert`

**Concepts worth learning**
- **Server Action:** a server function a form can call directly; Next.js creates the POST endpoint for you.
- **Progressive enhancement:** `<form action={…}>` works even before JavaScript loads.

**Revisit if**
Auth moves off Auth.js.

---

### D-035 — Route guarding: proxy redirects + page re-checks; cookie flush in Electron
- **Date:** 2026-10-19
- **Phase:** 02 — Auth & roles
- **Status:** Active
- **Type:** architecture

**Context**
Users must land on their role's dashboard and never see the other role's pages. Next.js 16 renamed
middleware to `proxy.ts`, and Cache Components changes how session reads must be written.

**Decision**
Three layers, each with one job:
1. **`src/proxy.ts`** — optimistic redirects from the cookie only (no DB): signed-in users skip `/`,
   `/sign-in`, `/sign-up`; signed-out users are sent from `/student*`, `/teacher*`, `/exam*` to `/sign-in`;
   wrong role → own dashboard; `/exam*` is students only.
2. **Pages** — `requirePageUser(role)` inside `<Suspense>` (signed out → `/sign-in`, wrong role → own dashboard).
3. **API** — `requireUser(role)` → 401/403 (the real security boundary, unchanged).

**Problems hit and how they were solved**
- `export default auth((req) => …)` (Auth.js's documented middleware form) made **every page 500** in
  Next 16: "The Proxy file must export a function named `proxy` or a default function" — the wrapped
  value isn't recognised. With the lazy config its TypeScript type is also the route-handler form. Fix:
  a plain `export async function proxy(req)` that calls `await auth()` itself (the shape Next's own docs use).
- Dev overlay **"Blocking Route"**: `auth()` calls `crypto.getRandomValues()` before it reads the cookie,
  so during prerendering Next sees "random value" instead of "request data". Fix: `await connection()`
  at the top of `getSessionUser()` marks it request-time first.
- **Sign-out undone by a crash:** Chromium writes cookie changes to disk lazily. After sign-out and a
  force-quit, Electron reloaded the old session cookie — on a shared lab Mac the next student would be
  signed in as the previous one. Fix: `session.cookies.on("changed")` → `flushStore()` (debounced 200 ms).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Proxy only | Proxy is skippable in principle (matcher mistakes, future routes); pages/API must check themselves |
| DB lookup in proxy | Runs on every navigation and prefetch — Next's docs warn against it |
| Clear all cookies on app start | Would sign users out on every launch; persistence across restarts is wanted |

**How it works**
Result: `/student` and `/teacher` are **partially prerendered** — header and title are static HTML; the
user name and page content stream in. Verified with curl (all redirect cases above, tampered cookie →
treated as signed out) and in Electron with `kill -9` (signed-in survives a hard kill; sign-out survives a hard kill).

**Files touched**
- `src/proxy.ts`, `src/lib/session.ts` (`requirePageUser`, `connection()`), `src/components/layout/app-header.tsx`,
  `src/app/student/*`, `src/app/teacher/*`, `electron/main.ts` (cookie flush)

**Concepts worth learning**
- **Defense in depth:** several independent checks, so one mistake doesn't expose data.
- **Partial prerendering:** static shell served instantly, dynamic holes streamed in.
- **Write-back caching:** data changed in memory and written to disk later — fast, but lost on a crash unless flushed.

**Revisit if**
Auth.js ships a Next-16-native proxy helper.

---

### D-036 — Teacher seed script with tsx; never silently promote a student
- **Date:** 2026-10-19
- **Phase:** 02 — Auth & roles
- **Status:** Active
- **Type:** tooling

**Context**
Teachers can't self-register, so an admin needs a repeatable way to create them. The script must reuse
the app's models/services (which use the `@/` path alias and the `server-only` guard).

**Decision**
`npm run seed` = `tsx --conditions=react-server scripts/seed-teachers.ts`. Added **`tsx`** as a
devDependency: it runs TypeScript directly and understands the tsconfig `@/` alias; `--conditions=react-server`
makes `import "server-only"` resolve to its no-op server version. The script reads `.env` with Node's
built-in `process.loadEnvFile` (real environment variables win), validates `SEED_TEACHER_*` with the same
`RegisterInput` schema as sign-up, and calls `upsertTeacher()`.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Plain `node` + compiled JS | Needs a separate build step and alias rewriting |
| `npx tsx` without installing | Unpinned version on every run; teammates get different behaviour |
| Seed endpoint in the app | A route that can create teachers is an attack surface |

**How it works**
Upsert by email → running it twice updates name/password instead of duplicating. If the email belongs
to a **student**, it stops with an error unless `--promote` is passed, so a typo can't silently hand a
student teacher powers. It prints only name + email, never the password. Verified: create → update →
student collision refused → invalid password rejected with a clear message.

Note: local dev and production share one Atlas database, so a seeded teacher works in both.

**Files touched**
- `scripts/seed-teachers.ts`, `package.json` (`seed` script, `tsx` devDependency)

**Concepts worth learning**
- **Idempotent script:** safe to run any number of times with the same end state.
- **Principle of least surprise:** destructive or privilege-changing actions require an explicit flag.

**Revisit if**
Multiple teachers need seeding (switch to a CSV/JSON list).

---

### D-037 — Quiz validation in two layers; times are UTC with explicit offsets
- **Date:** 2026-10-19
- **Phase:** 03 — Quiz management
- **Status:** Active
- **Type:** data

**Context**
Quizzes have many rules (2–6 options, a valid correct option, window order, mark ranges) and a
schedule entered by a teacher in local time but enforced by a server running in UTC.

**Decision**
- **Zod `QuizInput`** (`src/schemas/quiz.ts`) validates every request and drives the editor's error
  messages; **Mongoose validators** (`src/models/quiz.ts`) repeat the critical rules as a last line of defence.
- Times travel as ISO-8601 strings **with an offset** (`2026-10-22T15:30:00+05:30` or `…Z`). A string
  without an offset (`2026-10-22T10:00`) is rejected, because the server can't know whose 10:00 it is.
  The editor converts the browser's `datetime-local` value with `new Date(local).toISOString()`; MongoDB
  stores UTC; every screen formats in the viewer's own time zone.
- Drafts may have zero questions, but every question present must be complete. Publishing needs ≥ 1 question.
- Marks: any number in −100…100, fractions allowed (e.g. 0.25 for "¼ negative marking").

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Store local time + a time-zone name | More complex; every viewer here shares one time zone anyway, and UTC + local display covers it |
| Allow incomplete questions in drafts | Needs a second, looser schema and "is it publishable?" checks everywhere |
| Validate only in Mongoose | Errors arrive late (on save) and in a shape that's awkward to map to form fields |

**How it works**
Zod `refine` rules attach errors to exact paths (`questions.0.correctIndex`, `endsAt`) so the editor can
show each message next to its field. Verified by `.scratch/quiz-schema.test.ts` (10 cases incl. IST offset
→ UTC, out-of-range correct option, 1 and 7 options, duplicate ids, whitespace-only text).

**Files touched**
- `src/models/quiz.ts`, `src/schemas/quiz.ts`

**Concepts worth learning**
- **UTC storage, local display:** store one unambiguous instant, convert only at the edges (input and display).
- **Defence in depth for data:** request validation for good UX, DB validation so bad data can't slip in from other code paths.

**Revisit if**
Students in different time zones need a single "official" display zone.

---

### D-038 — Quiz service: validate in memory, write with one conditional update
- **Date:** 2026-10-19
- **Phase:** 03 — Quiz management
- **Status:** Active
- **Type:** algorithm

**Context**
Saving the editor replaces the whole quiz (D-022) and must (a) run the Mongoose validators, (b) keep
existing question ids, and (c) never overwrite questions after a student has started (`locked`), even if
the teacher saves at the same instant a student starts.

**Decision**
`updateQuiz()` does: load + ownership check → map questions (keep known ids, new id for `null`, 400 for
an id from another quiz) → `new Quiz(fields).validate()` in memory → one `findOneAndUpdate` whose filter
includes `locked: false`. If it matches nothing, reload to report the exact reason (`QUIZ_LOCKED` vs archived).
State changes (`publish`/`unpublish`/`archive`) are each one conditional update on the current status
(plus "has a question" and "window not over" for publish).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| `findOneAndUpdate(..., { runValidators: true })` | Update validators run with `this` = the query, so the "correctIndex < options.length" check can't see the options |
| Load the document, change it, `save()` | Not atomic against a concurrent "lock" from a starting student unless we add version checks |
| Check status in JS, then update unconditionally | Two requests can both pass the check (time-of-check vs time-of-use race) |

**How it works**
```ts
await new Quiz({ ...current, ...changes }).validate();          // all rules, correct `this`
const updated = await Quiz.findOneAndUpdate(
  { _id: quizId, teacherId, locked: false, status: { $ne: "archived" } }, // the guard IS the filter
  { $set: changes }, { returnDocument: "after" });
if (!updated) /* reload → QUIZ_LOCKED or INVALID_STATE */;
```
`attemptCount` is read from the raw `attempts` collection with one `$group` aggregation, so the dashboard
works now (always 0) and becomes correct in phase 04 without code changes.

Verified by `.scratch/quiz-api.check.mts` against the running app (24/24): roles (403/401), create, reorder
with id preservation, foreign id → 400, other teacher → 403, every state transition, locked rules, archive is final.

**Files touched**
- `src/services/quiz-service.ts`, `src/app/api/v1/teacher/quizzes/**/route.ts`, `src/models/quiz.ts` (explicit TS types)

**Concepts worth learning**
- **TOCTOU race (time-of-check to time-of-use):** checking a condition and acting on it in two steps lets another request slip in between.
- **Compare-and-set:** put the condition in the update's filter so check and write are one atomic step.

**Revisit if**
Teachers need collaborative editing (then add version numbers / optimistic concurrency).

---

### D-039 — Quiz editor: browser-only render, whole-quiz save, local-time display
- **Date:** 2026-10-19
- **Phase:** 03 — Quiz management
- **Status:** Active
- **Type:** architecture

**Context**
The editor shows date-times in the teacher's time zone, but pages are first rendered on a server running
in UTC (Vercel). Rendering a date on the server and again in the browser produces two different strings
(a hydration mismatch) and, worse, a wrong time if the server's version sticks.

**Decision**
- `QuizEditor` renders a skeleton on the server and the real editor only in the browser, using a
  `useIsClient()` hook built on `useSyncExternalStore` (server snapshot `false`, client snapshot `true`).
- Read-only dates elsewhere use `<LocalTime iso>` with the same technique: placeholder on the server,
  `Intl.DateTimeFormat` in the browser right after hydration.
- Form state keeps numbers as **strings** (so typing `-` or `0.` isn't mangled) and converts on save
  (`toPayload`). Saving sends the whole quiz (D-022); the response replaces the form so new questions get their ids.
- Errors come from the server's Zod issues, mapped by path (`questions.1.options.0`) next to each field —
  no second copy of the rules in the browser.
- Publish/unpublish are disabled while there are unsaved changes ("save first"); a `beforeunload` prompt
  warns about leaving with unsaved changes; archive asks for confirmation.
- Locked quizzes disable question/marking/start/duration fields and explain why; archived is fully read-only.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| `useEffect(() => setState(...))` after mount | Flagged by React's lint rule (extra render cascade); `useSyncExternalStore` is the idiomatic way |
| `suppressHydrationWarning` | Silences the warning but keeps the server's (UTC) text |
| `next/dynamic(..., { ssr: false })` | Works too; the hook keeps it explicit and reusable for other browser-only UI |
| react-hook-form / form library | Another dependency; one form with a simple shape doesn't need it |

**How it works**
`stateFromQuiz()` turns API data into form state (ISO → `datetime-local` string in local time);
`toPayload()` does the reverse (`new Date("2026-10-19T10:00")` is parsed as local time → `.toISOString()`).
Verified in Electron against a production build: empty submit → 5 field errors; create → URL switches to
`/teacher/quizzes/<id>`; add option, pick correct, add second question, move it up, save → order persists after
reload; publish → badge + message; dashboard lists the quiz with local times (10:00 IST shown for 04:30Z).

**Gotchas found while testing (not app bugs)**
- `next start` on localhost needs `AUTH_TRUST_HOST=true` (Auth.js only auto-trusts the host on Vercel or in dev).
- A long-running `next dev` stopped running `proxy.ts` (all routes 200); restarting it fixes it.
- Scripted checks against a hidden/covered Electron window see streamed sections "stuck": Chromium doesn't
  paint hidden windows, and React 19 reveals streamed Suspense content on the next animation frame. Forcing a
  frame (a screenshot) reveals it. Real, visible windows are unaffected.

**Files touched**
- `src/components/quiz/*`, `src/components/local-time.tsx`, `src/lib/use-is-client.ts`, `src/lib/datetime.ts`,
  `src/lib/api-client.ts`, `src/app/teacher/page.tsx`, `src/app/teacher/quizzes/new/page.tsx`,
  `src/app/teacher/quizzes/[quizId]/page.tsx`, shadcn `table/badge/textarea/radio-group/alert-dialog`

**Concepts worth learning**
- **Hydration:** React attaching to server-rendered HTML; both renders must produce the same markup.
- **`useSyncExternalStore`:** subscribes to values outside React and lets server and client snapshots differ safely.
- **Controlled inputs:** React state is the source of truth for each input's value.

**Revisit if**
Teachers need autosave of drafts or collaborative editing.

---

### D-040 — Student quiz views: projection-only reads; streamed 404 pages
- **Date:** 2026-10-19
- **Phase:** 03 — Quiz management
- **Status:** Active
- **Type:** api

**Context**
Students must see published quizzes (D-016) and their timing, but never the questions or answers before
an attempt, and must not be able to tell a draft from a missing quiz.

**Decision**
- `listQuizzesForStudent()` uses an aggregation `$project` that keeps title/timing and maps questions to
  `{_id}` only (to count them), so question text and `correctIndex` never leave the database for this view.
- `getQuizForStudent()` filters `{ status: "published" }`; draft/archived/missing all → `404`.
- `availability` (`upcoming` / `open` / `closed`) is computed on the server from UTC instants at request time.
- Dashboard groups: Open now → Upcoming → Closed (closed group hidden when empty).
- `myAttempt` reads the `attempts` collection directly until phase 04 adds the model (same trick as D-038).

**Streamed 404 status**
`notFound()` inside a `<Suspense>` boundary runs after the page shell (status 200) has already been
sent, so the browser gets the not-found screen and a `noindex` tag, but HTTP status 200. Verified the draft's
title is not in the HTML. The **API** returns a real 404. Accepted: the page is only used inside the app; the
alternative (blocking the whole page until the DB answers) gives up streaming for no user-visible gain.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| `find()` then strip fields in JS | Question text would still be read from DB and sit in server memory/logs; projection is safer by construction |
| 403 for drafts | Reveals that a quiz with that id exists |

**Files touched**
- `src/services/quiz-service.ts` (student section), `src/app/api/v1/quizzes/**`, `src/app/student/page.tsx`,
  `src/app/student/quizzes/[quizId]/page.tsx`, `src/components/quiz/availability-badge.tsx`

Verified by `.scratch/student-quiz.check.mts` (15 API/page checks: grouping, draft hidden, archived 404,
no `SECRET` question text or `correctIndex` in list/detail/HTML, teacher 403, signed-out 401) and screenshots.

**Concepts worth learning**
- **Projection:** asking the database for only the fields you need — less data moved, less to leak.
- **Information disclosure:** different errors for "exists but hidden" vs "doesn't exist" leak information.

**Revisit if**
Search engines or external links ever need correct 404 status codes for these pages.

---

### D-041 — Fixed exam slot: duration derived from start/end; extend-only end time
- **Date:** 2026-10-19
- **Phase:** 03 — Quiz management (change request during review)
- **Status:** Active
- **Type:** data

**Context**
The original model had an *availability window* (start/end) plus a separate *duration*, with
`deadline = min(startedAt + duration, endsAt)` (D-006). The user pointed out that two independent inputs can
conflict (e.g. a 90-minute duration inside a 60-minute window) and asked for one source of truth: the teacher
picks start and end, the server computes the duration. Students should also see a live "starts in" countdown.

**Decision**
- A quiz is a **fixed exam slot**: `startsAt` → `endsAt`, 1 minute to 5 hours long. `durationMinutes` is no longer
  stored or accepted; responses include it computed as `round((endsAt − startsAt) / 60 000)`.
- Every attempt's `deadline = quiz.endsAt` (replaces D-006's formula). A student who starts 10 minutes late has 10 minutes less.
- Once `locked` (first attempt started): start time, questions and marking are frozen; the end time may only
  move **later**. Extending also runs `updateMany({ quizId, status: "active" }, { $set: { deadline: newEndsAt } })`
  so everyone gets the extra time; it can never shorten a running exam.
- Students see a live countdown driven by **server time**: "Starts in 1h 23m 10s" → "Ends in 42m 05s" → "Closed".

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Keep window + duration, validate duration ≤ window | Still two inputs to keep consistent; user wants a single exam slot |
| Compute deadline live from `quiz.endsAt` instead of storing it on the attempt | Every answer save would need a second read; the stored copy keeps saves a single atomic, conditional update |
| Allow shortening the end time | Could end running exams early without warning |

**How it works**
Countdown: the server sends `serverNow`; the browser computes `offset = serverNow − Date.now()` once and
then shows `target − (Date.now() + offset)` every second, so a wrong laptop clock doesn't matter. When it
crosses zero the page refreshes so the Start button / status update. The countdown is display only — the
server still decides whether an attempt may start.

**Bug found while implementing**
Zod runs object-level `.refine()` checks even when a field inside already failed. A date without a time
zone stayed a string, so the new slot-length check called `.getTime()` on a string → a 500 instead of a 400.
Both date refinements now run only when both dates parsed (`bothDates()` guard). Verified: no-zone dates → `400`
with one issue per field.

**Verified**
API (29/29): derived duration (4 h → 240) with `durationMinutes` input ignored; locked → start change 409, end
earlier 409 on `endsAt`, later end 200 and a fake **active** attempt's deadline moved while a **submitted** one
didn't. Schema tests: 30 s and 5 h + 1 s rejected, exactly 1 min and 5 h accepted.

Countdown verified live in Electron: a quiz starting in 70 s showed "Starts in 0m 56s" ticking down; at the start
it switched to "Ends in 19m 45s" and the page refreshed itself (badge Upcoming → Open now). One shared 1-second
ticker (`useSyncExternalStore`) drives all countdowns; `role="timer"` + `aria-live="off"` so screen readers aren't spammed.

**Files touched**
- Docs: `prd.md` (F-02, F-03, flows), `database-schema.md`, `api-contracts.md`, `system-design.md`, phase 03/04 files
- Code (03.7–03.8): `src/models/quiz.ts`, `src/schemas/quiz.ts`, `src/services/quiz-service.ts`, editor, student pages, countdown component

**Concepts worth learning**
- **Single source of truth / derived data:** store the minimal facts (start, end) and compute the rest, so they can't disagree.
- **Clock skew:** client clocks can be wrong; use the server's time and an offset for anything time-critical.

**Revisit if**
The course wants per-student timers (e.g. "60 minutes from whenever you start within a day-long window").

---

### D-042 — Attempt lifecycle: insert-or-read start, atomic grade-and-close with optimistic retry
- **Date:** 2026-10-19
- **Phase:** 04 — Taking the exam
- **Status:** Active
- **Type:** algorithm

**Context**
Starting, saving and submitting race each other: double-clicked Start, two windows, a last-second answer
save arriving together with the auto-submit, or a teacher saving while a student starts.

**Decision**
- **Start:** check for an existing attempt (resume/finished) → lock the quiz with a conditional update that also
  enforces `published` and `startsAt ≤ now < endsAt` → read the quiz **after** locking → `Attempt.create(...)`. If the
  unique index `{quizId, studentId}` rejects the insert (duplicate key `11000`), read the attempt the other request made.
- **Close (submit / auto / lazy):** read the attempt, grade its answers, then one `findOneAndUpdate` filtered on
  `{ status: "active", updatedAt: <what we graded> }` that sets status, `submittedAt` and `score` together. If an answer
  save changed `updatedAt` in between, the write misses → re-read, re-grade (up to 5 tries). The close write uses
  `timestamps: false` so `updatedAt` keeps meaning "last answer change".
- Submitting at or after the deadline is recorded as `auto_submitted` with `submittedAt = deadline`.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Upsert with `includeResultMetadata` to learn "created vs existing" | Works, but awkward typing; insert + duplicate-key fallback is one clear path for both cases |
| Flip status first, grade in a second write | A crash between the writes leaves a submitted attempt without a score |
| Transactions | Needs a replica set session for every write; a conditional single-document update is enough here |

**How it works**
Every write that matters is a single-document update whose filter states the condition it depends on
(`status: "active"`, `deadline > now − 5 s`, `updatedAt: x`). MongoDB applies single-document updates atomically, so the
condition and the change can't be separated by another request.

Verified by `.scratch/attempt-api.check.mts` (32/32): 5 parallel starts → 1 attempt; window enforced; quiz locked;
no `correctIndex` while active; saves validated (range, foreign question, other student → 404); submit score = hand
calculation (4 − 1 + 0 = 3); idempotent submit; save after submit → `ATTEMPT_CLOSED`; hidden results until release;
expired attempt auto-submitted on read with `submittedAt = deadline`; 8 saves racing a submit → stored score equals
the stored answers; teacher extension moves active deadlines.

**Files touched**
- `src/models/attempt.ts`, `src/schemas/attempt.ts`, `src/services/attempt-service.ts`, `src/services/grading.ts`,
  `src/app/api/v1/quizzes/[quizId]/attempts/route.ts`, `src/app/api/v1/attempts/**`, `src/services/quiz-service.ts`
  (attempt helpers now use the model and finalize expired attempts first)

**Concepts worth learning**
- **Optimistic concurrency control:** don't lock; instead write only if the data is still what you read, and retry if not.
- **Idempotency:** repeating start/submit/save gives the same outcome, so retries and double-clicks are harmless.

**Revisit if**
Writes per attempt grow enough that retries become frequent (then use a per-attempt version counter).

---

### D-043 — Exam UI: one question at a time, native radios, shared server clock
- **Date:** 2026-10-19
- **Phase:** 04 — Taking the exam
- **Status:** Active
- **Type:** architecture

**Decision**
- `/exam/[attemptId]` has its own bare layout (title + timer only, no app navigation) so phase 05 can show it in a kiosk window as is.
  A finished attempt redirects to `/student/attempts/[id]`.
- One question per screen with Previous/Next, a palette (filled = answered, outline = not answered, flag = marked,
  ring = current) and counts. "Clear answer" sets the selection back to none.
- Options are **native `<input type="radio">`** inside large clickable `<label>` cards: keyboard arrows, focus and screen
  readers work for free, no animation on exam controls (D-015).
- Timers use one shared hook, `useServerNow(serverNow)` (`src/lib/server-clock.ts`): a single 1-second ticker, with the
  device clock corrected by the server's time. The countdown (D-041) was refactored onto the same hook. `ExamTimer` turns red
  under 5 minutes and calls `onExpire` exactly once at zero (used by auto-submit in 04.5).

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| All questions on one long page | Harder to see progress; palette navigation is the expected exam pattern (brief §6.3) |
| Radix RadioGroup | Native radios already give the needed accessibility with less code |

**Files touched**
- `src/app/exam/[attemptId]/page.tsx`, `src/components/exam/{exam-client,exam-timer,question-palette}.tsx`,
  `src/lib/server-clock.ts`, `src/components/quiz/countdown.tsx`

**Revisit if**
Exams need sections or very long questions with images.

---

### D-044 — Submit only after saves are confirmed; auto-submit with server backstop
- **Date:** 2026-10-19
- **Phase:** 04 — Taking the exam
- **Status:** Active
- **Type:** edge-case

**Context**
Submitting while some answers exist only in the browser's queue would grade the attempt without them. At the
deadline the student can't wait, and the network may be down.

**Decision**
- **Manual submit:** confirmation dialog (answered / not answered / marked counts) → `autosave.flush(8 s)` → only if every
  answer is confirmed, `POST /submit` (3 tries) → result page. If saves aren't confirmed, nothing is submitted and the student is told
  their answers are safe and to retry.
- **Timer at zero:** full-screen "Time's up — submitting…" overlay (blocks further clicks) → `flush(4 s)` (the server accepts saves for
  5 s after the deadline) → `POST /submit` (5 tries) → result page. If the network is down, the server's lazy finalization
  (D-006) closes and grades the attempt on its next read, so the result is the same.
- **Start / Resume / View result** on the quiz page (`StartButton`): one attempt per quiz; resuming shows the same attempt with saved
  answers and a reminder that time keeps running. A finished attempt's `/exam/:id` redirects to `/student/attempts/:id`, and an
  active attempt's result URL redirects back to the exam.
- **Result page:** score `total / maxPossible`, correct/wrong/unanswered counts, per-question review (your answer vs correct) — only when
  released; otherwise "Marks will be shown from <time>".

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Submit immediately and let pending saves race | Pending answers could arrive after grading and be rejected (`ATTEMPT_CLOSED`) |
| Send all answers in the submit request | Duplicates the save path and lets the client overwrite saved answers at the last moment |

**How it works / verified**
Electron run: start from the quiz page → answer 2 → leave → "Resume exam" restored both → confirmation dialog showed 2 of 5 →
result page 3 / 20 (4 − 1 + 0×3). Timeout run with 1-minute quiz: timer 0m 02s at 10:23:22, overlay at the deadline, result page
"Submitted automatically when time ran out" ~3 s later; stored `submittedAt` = deadline exactly.

**Files touched**
- `src/components/exam/{exam-client,submit-dialog}.tsx`, `src/components/quiz/start-button.tsx`,
  `src/app/student/quizzes/[quizId]/page.tsx`, `src/app/student/attempts/[attemptId]/page.tsx`

**Revisit if**
Kiosk mode (phase 05) needs to close the window before navigating to the result.

---

### D-045 — Kiosk exam window lifecycle, camera-only permission, dev test switches
- **Date:** 2026-10-19
- **Phase:** 05 — Kiosk window & camera
- **Status:** Active
- **Type:** architecture

**Context**
The exam must run in a focused, full-screen window (F-05) with camera access (F-04), without giving the web page
more power than it needs (D-009) — and it must be testable by scripts without taking over the developer's screen.

**Decision**
- `startExam(id)` → main creates a second `BrowserWindow` with `kiosk: true`, `fullscreen`, `closable: false`,
  `minimizable: false`, always-on-top at `"screen-saver"` level, loads `/exam/:id`, and **hides** the main window.
  One exam window at a time. `endExam(id)` (called by the exam page on submit, time's up or `ATTEMPT_CLOSED`) destroys it
  and loads `/student/attempts/:id` in the main window. If the exam window closes any other way, the main window reappears.
- IPC handlers check the **sender frame's origin** is the app, and validate the attempt id (24-hex); the server still checks ownership.
- Permissions: only `media` with **video only**, only for the app origin. Microphone is always denied.
- `requestCamera()` reads macOS's camera status first and only shows the system prompt when the user hasn't decided yet
  (after a "deny", macOS never asks again — the page must send the student to System Settings).
- Dev-only switches (ignored when packaged): `PROCTRA_FAKE_CAMERA=1` (Chromium fake camera, no real device/prompt) and
  `PROCTRA_KIOSK=0` (normal window). No auto-accept switch, so the permission handler is still exercised in tests.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Turn the main window itself into kiosk mode | Main window keeps the dashboard state; a separate window is cleaner to open/close and to lock down |
| `use-fake-ui-for-media-stream` in tests | It auto-accepts every request (even microphone) and bypasses our handler — found when the mic test wrongly passed |

**Limitations (documented, not hidden)**
Kiosk is not a lockdown: Cmd+Q (kept on purpose, D-048), other devices, the power button and a second screen still work.
(Correction: macOS kiosk mode *does* disable the Force Quit dialog and app switching — see D-048.) Quitting simply leaves the
attempt active; on relaunch the student can resume (time keeps running) or it auto-submits at the deadline.

**Verified (Electron, fake camera, windowed):** Start → exam window opened, main window hidden; `startExam("../../etc")` and
`endExam(<other id>)` → `{ ok: false }`; asking to start again → focuses the same window; camera granted (`fake_device_0`),
microphone and camera+mic denied (`NotAllowedError`; Permissions API: camera=granted, microphone=denied); Submit → exam
window gone, main window on the result page.

**Files touched**
- `electron/main.ts`, `electron/preload.ts`, `src/types/proctra.d.ts`, `src/components/quiz/start-button.tsx`,
  `src/components/exam/exam-client.tsx`

**Concepts worth learning**
- **IPC sender validation:** the main process must not trust which page is calling — check the frame's origin.
- **macOS TCC:** the OS-level privacy database; apps get one prompt per permission, later changes go through System Settings.

**Revisit if**
The course requires stronger lockdown (then a dedicated lockdown browser is needed — out of scope).

---

### D-046 — Proctor events and the hidden exam camera
- **Date:** 2026-10-19
- **Phase:** 05 — Kiosk window & camera
- **Status:** Active
- **Type:** architecture

**Decision**
- **Events** (`proctorEvents`, separate collection per D-020): the exam page logs `window_blur/focus`, `tab_hidden/visible`,
  `fullscreen_exit`, `camera_lost/restored`, `snapshot_failed`; the server alone logs `resumed`. The client buffers them and
  POSTs every 5 s plus a final `keepalive` flush when proctoring stops. Server: owner check, accepts until 30 s after the attempt
  ends, clamps `occurredAt` into the attempt's span, caps 2 000 per attempt. Wording is neutral everywhere (PRD §9).
- **Camera** (`useExamCamera`): `getUserMedia` (640×480, no audio) plays into a `<video>` element that is **never attached to the
  page** (no preview, F-07). A 2 s health check + `ended`/`devicechange` listeners detect loss; while lost it retries every 2 s.
  `grabFrame()` draws the current frame to a canvas → JPEG (q 0.7) for snapshots (05.3).
- **Camera-loss overlay:** blocks the question area (header with timer stays visible) until the camera is back; the deadline is
  unchanged (D-010). Proctoring (camera + events) stops when the student submits or time runs out.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Hidden `<video>` with CSS | Still in the DOM/accessibility tree; an element never attached is simpler and can't be shown by accident |
| Send each event immediately | Many tiny requests (every Cmd+Tab); a 5 s batch is enough for a teacher's timeline |

**Verified:** Electron (fake camera) — camera live with 0 `<video>` elements in the DOM; stopping the track → overlay within 2 s,
timer still counting; stays while the camera is unavailable; returns → overlay gone, new live stream; stored events include
`camera_lost`, `camera_restored`, `window_blur`, `window_focus`. API (11/11): unknown type 400, client `resumed` 400, batch
limits, other student 404, teacher 403, times clamped, server `resumed` on resume, final flush accepted, 60 s later 409.

**Files touched**
- `src/models/proctor-event.ts`, `src/schemas/proctor.ts`, `src/services/proctor-service.ts`,
  `src/app/api/v1/attempts/[attemptId]/events/route.ts`, `src/services/attempt-service.ts` (resumed event),
  `src/components/exam/{use-proctor-events,use-exam-camera}.ts`, `src/components/exam/exam-client.tsx`

**Revisit if**
Teachers need more signals (e.g. screen count) — Electron could report them from main, but only neutral facts.

---

### D-047 — Leave kiosk before revealing the result window (macOS Spaces bug)
- **Date:** 2026-10-19
- **Phase:** 05 — Kiosk window & camera
- **Status:** Active
- **Type:** edge-case

**Context**
In the user's real kiosk test, submitting closed the exam window and the app seemed to quit. Automated tests had passed
because they used `PROCTRA_KIOSK=0` (normal window). There was no crash report, and the app process was still alive with the
result page loaded — Electron even reported the main window as visible and focused. But macOS's own window list
(`CGWindowListCopyWindowInfo`, on-screen only) showed **no** Proctra window.

**Cause**
macOS puts a full-screen/kiosk window in its own Space. We destroyed the exam window and immediately showed the (hidden) main
window while that Space was still being torn down, so the main window was "shown" somewhere the user couldn't see.

**Decision**
`closeExamWindow()` now: loads the result page in the main window → turns off always-on-top, kiosk and full screen on the exam
window → waits for `leave-full-screen` (1.5 s fallback) → destroys it → after 150 ms shows, raises and focuses the main window
and calls `app.focus({ steal: true })`. The exam window's `closed` handler only re-shows the main window if the exam window
closed *unexpectedly*, so the two paths don't race. Dev-only `[proctra]` traces log the lifecycle.

**Verified** with real kiosk mode (fake camera) and the macOS on-screen window list: during the exam a 1800×1130 kiosk window;
after submit the trace shows `leave-full-screen → exam window closed → main revealed`, and a 1200×800 Proctra window is on
screen with the result page. Before the fix the same probe showed no Proctra window at all.

**Lesson**
Test the real mode at least once: the windowed test switch (D-045) hid exactly the behaviour that differs.

**Files touched**
- `electron/main.ts`

**Concepts worth learning**
- **macOS Spaces:** full-screen windows get their own virtual desktop; windows shown during a Space transition can land off-screen.
- **Verify from the OS's point of view:** the app's own state ("visible: true") can disagree with what the user actually sees.

---

### D-048 — Cmd+Q quits during the kiosk exam (scoped global shortcut)
- **Date:** 2026-10-19
- **Phase:** 05 — Kiosk window & camera
- **Status:** Active
- **Type:** edge-case

**Context**
In the user's real test, Cmd+Q did nothing inside the exam window. Electron's macOS kiosk mode sets presentation options that
hide the Dock and menu bar and **disable the app menu**, app switching and the Force Quit dialog — so the menu's Cmd+Q never
fires. Our docs had wrongly said Cmd+Q and Force Quit still work. Asked the user: they want Cmd+Q to quit during the exam.

**Decision**
While (and only while) the exam window exists, register an OS-level shortcut `globalShortcut.register("CommandOrControl+Q")` →
`app.quit()`. It's unregistered when the exam window closes (submit, time's up, unexpected close) and on `will-quit`, so normal
windows use the regular menu shortcut. `before-quit` takes the exam window out of kiosk and destroys it first, because a
`closable: false` kiosk window would otherwise block quitting and leave the Dock/menu bar hidden.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| `webContents.on("before-input-event")` in the exam window | Tried first; couldn't be verified (DevTools-injected keys bypass it), and it depends on the page having focus |
| Keep Cmd+Q blocked | User wants students to be able to quit; the attempt is safe either way (resume / auto-submit) |
| An IPC "quit" button in the exam page | Adds a desktop capability to the page (D-009); a keyboard shortcut needs no new bridge |

**What quitting means for the attempt**
Nothing is lost: every answer is saved on click (D-007). The attempt stays `active` with the same deadline; relaunching shows
**Resume exam** (camera check again, a `resumed` event is logged), or the server auto-submits at the deadline (D-006).

**Verified:** windowed run — `exam Cmd+Q shortcut registered: true` when the exam opens, removed after submit; quitting runs
`before-quit` with the exam window torn down. The physical keypress in real kiosk mode can't be simulated without macOS Accessibility permission — **confirmed by the user's manual
test**: Cmd+Q quit the app during the exam, and relaunching showed Resume with the earlier answers.

**Files touched**
- `electron/main.ts`, `docs/system-design.md`, D-045 limitation text corrected

**Concepts worth learning**
- **Global shortcut:** an OS-level hotkey registered by the app; must be removed when no longer needed so it doesn't hijack keys elsewhere.

---

### D-049 — Live leaderboard for students who finished; profile lists active attempts
- **Date:** 2026-10-20
- **Phase:** 06 — Results, profile & leaderboard
- **Status:** Active
- **Type:** api

**Context**
The plan said students see a leaderboard "once results are released". Asked when exactly; the user wants it **live**: a
student who finishes can see the leaderboard right away, and their position updates as classmates finish.

**Decision**
- Teacher (owner): always. Student: only after **finishing their own attempt** of that quiz (so it never leaks to someone who
  hasn't taken it yet) **and** once results are released — the teacher's "show results at" time still hides it, consistent with marks.
- Only finished attempts are ranked; `stillWriting` counts active ones. While `live` (exam not over or someone still writing) the page
  re-fetches every 10 s and labels ranks as provisional; it stops polling once everything is final.
- No WebSockets/SSE: polling one small GET is enough for a class (D-014).
- Profile (`GET /me/attempts`) includes **active** attempts too, with a Resume link, so the profile is a complete history.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Show only after the exam ends | User explicitly wants live positions |
| Visible to every student once released | Students who haven't taken it could see who scored what before their own attempt |
| Server-sent events for updates | New realtime infrastructure for a list that changes a few times per minute |

**How it works**
Each request: finalize expired attempts → load finished attempts → `competitionRank()` (`src/services/ranking.ts`, pure: sort by
score desc then name; a new score gets rank = 1-based position, an equal score keeps the previous rank) → mark the caller's row
`isMe`. `LeaderboardView` re-fetches every 10 s while `live` and keeps the last good board if a refresh fails.

**Verified:** `.scratch/ranking.test.ts` (1,1,3 · 1,1,1,4 · negatives/fractions · no input mutation);
`.scratch/leaderboard.check.mts` 15/15 (tie ranks, `isMe`, still-writing/never-started 403, owner vs other teacher, release gate,
draft 404, `live` false after the exam); headless Chrome: student A's open page showed student B appear at rank 2 within one
refresh, without reloading.

**Files touched**
- `docs/api-contracts.md` (leaderboard + profile contracts), `src/services/attempt-service.ts` (`listMyAttempts`),
  `src/app/api/v1/me/attempts/route.ts`, `src/app/student/profile/page.tsx`, `src/components/layout/app-header.tsx` (nav),
  leaderboard files in 06.3

**Result release, end to end (06.4):** with a future `resultsReleaseAt`, the submit response, result page, profile and leaderboard
all hide marks/answers (leaderboard → `RESULTS_NOT_RELEASED`) while the teacher still sees scores; the teacher can move the release
time even on a locked quiz, after which all three views show the score immediately (`.scratch/release.check.mts`, 11/11).

**Revisit if**
Classes grow large enough that 10 s polling per viewer matters, or the course wants leaderboards hidden until the exam ends.

---

### D-050 — Teacher results: separate service, sorted submissions, paired event timeline
- **Date:** 2026-10-20
- **Phase:** 06 — Results, profile & leaderboard
- **Status:** Active
- **Type:** architecture

**Decision**
- Teacher-facing reads live in `src/services/results-service.ts` (owner check → lazy finalization → one query + two `$group`
  count aggregations), keeping `attempt-service.ts` about the student's exam lifecycle.
- Submissions are sorted by `score.total` descending then name; in-progress attempts (score `null`) sort last.
- The event timeline pairs "lost/hidden/disconnected" with the next matching "regained/visible/reconnected" event and shows
  the gap ("— back after 12 s"). Wording is factual everywhere and the page states events are not evidence of misconduct.
- Links: editor top bar "Results (n)" and the dashboard's attempt count open `/teacher/quizzes/[id]/results`; each student name
  opens `/teacher/attempts/[id]`. Missing or other teachers' quizzes/attempts render the 404 screen.

**Verified:** `.scratch/teacher-results.check.mts` 16/16 — order, marks (8, −1), counts (2 events, 1 snapshot), active row, owner-only
access (other teacher/student 403, missing 404), lazy finalization on view, both pages render.

**Files touched**
- `src/services/results-service.ts`, `src/app/api/v1/teacher/quizzes/[quizId]/attempts/route.ts`,
  `src/app/api/v1/teacher/attempts/[attemptId]/route.ts`, `src/app/teacher/quizzes/[quizId]/results/page.tsx`,
  `src/app/teacher/attempts/[attemptId]/page.tsx`, `src/components/results/event-timeline.tsx`,
  `src/components/quiz/quiz-editor.tsx`, `src/app/teacher/page.tsx`

**Revisit if**
Quizzes get thousands of attempts (then paginate the table).

---

### D-051 — Packaging: shell-only bundle, baked production URL, ad-hoc signature, generated icon
- **Date:** 2026-10-20
- **Phase:** 07 — Ship
- **Status:** Active — universal target replaced by per-chip installers in D-054
- **Type:** tooling

**Context**
The course needs a `.dmg` (F-14). The Electron app is a thin shell (D-002), the demo Mac's chip is unknown, and there is no
Apple Developer account (user confirmed unsigned is fine).

**Decision**
- `npm run dist` → `electron-builder --mac --universal` (config in `electron-builder.yml`) → `release/Proctra-0.1.0-mac-universal.dmg`
  (~218 MB: one Intel + one Apple Silicon Electron inside). Added `electron-builder` as a devDependency (the standard tool; no install
  scripts; production audit clean).
- **Shell-only bundle:** `files` includes just `electron/dist/*.js`, `electron/offline.html`, `package.json`, and explicitly excludes
  `node_modules`; `npmRebuild: false`; `extraMetadata.dependencies: {}`. The bundle contains 4 files.
- **Production URL baked in:** `extraMetadata.proctraAppUrl: https://proctra-mu.vercel.app` is written into the *packaged* package.json;
  `main.ts` reads it when `app.isPackaged`, and `.env` only in dev. Override at build time with `-c.extraMetadata.proctraAppUrl=…`.
- **Ad-hoc signature** (`identity: "-"`): Apple Silicon refuses to run completely unsigned apps; ad-hoc needs no account. Not notarized →
  the first launch needs right-click → Open (README).
- `NSCameraUsageDescription` in Info.plist (without it macOS never shows the camera prompt). Category: education.
- **Icon:** a "P" monogram with a green "camera on" dot, drawn as SVG, rendered to 1024 px by Electron offscreen, converted with macOS
  `sips` + `iconutil` to `electron/build/icon.icns` — no image tooling added.

**Problems hit**
- The first build bundled every website dependency (Next.js, sharp, …) and the universal merge failed on sharp's native binary — fixed by
  the explicit `node_modules` exclusion above.
- While verifying, `asar extract-file` wrote the packaged package.json **over the project's package.json** (it extracts into the current
  folder). Caught immediately by `git diff`; restored from git and the three intended edits re-applied. Lesson: extract into a temp dir.

**Verified:** universal binary (`x86_64 arm64`), `codesign --verify --deep --strict` OK (adhoc), Info.plist camera text present, bundle
contains only the 4 shell files, baked URL = production; launching the packaged app loaded https://proctra-mu.vercel.app with
`window.proctra` exposing `isDesktop, requestCamera, startExam, endExam`; no dev trace output.

**Files touched**
- `electron-builder.yml`, `electron/build/icon.icns`, `electron/main.ts` (`resolveAppUrl`), `package.json` (`dist`, devDependency,
  description), `.gitignore` (`/release`), `docs/architecture.md`

**Concepts worth learning**
- **Universal binary:** one app containing code for both Intel and Apple Silicon; macOS picks the right half.
- **Ad-hoc signing:** a signature with no developer identity — proves the bundle wasn't altered, but Gatekeeper still asks on first open.

**Revisit if**
The course requires a signed/notarized app (Developer ID + notarytool), or the download size matters (build per-arch .dmgs instead).

---

### D-052 — Snapshot gallery: on-demand, signed 10-minute download links
- **Date:** 2026-10-20
- **Phase:** 07 — Ship (S-01)
- **Status:** Active
- **Type:** api

**Decision**
`GET /api/v1/teacher/attempts/:id/snapshots` (owner only) returns each snapshot with a URL from Cloudinary's
`private_download_url(publicId, "jpg", { type: "authenticated", expires_at: now + 600 })`. The teacher's attempt page loads nothing
until "Show snapshots" is clicked, then shows 60 lazy-loaded thumbnails at a time, a full-size dialog, and "Refresh links"; a timer
marks the links expired at `expiresAt`.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Signed *delivery* URLs (`res.cloudinary.com/…/authenticated/s--sig--/…`) | Fast CDN delivery but they never expire; true expiry needs Cloudinary's paid token auth |
| Proxy images through our API | Every image would pass through a Vercel function (bandwidth + latency) |
| Load the gallery automatically | Up to ~360 images per hour-long attempt — wasteful when the teacher only wants the answers |

**How it works**
The signature covers the public id, format and expiry time using our API secret, so a link can't be altered or extended (verified:
a tampered signature is rejected) and stops working after 10 minutes. Links are generated locally — no Cloudinary API call per image.

**Verified:** `.scratch/gallery.check.mts` 8/8 (owner gets 3 in time order, ~600 s expiry, URL returns `image/jpeg`, tampered
signature rejected, other teacher/student 403, missing 404); headless Chrome: 3/3 thumbnails loaded.

**Files touched**
- `src/services/results-service.ts` (`getSnapshotGallery`), `src/app/api/v1/teacher/attempts/[attemptId]/snapshots/route.ts`,
  `src/components/results/snapshot-gallery.tsx`, `src/app/teacher/attempts/[attemptId]/page.tsx`, shadcn `dialog`, `docs/api-contracts.md`

**Revisit if**
Teachers review many long attempts (download-endpoint latency) — then consider token-authenticated CDN URLs.

---

### D-053 — Light DevClub UI + GSAP polish via the shadcn registry
- **Date:** 2026-10-20
- **Phase:** 07 — Ship (S-02)
- **Status:** Active
- **Type:** tooling

**Context**
The brief asks to use the DevClub UI library "where it fits" and GSAP "sparingly", never on exam controls. The user chose a light touch.

**Decision**
- Read the library's README first (as the brief requires). Its own CLI (`npx @devclubnst/ui add …`) **failed to run** — the npm package
  lists the whole showcase site as dependencies (Next.js, three.js, PostHog…) and npm crashed resolving them. The README's other route,
  the shadcn registry (`npx shadcn add https://ui.devclubxnst.com/r/<name>.json`), installs one component's source only — used that.
- Reviewed the registry JSON before installing (dependencies, imports, no network/analytics/eval). Added **Animated Counter** to the
  student result score (`gooey` off; it respects reduced motion and keeps screen-reader text).
- Skipped **Dither** (WebGL via OGL — too heavy for a light touch); "noise-background" isn't in the registry.
- **GSAP:** one `StaggerIn` wrapper (`useGSAP` + `gsap.matchMedia`) fades/slides dashboard quiz cards and teacher table rows in
  (0.35 s, 0.04 s stagger, `clearProps` afterwards); disabled under `prefers-reduced-motion`. Not used on any exam screen.
- New dependencies: `motion`, `clsx`, `tailwind-merge` (required by the counter), `gsap`, `@gsap/react`. Production audit stays clean.

**Alternatives considered**
| Option | Why not chosen |
|---|---|
| Restyle more screens with DevClub components | User chose a light touch; every extra animated component is more to verify before the deadline |
| Use `motion` for the entrance too (one library) | The brief names GSAP for motion; the counter brings `motion` with it anyway |

**Verified:** build + regression suites (release 11/11, profile 9/9); headless Chrome: 9 dashboard cards end fully visible after the
stagger, result page renders "7.50 / 12.50" with screen-reader text "7.50", no console errors.

**Files touched**
- `src/components/ui/animated-counter.tsx` (DevClub source), `src/components/motion/stagger-in.tsx`, `src/app/student/page.tsx`,
  `src/app/teacher/page.tsx`, `src/app/student/attempts/[attemptId]/page.tsx`, `package.json`, `docs/architecture.md`, `CLAUDE.md`

**Concepts worth learning**
- **Copy-in component registries (shadcn style):** you own the copied source, so review it like your own code before committing.
- **Reduced motion:** respect the OS accessibility setting — animation must never be required to use the app.

**Revisit if**
The DevClub CLI's package is fixed (then it's the documented route), or more screens get polish after the deadline.

---

### D-054 — Per-chip installers instead of universal; install steps for macOS 15+
- **Date:** 2026-10-20
- **Phase:** 07 — Ship
- **Status:** Active
- **Type:** tooling

**Context**
The user shared the universal `.dmg` with a friend: it showed as ~518 MB and "cannot be opened" on the friend's Mac.

**Findings**
- Size: the installed universal app was 510 MB, of which 506 MB is the Electron framework — a universal build carries two
  complete copies (Apple Silicon + Intel). Our own code is a few KB.
- "Cannot be opened": Gatekeeper rejects un-notarized apps that carry the quarantine flag macOS adds to downloaded/AirDropped files.
  Reproduced locally by adding the flag to a copy: `spctl` → `rejected`; `xattr -cr` removes the flag and the ad-hoc signature stays valid.
  macOS 15 removed the old right-click → Open shortcut; the way through is Privacy & Security → **Open Anyway**.

**Decision**
- Build two installers: `Proctra-<v>-mac-arm64.dmg` (121 MB download, 288 MB installed) and `Proctra-<v>-mac-x64.dmg` (128 MB / 294 MB).
  User chose this over universal-only or Apple-Silicon-only.
- README install steps per macOS version (Open Anyway on 15+, right-click → Open on 14 and older, `xattr -cr` for "is damaged").
- Real fix (not done — needs a paid Apple Developer ID): Developer ID signing + notarization removes all of these prompts.

**Files touched**
- `electron-builder.yml` (`arch: [arm64, x64]`, `artifactName` with `${arch}`), `package.json` (`dist`), `README.md`, D-051 status

**Revisit if**
The project gets an Apple Developer ID (sign + notarize, then a single universal build is fine again).
