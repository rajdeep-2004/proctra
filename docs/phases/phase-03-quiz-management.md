# Phase 03 — Quiz management

| | |
|---|---|
| Status | not-started |
| Branch | `phase/03-quiz-management` |
| Depends on | Phase 02 |
| PRD features | F-02, F-03, (F-11 field) |
| Target | 2026-10-20 → 2026-10-21 |

## Goal
Teachers create, edit, publish, unpublish and archive MCQ quizzes with marking rules; students see
published quizzes and a pre-start detail screen.

## Previous phase summary
From phase 02 (Auth & roles, merged 2026-10-19):
- **Exists:** User model (`src/models/user.ts`, roles `student`/`teacher`); Auth.js v5 beta sign-in (12 h
  JWT cookie); `requireUser(role)` for API handlers and `requirePageUser(role)` for pages (`src/lib/session.ts`);
  `src/proxy.ts` redirects by role; `/student` and `/teacher` dashboard shells with `AppHeader`
  (`src/components/layout/app-header.tsx`); seeded teacher via `npm run seed`. shadcn components available:
  button, card, input, label, alert.
- **Rely on:** teacher handlers start with `const user = await requireUser("teacher")`, then pass `user.id`
  to services for ownership checks. Page data reads go in an async component inside `<Suspense>` that calls
  `requirePageUser(...)` (pattern in `src/app/teacher/page.tsx`). Everything except auth forms uses `/api/v1` (D-034).
- **Must do first in 03.2:** verify a student calling a teacher API gets `403` (carried-over done criterion from phase 02).
- **Watch out:** Auth.js is a pinned beta (D-033). Commit gate: `sh .scratch/run-all.sh && npm run lint && git commit`.
  Use `@scratch.test` emails for test users and clean up with `npx tsx .scratch/cleanup-users.mts`.
- Decisions: D-032 – D-036.

## In scope — exact features
1. **Quiz model + validation**
   - Acceptance: Quiz schema per `database-schema.md`; Zod `QuizInput` enforces window, duration, 2–6 options, valid `correctIndex`, marking range.
2. **Teacher quiz API**
   - Acceptance: list/create/get/update/publish/unpublish/archive per `api-contracts.md`; only the owner can access; state machine enforced; `QUIZ_LOCKED` logic present (lock itself is set in phase 04).
3. **Quiz editor UI**
   - Acceptance: form for title, instructions, start/end, duration, marking (correct/incorrect/unanswered), optional results-release time; add/edit/remove/reorder (up/down buttons) questions and options; pick correct option; save draft; publish/unpublish/archive buttons with status badge.
4. **Teacher dashboard**
   - Acceptance: table of my quizzes with status, window, question count, attempt count.
5. **Student quiz list + detail**
   - Acceptance: `/student` lists published quizzes with availability (upcoming/open/closed); detail page shows instructions, timing, marking, camera notice — no questions, no correct answers in any response.

## Out of scope
- Starting attempts (phase 04). Drag-and-drop reordering. Rich text, images in questions.

## Relevant docs
- `database-schema.md` → Quiz, §5 invariants
- `api-contracts.md` → Teacher — quizzes, `GET /quizzes`, `GET /quizzes/:id`
- `decisions.md` → D-016, D-018, D-022

## Tasks
- [ ] 03.1 — Quiz model + Zod quiz schemas → `feat(quiz): add quiz model and validation schemas`
- [ ] 03.2 — Quiz service + teacher quiz routes (CRUD + state transitions) → `feat(quiz): add teacher quiz api`
- [ ] 03.3 — Teacher dashboard quiz table + quiz editor page → `feat(quiz): add teacher dashboard and quiz editor`
- [ ] 03.4 — Student quiz list + quiz detail routes and pages → `feat(quiz): add student quiz list and detail`
- [ ] 03.5 — Update docs → `docs: update docs for phase 03`

## Done criteria
- [ ] Teacher creates a 5-question quiz with negative marking, publishes it; a student sees it
- [ ] Publishing with 0 questions fails with a clear message; archived quiz can't be republished
- [ ] Another teacher's quiz returns `403`; student responses never contain `correctIndex` (checked by scratch script)
- [ ] Docs match what was built; decisions logged

## How to verify
1. Teacher: create → edit → reorder → publish. 2. Student: dashboard → open quiz detail.
3. `.scratch/quiz-check.mjs`: grep student JSON for `correctIndex`; hit another owner's quiz.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
Phase 04 lets students start the quiz, answer, autosave and submit — it needs published quizzes and the quiz detail page's Start button.
