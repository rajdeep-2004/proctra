# Phase v1/02 — Quiz list tabs

| | |
|---|---|
| Status | in-progress |
| Branch | `phase/v1-02-quiz-tabs` |
| Depends on | Phase v1/01 |
| Issues | 1.1, 2.1 |

## Goal
Both dashboards stay readable as quizzes pile up: tabs split the list, and teachers can search by title.

## Previous phase summary
From v1/01 (Copy & navigation cleanup, merged 2026-10-22):
- Header is logo + "Profile" (students) + name/sign out. `BackButton` (`src/components/layout/back-button.tsx`) is used on
  all detail pages. No em dashes in UI copy (rule in D-057); en dashes in time ranges stay.
- Dashboards to change: `src/app/teacher/page.tsx` (`QuizTable`, `listTeacherQuizzes`) and `src/app/student/page.tsx`
  (`QuizGroups` already groups by `availability`: open / upcoming / closed, from `listQuizzesForStudent`).
- Quiz statuses: `draft | published | archived` (`src/models/quiz.ts`); "live/closed" for teachers must come from
  `startsAt`/`endsAt` vs server time, like the student availability.
- Lists render with `StaggerIn` (GSAP); keep that working inside tab panels.
- Verification harness: `.scratch/v1-01-shots.mts` pattern (signed-in headless Chrome, Node 20 needs
  `NODE_OPTIONS=--experimental-websocket`); scratch teacher `t2@scratch.test`.
- Decisions: D-055 – D-057.

## In scope — exact features
1. **Teacher quiz tabs + search (1.1)**
   - Tabs: All · Drafts · Live (published, open or upcoming) · Closed (published, past end time) · Archived, each with a count.
   - Title search box filters the current tab (case-insensitive, client-side; the list is already loaded in full).
   - Acceptance: tab is in the URL (`/teacher?tab=closed`), survives reload and back/forward; empty tab shows a friendly message.
2. **Student quiz tabs (2.1)**
   - Tabs: "Open & upcoming" (default; open first, then upcoming) · "Closed".
   - Acceptance: tab in the URL (`/student?tab=closed`); countdowns still refresh the page when a quiz opens/closes.

## Out of scope
- Server-side pagination (lists are small; revisit in Known debt if they grow).

## Relevant docs
- `api-contracts.md` → `GET /api/v1/teacher/quizzes`, `GET /api/v1/quizzes` (no contract change expected)
- `system-design.md` → availability is computed from server time

## Tasks
- [ ] 02.1 — Tabs UI primitive (shadcn `tabs`) + URL-synced tab helper → `feat(ui): add url-synced tabs`
- [ ] 02.2 — Teacher dashboard tabs + title search → `feat(teacher): add quiz tabs and search`
- [ ] 02.3 — Student dashboard tabs → `feat(student): split quizzes into tabs`
- [ ] 02.4 — Docs pass → `docs: update docs for phase v1/02`

## Done criteria
- [ ] Lint + build pass
- [ ] Each tab shows exactly the right quizzes (checked with seeded draft/live/closed/archived quizzes)
- [ ] Tab survives reload; the classification helper is checked in `.scratch/`
- [ ] Docs match what was built; decisions logged

## How to verify
1. Create one quiz in each state; open `/teacher` and `/student`, switch tabs, reload, use search.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
v1/03 changes leaderboard ranking and the attempt/result headers.
