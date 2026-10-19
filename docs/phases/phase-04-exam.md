# Phase 04 — Taking the exam

| | |
|---|---|
| Status | in-progress |
| Branch | `phase/04-exam` |
| Depends on | Phase 03 |
| PRD features | F-06, F-10, F-11 (enforcement) |
| Target | 2026-10-21 → 2026-10-22 |

## Goal
A student can start (or resume) an attempt, answer with autosave, submit or be auto-submitted at the
server deadline, and see their graded result — in a normal window (kiosk + camera come in phase 05).

## Previous phase summary
From phase 03 (Quiz management, merged 2026-10-19):
- **Exists:** Quiz model (`src/models/quiz.ts`) with embedded questions (`_id`, `text`, `options[]`, `correctIndex`),
  marking, `startsAt`/`endsAt` exam slot (duration derived via `slotMinutes()`, 1 min–5 h), `status`, `locked`.
  Teacher API + editor; student list (`/student`) and detail (`/student/quizzes/[quizId]`) with a disabled
  **Start quiz** button and a live server-time `<Countdown>`. `quiz-service.ts` has `listQuizzesForStudent`,
  `getQuizForStudent`, and raw-collection helpers (`attemptCounts`, `myAttempts`, `extendActiveAttempts`).
- **Rules to implement (D-041, system-design §2/§4):** start only while `startsAt ≤ now < endsAt` and the quiz is
  published; set `quiz.locked = true` **before** inserting the attempt; `attempt.deadline = quiz.endsAt`; one attempt per
  student (unique index); answers saved with a single conditional update (`status: "active"`, `deadline > now − 5 s`).
  When the Attempt model exists, switch the raw-collection helpers in `quiz-service.ts` to it.
- **Rely on:** `requireUser("student")`, `withHandler`/`AppError`, `api()` client helper, `<LocalTime>`, `useIsClient()`,
  `ObjectIdString`. Never send `correctIndex` while an attempt is active (projection approach, D-040).
- **Watch out:** Zod object-level `.refine()` runs even after field errors — guard types (D-041 note). Streamed pages
  can't change HTTP status (D-040). Test with `.scratch/http.mts` + scratch teacher `t2@scratch.test` (re-seed after cleanup);
  local prod server needs `AUTH_TRUST_HOST=true`; force a frame before reading Electron pages (D-039).
- Decisions: D-037 – D-041.

## In scope — exact features
1. **Attempt model + grading**
   - Acceptance: Attempt schema + indexes per schema doc; `grade()` pure function matches hand calculation incl. negative marks (scratch test).
2. **Attempt service + API**
   - Acceptance: start/resume (idempotent, sets `quiz.locked`, only inside the slot, `deadline = quiz.endsAt`), `GET /attempts/:id` (no `correctIndex` while active), save answer (conditional atomic update), submit (idempotent), lazy `finalizeIfExpired`.
3. **Exam UI**
   - Acceptance: countdown from server deadline with clock offset; question + options; Next/Previous; palette with answered / unanswered / marked states; Mark for Review.
4. **Autosave queue**
   - Acceptance: sequential coalescing queue, localStorage pending entries, backoff retries, status `Saved / Saving… / Offline — retrying`; pending answers replayed on reload.
5. **Submit, auto-submit, result, resume**
   - Acceptance: confirm dialog; auto-submit at 0; result page shows score breakdown (or "results released at …" if hidden); dashboard shows Resume for an active attempt and Result for finished ones.

## Out of scope
- Kiosk window, camera gate, snapshots, events (phase 05). Profile history, leaderboard (phase 06).

## Relevant docs
- `database-schema.md` → Attempt, §5 invariants
- `api-contracts.md` → Student — quizzes and attempts (start, get, answers, submit)
- `system-design.md` → flows: start, autosave, submit/finalization; §4 races
- `decisions.md` → D-006, D-007, D-019, D-024

## Tasks
- [x] 04.1 — Attempt model + `grading.ts` → `feat(exam): add attempt model and grading`
- [x] 04.2 — Attempt service (start/resume, get, finalize, save, submit) + routes → `feat(exam): add attempt api with server-side deadline`
- [x] 04.3 — Exam page: countdown, question view, navigation, palette, mark for review → `feat(exam): add exam interface`
- [x] 04.4 — Autosave queue with local pending store and status indicator → `feat(exam): add resilient answer autosave`
- [x] 04.5 — Submit confirm, auto-submit, result page, resume on dashboard → `feat(exam): add submission, results and resume`
- [x] 04.6 — Update docs → `docs: update docs for phase 04`

## Done criteria
- [ ] Full flow works: start → answer → submit → score matches hand calculation
- [ ] Kill the dev server mid-exam, click answers, restart → pending answers sync, status returns to Saved
- [ ] Close the window mid-exam, reopen → Resume restores answers and the same deadline
- [ ] Let the timer run out with the tab closed → attempt shows auto-submitted with saved answers graded
- [ ] Double-click Start creates one attempt; save after submit returns `409 ATTEMPT_CLOSED`
- [ ] Docs match what was built; decisions logged

## How to verify
1. Create a 2-minute quiz with marking 4 / −1 / 0 and run the flows above.
2. `node --test .scratch/grading.test.mjs` (grading + tie cases); `.scratch/race-check.mjs` fires parallel start/submit.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
Phase 05 moves the exam page into an Electron kiosk window and adds the camera gate, snapshots, camera-loss overlay and event log.
