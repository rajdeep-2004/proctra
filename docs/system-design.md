# System Design

> Last updated: 2026-10-19 — How the system behaves at runtime. Structure lives in architecture.md.

## 1. Requirements that drive the design
| Requirement | Target | Why it matters |
|---|---|---|
| Concurrent users | ≤ 100 students in one exam | Sizes everything: free tiers are enough, no cache/queue needed |
| Write load | ~1 answer save / student / 10 s + 1 snapshot / student / 10 s → ≤ ~20 req/s peak | Comfortably inside Vercel + Atlas M0 limits |
| Latency | Answer save confirmed < 1 s on normal network | Student sees "Saved" quickly |
| Consistency | Server is the single source of truth for role, deadline, answers, score | Prevents client tampering (renderer is untrusted) |
| Durability | Every answer shown as "Saved" survives app crash / power loss | Resume after interruption |
| Availability | Best effort (free tiers); exam UI tolerates short network drops | Local pending-save queue + retries |

## 2. Key flows

### Flow: Sign-in and role routing
```mermaid
sequenceDiagram
  participant R as Renderer (main window)
  participant N as Next.js
  participant D as MongoDB
  R->>N: POST sign-in (email, password)
  N->>D: find user by email
  D-->>N: user (passwordHash, role)
  N->>N: bcrypt.compare, issue JWT cookie {userId, role}
  N-->>R: redirect /student or /teacher
  Note over R,N: Every later API call: requireUser(role) reads the cookie
```

### Flow: Start (or resume) an attempt
```mermaid
sequenceDiagram
  participant R as Renderer (main window)
  participant M as Electron main
  participant N as Next.js
  participant D as MongoDB
  R->>M: proctra.requestCamera()
  M->>M: systemPreferences.askForMediaAccess('camera')
  M-->>R: granted / denied
  R->>R: getUserMedia test frame, then stop tracks
  alt denied or no camera
    R-->>R: show "camera required" — cannot start
  end
  R->>N: POST /api/v1/quizzes/:id/attempts
  N->>D: quiz published & now within [startsAt, endsAt]?
  N->>D: set quiz.locked = true
  N->>D: upsert attempt {quizId, studentId} ($setOnInsert startedAt, deadline)
  D-->>N: attempt (new or existing active)
  N-->>R: { attemptId, deadline, status }
  R->>M: proctra.startExam(attemptId)
  M->>M: validate id, open kiosk exam window at /exam/:attemptId, hide main window
```
Notes:
- `deadline = min(startedAt + durationMinutes, quiz.endsAt)` — computed once on insert, never changed.
- Calling start again while an attempt is `active` just returns it → this **is** the resume path.
- If the attempt is already submitted, start returns `409 CONFLICT` (one attempt per quiz).

### Flow: Answer autosave
```mermaid
sequenceDiagram
  participant E as Exam page
  participant L as localStorage
  participant N as Next.js
  participant D as MongoDB
  E->>L: put pending {questionId, option, marked}
  E->>N: PUT /api/v1/attempts/:id/answers/:questionId
  N->>D: updateOne({_id, studentId, status:'active', deadline > now-grace}, {$set: answers.qid})
  alt matched
    N-->>E: 200 saved
    E->>L: remove pending entry
  else not matched (expired / submitted)
    N-->>E: 409 ATTEMPT_CLOSED → finalize + go to result screen
  else network error
    E->>E: keep pending, retry with backoff (1s, 2s, 4s… max 10s)
  end
```
Notes:
- The client save queue sends **one request at a time** and coalesces: if a question changes again
  while a save is in flight, only the newest value is sent next. This prevents an older save from
  arriving after a newer one and overwriting it.
- Status indicator: `Saved` (queue empty) / `Saving…` / `Offline — retrying`.
- On exam page load, pending entries from localStorage for this attempt are replayed before showing "Saved".
- Grace window: saves are accepted until `deadline + 5 s` to absorb network latency for clicks made just before time ran out.

### Flow: Submit, auto-submit and lazy finalization
```mermaid
sequenceDiagram
  participant E as Exam page
  participant M as Electron main
  participant N as Next.js
  participant D as MongoDB
  alt manual
    E->>E: confirm dialog
    E->>N: POST /api/v1/attempts/:id/submit
  else timer hits 0
    E->>N: POST /api/v1/attempts/:id/submit
  end
  N->>D: findOneAndUpdate({_id, status:'active'}, {status, submittedAt})
  N->>N: grade(quiz, answers) → score breakdown
  N->>D: save score on attempt
  N-->>E: { status, score? (if released) }
  E->>M: proctra.endExam(attemptId)
  M->>M: close exam window, show main window at /student/attempts/:id
```
- **No background jobs.** If nobody calls submit (app closed, battery dead), the attempt is finalized
  **lazily**: every service function that reads an attempt (`getAttempt`, student dashboard, teacher
  submissions, leaderboard) first runs `finalizeIfExpired()`, which atomically flips any `active`
  attempt with `now > deadline + grace` to `auto_submitted` with `submittedAt = deadline` and grades it.
- Manual submit after the deadline is treated as auto-submit (`submittedAt = deadline`).

### Flow: Snapshot capture
```mermaid
sequenceDiagram
  participant E as Exam page
  participant N as Next.js
  participant C as Cloudinary
  participant D as MongoDB
  loop every 10 s while attempt active and camera live
    E->>E: draw hidden <video> frame to canvas → JPEG (640×480, q≈0.7, ~40 KB)
    E->>N: POST /api/v1/attempts/:id/snapshots (multipart, capturedAt)
    N->>D: attempt active & owned by student?
    N->>C: upload (type: authenticated, folder proctra/<quizId>/<attemptId>)
    C-->>N: public_id
    N->>D: insert Snapshot {attemptId, publicId, capturedAt}
    N-->>E: 201
  end
```
- Upload failure: retry twice (2 s, 5 s) then drop that frame and log a `snapshot_failed` event. Never blocks the exam.
- No live preview: the `<video>` element is never rendered visibly.
- Capture stops (tracks stopped) on submit, auto-submit, or exam window close.

### Flow: Camera lost mid-attempt
1. Video track fires `ended` (or `devicechange` shows no camera) → exam page shows a full-screen
   "Camera disconnected — reconnect to continue" overlay; answer inputs are disabled.
2. Event `camera_lost` is logged. Countdown keeps running (server deadline unchanged).
3. Every 2 s the page retries `getUserMedia`; on success the overlay closes and `camera_restored` is logged.
4. If the deadline passes while the overlay is up, the normal auto-submit runs with the answers saved so far.

### Flow: Window / focus events
- Exam page listens to DOM `blur`/`focus`, `visibilitychange` and `fullscreenchange`, and batches
  them to `POST /api/v1/attempts/:id/events` every 5 s (or immediately on submit).
- Events shown to teachers with neutral wording ("window lost focus at 10:14:03 for 12 s").

### Flow: Leaderboard
1. `finalizeIfExpired` for all active attempts of the quiz.
2. Load finalized attempts `{studentName, score}` sorted by score desc.
3. Competition ranking: rank = 1 + number of attempts with a strictly higher score (→ 1, 1, 3).
4. Students get it only if results are released; response contains name, rank, score only.

## 3. State and data ownership
| Data | Source of truth | Copies |
|---|---|---|
| Users, roles | MongoDB `users` | Role copied into the JWT (refreshed on sign-in) |
| Quizzes + correct answers | MongoDB `quizzes` | Never sent to students before release |
| Answers | MongoDB `attempts.answers` | Pending (unconfirmed) answers in localStorage until server confirms |
| Deadline, status, score | MongoDB `attempts` | Client shows countdown from `deadline` + server-time offset |
| Snapshot images | Cloudinary (private) | Only `publicId` + metadata in MongoDB |
| Proctor events | MongoDB `proctorEvents` | Client buffer for ≤ 5 s |
| Session | JWT cookie | Electron persistent session partition |

**Clock skew:** `GET /attempts/:id` returns `serverNow`; client computes `offset = serverNow − Date.now()`
and shows `deadline − (Date.now() + offset)`. The client countdown is cosmetic; the server decides.

## 4. Concurrency and race conditions
| Scenario | Risk | Mitigation |
|---|---|---|
| Student double-clicks Start / two windows | Two attempts for one quiz | Unique index `{quizId, studentId}` + upsert with `$setOnInsert`; duplicate-key error → re-read existing |
| Save arrives after submit/deadline | Answers change after grading | Conditional `updateOne` requires `status:'active'` and `deadline > now − grace` |
| Two saves for the same question out of order | Older value overwrites newer | Client queue: one in-flight request, coalesce to newest value |
| Manual submit + auto-submit + lazy finalize at once | Double grading / status flip-flop | `findOneAndUpdate({status:'active'})` — only one caller wins; others read the final result (idempotent) |
| Teacher edits questions while a student starts | Student sees questions that then change | Starting sets `quiz.locked = true` **before** creating the attempt; question edits update with condition `locked:false` |
| Teacher unpublishes during active attempts | Students mid-exam lose quiz | Unpublish only hides it from listings/new starts; active attempts continue to deadline |

## 5. Async work and realtime
- No queues, schedulers, cron or WebSockets. Expiry is handled by lazy finalization (§2).
- Background-like client loops (all stop when the attempt ends): save queue, snapshot timer (10 s),
  event batch flush (5 s), camera retry (2 s, only when lost), countdown (1 s).

## 6. Caching
| What | Where | TTL | Invalidation |
|---|---|---|---|
| Mongoose connection | Module-level global in `lib/db.ts` | Process lifetime | n/a (reused across serverless invocations) |
| Pages with user data | Not cached (`dynamic = 'force-dynamic'`) | — | — |
No data cache: load is tiny and stale exam data would be dangerous.

## 7. Failure modes
| Failure | Detection | Behavior / recovery |
|---|---|---|
| DB unavailable | Mongoose error in service | `500 INTERNAL`; exam page keeps answers pending locally and retries |
| Vercel unreachable from Electron | `did-fail-load` in main | Main window shows offline screen with Retry; exam page shows "Offline — retrying" |
| Cloudinary timeout/error | Upload throws | 2 retries → `snapshot_failed` event, exam continues |
| Duplicate request (start/submit/save) | — | All three are idempotent (see §4) |
| App closed / battery dies mid-attempt | Attempt still `active` on next login | Dashboard shows **Resume**; re-runs camera gate and reopens kiosk window; time lost is not refunded. If deadline already passed → lazily auto-submitted |
| Camera permission denied | `askForMediaAccess` false / getUserMedia throws | Start blocked with instructions to enable in System Settings → Privacy & Security → Camera |
| Camera lost mid-attempt | Track `ended` | Blocking overlay, event logged, timer continues (§2) |
| Session cookie expired mid-exam | 401 from API | Session lifetime set to 12 h so it cannot expire during an exam; if it does, redirect to sign-in and resume |

## 8. Security
- **Renderer is untrusted.** Server computes deadline, status, submittedAt and score; client-sent
  values for these are ignored.
- **Authorization** on every route via `requireUser(role)` + ownership checks in services (§architecture 8).
- **Correct answers** are stripped from every student-facing quiz/attempt response until results are released.
- **Input validation:** Zod on every body/param; ObjectId format checked; snapshot uploads limited to `image/jpeg`, ≤ 500 KB.
- **Electron:** `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; navigation and
  `window.open` restricted to the `PROCTRA_APP_URL` origin; camera permission granted only for that origin;
  IPC handlers validate arguments (attemptId must be a 24-hex string).
- **Snapshots:** Cloudinary `type: authenticated` (no public URLs); teachers get signed URLs that expire in 10 min (S-01).
- **Secrets** only in Vercel env / local `.env`; never in the Electron bundle.
- **Passwords:** bcryptjs hash; sign-in errors don't reveal whether the email exists.
- **Rate limiting:** not implemented in V1 (known debt; low risk for a class-sized deployment).

## 9. Scaling plan
What breaks first beyond a single class:
1. Cloudinary free quota (100 students × 360 snapshots/hour × ~40 KB ≈ 1.4 GB/hour of exams) → longer interval or paid plan.
2. Atlas M0 connection/ops limits → M10 tier.
3. Lazy finalization on leaderboard reads → a scheduled finalizer (Vercel cron) if quizzes get large.

## 10. Observability
- Vercel function logs (`console.error` for unexpected errors, no PII/passwords).
- Proctor event log per attempt doubles as a client-health record (snapshot failures, focus loss).
- `GET /api/v1/health` → `{ ok, db: "up" | "down" }` used by Electron's offline screen.

## 11. Trade-offs accepted
| Trade-off | Why acceptable now | Revisit when |
|---|---|---|
| Kiosk mode is not a lockdown (Cmd+Q, force quit, other devices still work) | Explicit non-goal; documented to users | Institution requires lockdown browser |
| Exam page can be opened in a normal browser by a determined user (desktop check is client-side) | Server still enforces deadline/grading; snapshot gaps are visible to teacher | Need verified desktop clients |
| Lazy finalization instead of a scheduler | No extra infra; correctness preserved | Many quizzes / analytics need timely state |
| Time lost to disconnection/camera loss is not refunded | Prevents "quit to pause the clock" abuse | Course wants accommodations |
| No rate limiting | Small trusted user base, one week deadline | Public deployment |
