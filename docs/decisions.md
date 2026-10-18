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
| D-006 | 2026-10-19 | 00 | Server-authoritative deadline with lazy finalization | Active |
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
- **Status:** Active
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
Rounded to 2 decimals to avoid float noise (e.g. `0.1 + 0.2`). Storing the score means leaderboards and
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
