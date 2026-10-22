# Phase v1/01 — Copy & navigation cleanup

| | |
|---|---|
| Status | not-started |
| Branch | `phase/v1-01-copy-nav` |
| Depends on | Phase v0/07 (v0.1.0 released) |
| Issues | 1.2, 1.3, 1.4 (em dash), 2.3 (back navigation), 3.1, 3.2 |

## Goal
The app reads cleanly: a simpler navbar, no em dashes anywhere in the UI, no repeated "not evidence of
misconduct" disclaimers, and real buttons for back navigation instead of small text links.

## Previous phase summary
<!-- Filled at /phase-start from v0/07's "Phase summary". -->

## In scope — exact features
1. **Navbar (3.1)**
   - Acceptance: the header shows "Proctra" (links to the role's dashboard) and the user menu. No "Student"/"Teacher"
     role label, no "Quizzes" link. Students keep a "Profile" link.
2. **No em dashes in app copy (3.2, 1.4)**
   - Acceptance: `grep -rn "—" src` finds em dashes only inside code comments. Every UI string is rewritten as a natural
     sentence (comma, period, colon or "·"), not just a character swap. Includes the attempt page's
     "Neutral facts about the exam session — not evidence of misconduct." and page titles like "<quiz> — results".
   - En dashes in time ranges ("9:00 – 10:00") are a different character and stay unless the user asks otherwise.
3. **Remove the events disclaimer (1.3)**
   - Acceptance: the paragraph "Events are neutral facts (focus changes, camera reconnects, failed uploads). They are not
     evidence of misconduct." is gone from the teacher results page. Event wording elsewhere stays neutral (CLAUDE.md rule).
4. **Back buttons (1.2, 2.3)**
   - Acceptance: one shared `BackButton` component (shadcn `Button` + `ArrowLeft` icon) replaces every
     "← All quizzes", "← Edit quiz" and "← <quiz> results" text link. Labels: "Back to quizzes", "Edit quiz",
     "Back to results". Keyboard focus ring visible.

## Out of scope
- Restyling other buttons (leaderboard button is v1/03), tabs (v1/02).

## Relevant docs
- `architecture.md` → components folder layout
- `decisions.md` → D-053 (DevClub/GSAP: never on exam screens)

## Tasks
- [ ] 01.1 — Navbar: drop role label and Quizzes link → `refactor(layout): simplify app header nav`
- [ ] 01.2 — Shared `BackButton` + use it on all detail pages → `feat(ui): add back button component`
- [ ] 01.3 — Remove em dashes from all UI copy + delete events disclaimer → `fix(copy): remove em dashes and event disclaimer`
- [ ] 01.4 — Docs pass → `docs: update docs for phase v1/01`

## Done criteria
- [ ] `npm run lint` and `npm run build` pass
- [ ] No em dash in any user-facing string (grep check, comments excluded)
- [ ] Teacher and student pages checked in the browser; back buttons work and are keyboard reachable
- [ ] Docs match what was built; decisions logged

## How to verify
1. `grep -rn "—" src | grep -vE ":\s*[0-9]+:\s*(//|\*)"` → only comment hits remain.
2. `npm run dev`, sign in as teacher and student, click through quiz detail, results, attempt, result pages.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
v1/02 adds tabs to both quiz lists.
