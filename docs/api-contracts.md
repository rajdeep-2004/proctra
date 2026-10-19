# API Contracts

> Last updated: 2026-10-19 — Update this BEFORE changing any endpoint.

## 1. Conventions
- Base URL: `/api/v1` (Auth.js's own routes live at `/api/auth/*`)
- Auth: Auth.js JWT session in an httpOnly cookie (`SameSite=Lax`, `Secure` in production). Every
  `/api/v1` route except `health` and `auth/register` calls `requireUser(role)`.
- Role prefixes: `/teacher/*` = teacher only. Unprefixed student routes (`/quizzes`, `/attempts`, `/me`) = student only unless noted.
- Content type: `application/json` (except snapshot upload: `multipart/form-data`)
- Validation: Zod; invalid input → `400 VALIDATION_ERROR` with `details` = Zod issue list
- IDs in paths must be 24-char hex ObjectIds (else `400`)
- Times: ISO-8601 UTC strings. Server time is authoritative.
- Pagination: none in V1 (class-sized lists; lists capped at 500 items)

### Success shape
```json
{ "data": {} }
```

### Error shape
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human readable", "details": {} } }
```

### Error codes
| HTTP | code | When |
|---|---|---|
| 400 | VALIDATION_ERROR | Input failed validation |
| 401 | UNAUTHENTICATED | Missing/invalid session |
| 403 | FORBIDDEN | Wrong role, or not the owner |
| 403 | RESULTS_NOT_RELEASED | Student asked for results/leaderboard before `resultsReleaseAt` |
| 404 | NOT_FOUND | Resource doesn't exist (also used instead of 403 when a student probes another student's attempt) |
| 409 | CONFLICT | Duplicate email, etc. |
| 409 | QUIZ_NOT_AVAILABLE | Quiz not published, archived, or outside its availability window |
| 409 | ALREADY_ATTEMPTED | Student already has a finished attempt for this quiz |
| 409 | ATTEMPT_CLOSED | Attempt is submitted or past `deadline + 5 s` |
| 409 | QUIZ_LOCKED | Editing questions/marking after the first attempt started |
| 409 | INVALID_STATE | Illegal status transition (e.g. publish an archived quiz, publish with 0 questions) |
| 413 | PAYLOAD_TOO_LARGE | Snapshot > 500 KB |
| 500 | INTERNAL | Unexpected server error |
| 502 | UPSTREAM_FAILED | Cloudinary upload failed |

### Shared response objects
```ts
type Marking = { correct: number; incorrect: number; unanswered: number };
type QuestionForStudent = { id: string; text: string; options: string[] };      // no correctIndex
type QuestionForTeacher = QuestionForStudent & { correctIndex: number };
type Score = { total: number; correct: number; incorrect: number; unanswered: number; maxPossible: number };
type AttemptStatus = "active" | "submitted" | "auto_submitted";
```

## 2. Endpoints

### Health

#### `GET /api/v1/health`
- Auth: public · Phase: 01 · Purpose: liveness + DB check (manual and post-deploy checks)

Response `200` `{ "data": { "ok": true, "db": "up" } }` · `503` `{ "data": { "ok": false, "db": "down" } }` if the Mongo ping fails (within ~5 s)

### Auth

#### `POST /api/v1/auth/register`
- Auth: public · Phase: 02 · Purpose: student self-registration (always `role: "student"`)

Request
```json
{ "name": "Asha Rao", "email": "asha@uni.edu", "password": "8+ chars, max 72 bytes" }
```
Response `201` `{ "data": { "id": "…", "name": "Asha Rao", "email": "asha@uni.edu", "role": "student" } }`
Errors: `400 VALIDATION_ERROR`, `409 CONFLICT` (email taken)
Notes: the client then signs in via Auth.js. Any `role` field in the body is ignored.

#### Auth.js — `GET /api/auth/csrf`, `POST /api/auth/callback/credentials`, `POST /api/auth/signout`, `GET /api/auth/session`
- Auth: public · Phase: 02 · Called through Auth.js's `signIn("credentials")` / `signOut()` helpers, not by hand.
- Both POSTs are form-encoded and require the `csrfToken` from `GET /api/auth/csrf` (double-submit cookie);
  without it Auth.js redirects with `error=MissingCSRF`.
- Success → `302` to the callback URL and sets the `authjs.session-token` cookie (HttpOnly, SameSite=Lax,
  12 h; `__Secure-` prefixed on https). Wrong email **or** password → `302 /sign-in?error=CredentialsSignin`
  (same response for both).

#### `GET /api/v1/me`
- Auth: any signed-in user · Phase: 02
Response `200` `{ "data": { "id": "…", "name": "…", "email": "…", "role": "teacher" } }`

### Teacher — quizzes

#### `GET /api/v1/teacher/quizzes`
- Auth: teacher · Phase: 03 · Purpose: my quizzes, newest first
Response `200`
```json
{ "data": [ { "id": "…", "title": "DBMS Quiz 1", "status": "published", "locked": true,
  "startsAt": "…", "endsAt": "…", "durationMinutes": 30, "questionCount": 10,
  "attemptCount": 42, "updatedAt": "…" } ] }
```
`durationMinutes` is derived from `endsAt − startsAt` (D-041).

#### `POST /api/v1/teacher/quizzes`
- Auth: teacher · Phase: 03 · Purpose: create a draft

Request (`QuizInput` — same shape for create and update)
```json
{
  "title": "DBMS Quiz 1",
  "instructions": "Answer all questions.",
  "startsAt": "2026-10-22T10:00:00Z", "endsAt": "2026-10-22T10:30:00Z",
  "marking": { "correct": 4, "incorrect": -1, "unanswered": 0 },
  "resultsReleaseAt": null,
  "questions": [ { "id": null, "text": "…", "options": ["1NF","2NF","3NF","BCNF"], "correctIndex": 2 } ]
}
```
Response `201` `{ "data": QuizForTeacher }` (full quiz, questions with `id` + `correctIndex`; includes derived `durationMinutes`)
Notes: there is no `durationMinutes` input — the server derives it from `endsAt − startsAt` (must be 1–300 min). Any `durationMinutes` sent is ignored.
Errors: `400 VALIDATION_ERROR`
Notes: `questions[].id` is `null` for new questions; existing ids are kept so attempts' answer keys stay valid.

#### `GET /api/v1/teacher/quizzes/:quizId`
- Auth: teacher (owner) · Phase: 03
Response `200` `{ "data": QuizForTeacher }` — includes `status`, `locked`, `attemptCount`
Errors: `404 NOT_FOUND`, `403 FORBIDDEN` (not owner)

#### `PUT /api/v1/teacher/quizzes/:quizId`
- Auth: teacher (owner) · Phase: 03 · Purpose: save the whole editor state (add/edit/reorder/remove = send the new array)

Request: `QuizInput` · Response `200` `{ "data": QuizForTeacher }`
Errors: `400` (incl. a `questions[].id` that isn't in this quiz), `403`, `404`, `409 QUIZ_LOCKED` (questions, marking or
`startsAt` differ while `locked`, or `endsAt` moved earlier), `409 INVALID_STATE` (archived)
Notes: when `locked`, only `title`, `instructions`, `resultsReleaseAt` and a **later** `endsAt` are accepted. Extending
`endsAt` also moves the `deadline` of every active attempt of this quiz.

#### `POST /api/v1/teacher/quizzes/:quizId/publish` · `/unpublish` · `/archive`
- Auth: teacher (owner) · Phase: 03
- `publish`: `draft → published`; requires ≥ 1 question and `endsAt` in the future.
- `unpublish`: `published → draft`; hides from students; active attempts continue.
- `archive`: `draft|published → archived` (final).

Response `200` `{ "data": { "id": "…", "status": "published" } }`
Errors: `403`, `404`, `409 INVALID_STATE`

### Teacher — results

#### `GET /api/v1/teacher/quizzes/:quizId/attempts`
- Auth: teacher (owner) · Phase: 06 · Purpose: submissions table
- Runs lazy finalization for the quiz first.
Response `200`
```json
{ "data": [ { "id": "…", "studentName": "Asha Rao", "status": "submitted",
  "startedAt": "…", "submittedAt": "…", "score": { "total": 36, "correct": 9, "incorrect": 0, "unanswered": 1, "maxPossible": 40 },
  "eventCount": 3, "snapshotCount": 172 } ] }
```

#### `GET /api/v1/teacher/attempts/:attemptId`
- Auth: teacher (owner of the quiz) · Phase: 06 · Purpose: one submission in detail
Response `200`
```json
{ "data": {
  "id": "…", "studentName": "…", "status": "submitted", "startedAt": "…", "deadline": "…", "submittedAt": "…",
  "score": { "total": 36, "correct": 9, "incorrect": 0, "unanswered": 1, "maxPossible": 40 },
  "questions": [ { "id": "…", "text": "…", "options": ["…"], "correctIndex": 2, "selectedIndex": 2, "result": "correct" } ],
  "events": [ { "type": "window_blur", "occurredAt": "…" } ],
  "snapshotCount": 172 } }
```

#### `GET /api/v1/teacher/attempts/:attemptId/snapshots`
- Auth: teacher (owner of the quiz) · Phase: 07 (S-01, should-have)
Response `200` `{ "data": [ { "capturedAt": "…", "url": "https://res.cloudinary.com/…signed…" } ] }`
Notes: URLs are signed and expire after 10 minutes.

### Leaderboard

#### `GET /api/v1/quizzes/:quizId/leaderboard`
- Auth: teacher (owner) or student · Phase: 06
- Students: only when results are released (`resultsReleaseAt` null or past) and the quiz is published/archived.
Response `200`
```json
{ "data": { "quizTitle": "DBMS Quiz 1", "released": true,
  "entries": [ { "rank": 1, "studentName": "Asha", "score": 36, "isMe": false },
               { "rank": 1, "studentName": "Ravi", "score": 36, "isMe": true },
               { "rank": 3, "studentName": "Meera", "score": 32, "isMe": false } ] } }
```
Errors: `403 RESULTS_NOT_RELEASED`, `404`
Notes: competition ranking (1, 1, 3). Never includes events, snapshots or answers. Ties ordered by name.

### Student — quizzes and attempts

#### `GET /api/v1/quizzes`
- Auth: student · Phase: 03 · Purpose: dashboard list of published quizzes + my status
Response `200`
```json
{ "data": { "serverNow": "2026-10-22T09:58:12.000Z",
  "quizzes": [ { "id": "…", "title": "…", "startsAt": "…", "endsAt": "…", "durationMinutes": 30,
  "questionCount": 10, "availability": "open", "myAttempt": { "id": "…", "status": "active" } } ] } }
```
`availability`: `"upcoming" | "open" | "closed"`. `myAttempt` is `null` if not started. `durationMinutes` is derived.
`serverNow` lets the client run its countdown on server time (offset = serverNow − local clock).

#### `GET /api/v1/quizzes/:quizId`
- Auth: student · Phase: 03 · Purpose: pre-start screen (instructions, timing, camera notice). No questions.
Response `200` `{ "data": { "id", "title", "instructions", "startsAt", "endsAt", "durationMinutes", "questionCount", "marking", "availability", "myAttempt", "serverNow" } }`
Errors: `404` (missing, draft or archived — indistinguishable to students)
Note: the page `/student/quizzes/:id` streams, so for a hidden quiz it renders the 404 screen (with `noindex`) but the HTTP status is 200 (D-040).

#### `POST /api/v1/quizzes/:quizId/attempts`
- Auth: student · Phase: 04 · Purpose: start a new attempt **or resume** the active one
Request `{}` (body ignored)
Response `201` (created) or `200` (resumed)
```json
{ "data": { "attemptId": "…", "status": "active", "deadline": "…", "resumed": false } }
```
Errors: `409 QUIZ_NOT_AVAILABLE` (not started yet / ended), `409 ALREADY_ATTEMPTED`, `404` (missing or not published), `403` (teacher)
Notes: idempotent (unique index). Only while `startsAt ≤ now < endsAt`; sets `quiz.locked = true` before creating;
`deadline = quiz.endsAt` (D-041). On resume logs a `resumed` event (phase 05).

#### `GET /api/v1/attempts/:attemptId`
- Auth: student (owner) · Phase: 04 · Purpose: exam state while active, result after
- Runs lazy finalization first.

Response `200` when `active`:
```json
{ "data": { "id": "…", "status": "active", "quizTitle": "…", "deadline": "…", "serverNow": "…",
  "questions": [ { "id": "…", "text": "…", "options": ["…"] } ],
  "answers": { "<questionId>": { "selectedIndex": 2, "markedForReview": false } } } }
```
Response `200` when finished:
```json
{ "data": { "id": "…", "status": "submitted", "quizTitle": "…", "submittedAt": "…",
  "released": true, "resultsReleaseAt": null,
  "score": { "total": 36, "correct": 9, "incorrect": 0, "unanswered": 1, "maxPossible": 40 },
  "questions": [ { "id": "…", "text": "…", "options": ["…"], "selectedIndex": 2, "correctIndex": 2, "result": "correct" } ] } }
```
When not released: `released: false`, `score: null`, `questions` omitted.
Errors: `404` (not found or not mine)

#### `PUT /api/v1/attempts/:attemptId/answers/:questionId`
- Auth: student (owner) · Phase: 04 · Purpose: autosave one answer

Request
```json
{ "selectedIndex": 2, "markedForReview": false }
```
`selectedIndex` may be `null` (clear answer).
Response `200` `{ "data": { "questionId": "…", "savedAt": "…" } }`
Errors: `400` (question not in quiz, index out of range), `404`, `409 ATTEMPT_CLOSED`
Notes: idempotent; single atomic `$set` on `answers.<questionId>`.

#### `POST /api/v1/attempts/:attemptId/submit`
- Auth: student (owner) · Phase: 04 · Purpose: manual submit or client-side auto-submit at 0
Request `{}`
Response `200` — same body as `GET /attempts/:id` when finished
Errors: `404`
Notes: idempotent — submitting an already-finished attempt returns its result. After the deadline,
it is recorded as `auto_submitted` with `submittedAt = deadline`.

#### `POST /api/v1/attempts/:attemptId/snapshots`
- Auth: student (owner) · Phase: 05 · Content-Type: `multipart/form-data`
Fields: `image` (JPEG, ≤ 500 KB), `capturedAt` (ISO string)
Response `201` `{ "data": { "id": "…", "capturedAt": "…" } }`
Errors: `400` (not JPEG), `413 PAYLOAD_TOO_LARGE`, `409 ATTEMPT_CLOSED`, `502 UPSTREAM_FAILED`

#### `POST /api/v1/attempts/:attemptId/events`
- Auth: student (owner) · Phase: 05 · Purpose: batch of proctoring events
Request
```json
{ "events": [ { "type": "window_blur", "occurredAt": "…" }, { "type": "window_focus", "occurredAt": "…" } ] }
```
1–50 events per request.
Response `201` `{ "data": { "accepted": 2 } }`
Errors: `400`, `404`, `409 ATTEMPT_CLOSED` (except within grace window, so the final flush on submit succeeds)

#### `GET /api/v1/me/attempts`
- Auth: student · Phase: 06 · Purpose: profile history
Response `200`
```json
{ "data": [ { "id": "…", "quizId": "…", "quizTitle": "…", "startedAt": "…", "submittedAt": "…",
  "status": "submitted", "released": true, "score": { "total": 36, "maxPossible": 40 } } ] }
```
Notes: only the caller's attempts; `score` is `null` if not released.

## 3. Desktop bridge (Electron preload → main IPC)
Not HTTP, but a contract between the web app and the Electron shell.

| Page API (`window.proctra`) | IPC channel | Args | Returns | Main-side validation |
|---|---|---|---|---|
| `isDesktop` | — | — | `true` | — |
| `requestCamera()` | `proctra:request-camera` | none | `Promise<{ granted, status }>` (`status`: granted / denied / restricted) | sender must be the app origin; macOS `getMediaAccessStatus` → `askForMediaAccess("camera")` only if not yet decided |
| `startExam(attemptId)` | `proctra:start-exam` | 24-hex string | `Promise<{ ok }>` | sender origin; regex; one exam window at a time (asking again focuses it) |
| `endExam(attemptId)` | `proctra:end-exam` | 24-hex string | `Promise<{ ok }>` | sender origin; regex; must match the open exam window's id; shows `/student/attempts/:id` in the main window |

Permissions: the session grants only `media` with **video only** to the app origin (microphone always denied).

## 4. Endpoint index
| Method | Path | Auth | Phase | Status |
|---|---|---|---|---|
| GET | /api/v1/health | public | 01 | built |
| POST | /api/v1/auth/register | public | 02 | built |
| * | /api/auth/* (Auth.js) | public | 02 | built |
| GET | /api/v1/me | any | 02 | built |
| GET | /api/v1/teacher/quizzes | teacher | 03 | built |
| POST | /api/v1/teacher/quizzes | teacher | 03 | built |
| GET | /api/v1/teacher/quizzes/:quizId | teacher | 03 | built |
| PUT | /api/v1/teacher/quizzes/:quizId | teacher | 03 | built |
| POST | /api/v1/teacher/quizzes/:quizId/publish | teacher | 03 | built |
| POST | /api/v1/teacher/quizzes/:quizId/unpublish | teacher | 03 | built |
| POST | /api/v1/teacher/quizzes/:quizId/archive | teacher | 03 | built |
| GET | /api/v1/quizzes | student | 03 | built |
| GET | /api/v1/quizzes/:quizId | student | 03 | built |
| POST | /api/v1/quizzes/:quizId/attempts | student | 04 | built |
| GET | /api/v1/attempts/:attemptId | student | 04 | built |
| PUT | /api/v1/attempts/:attemptId/answers/:questionId | student | 04 | built |
| POST | /api/v1/attempts/:attemptId/submit | student | 04 | built |
| POST | /api/v1/attempts/:attemptId/snapshots | student | 05 | planned |
| POST | /api/v1/attempts/:attemptId/events | student | 05 | planned |
| GET | /api/v1/me/attempts | student | 06 | planned |
| GET | /api/v1/teacher/quizzes/:quizId/attempts | teacher | 06 | planned |
| GET | /api/v1/teacher/attempts/:attemptId | teacher | 06 | planned |
| GET | /api/v1/quizzes/:quizId/leaderboard | teacher, student | 06 | planned |
| GET | /api/v1/teacher/attempts/:attemptId/snapshots | teacher | 07 | planned (S-01) |
