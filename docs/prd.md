# Product Requirements — Proctra

> Status: approved — Last updated: 2026-10-19 (fixed exam slot + countdown, approved by user; D-041)
> Source: `idea.md` (Technical PRD v2.0, 18 Oct 2026) + kickoff interview.

## 1. Problem
University courses want to run timed MCQ exams on student laptops with some basic proctoring, but
most existing tools are heavyweight, paid, or invasive (continuous video, AI "suspicion scores").
Teachers need a simple way to write a quiz, set marking rules (including negative marking), and
get graded results and a leaderboard. Students need a focused exam window and a clear view of their
past marks. Proctra is a small Electron desktop app that does exactly this, honestly: a kiosk-style
exam window and periodic still snapshots, with no claims of full OS lockdown or cheating detection.

## 2. Users
| User / actor | What they need | How often |
|---|---|---|
| Student | Sign up, see available quizzes, take a timed exam, see marks and history | Per exam |
| Teacher | Create/publish MCQ quizzes with marking rules, view submissions, leaderboard, proctoring events | Weekly |
| Admin | Teacher accounts created by a seed script; no admin UI in V1 | Once at setup |

## 3. Goals
- The full loop works end to end on macOS: sign-in → teacher creates & publishes a quiz → student
  takes it in a kiosk window with camera snapshots → automatic grading → student profile history →
  teacher results + leaderboard.
- The server is the only authority on roles, deadlines, submission time and scores.
- Delivered as a packaged macOS `.dmg` within one week (due ~2026-10-25).

## 4. Non-goals
- AI cheating detection, face recognition, gaze tracking, suspicion scoring.
- Continuous video recording or a live camera preview.
- Guaranteed OS lockdown (app switching, Mission Control, force quit are **not** blocked).
- Windows/Linux support or testing (macOS only for V1).
- Microservices, Redis, queues, Docker, CI/CD, automated test suites (lean profile).
- Question banks, adaptive exams, essay grading, per-question marks, complex analytics.
- Offline/local result history. Retakes. Admin dashboard. Cohorts/class assignment.
- Code signing / notarization of the `.dmg`.

## 5. Features
### Must have (v1)
| ID | Feature | Acceptance criteria |
|---|---|---|
| F-01 | Auth & roles | Students self-register (name, email, password). Teacher accounts come from a seed script. Sign-in routes to the student or teacher dashboard. Every teacher-only server action rejects students (403). |
| F-02 | Quiz management | Teacher can create/edit a draft with title, instructions, an exam slot (start and end time — the server derives the duration, 1 min–5 h), single-correct MCQ questions (add/edit/reorder/remove questions and options), and marks for correct / incorrect / unanswered (any number, incl. negative). Teacher can publish, unpublish, archive. Questions, marking and start time become read-only once any attempt exists; the end time can then only be moved later (extends every student's deadline). |
| F-03 | Quiz availability | Every published, non-archived quiz is visible to all students. A new attempt can only start between the start and end time; every attempt ends at the quiz end time (late starters get less time). Students see a live countdown: "Starts in …" before the slot and "Ends in …" during it, based on server time. |
| F-04 | Camera gate | Before starting, the student sees a notice (camera required, a still image every 10 s). The app requests camera permission via the OS flow. Without a working camera, the attempt cannot start and the reason is shown. |
| F-05 | Kiosk exam window | The attempt opens in a dedicated Electron kiosk/fullscreen window with no in-app navigation. On submit/expiry the window closes and the student lands on the result/confirmation screen. Limitations are documented. |
| F-06 | Exam UI | Countdown (server deadline), question + options, Next/Previous, question palette, Mark for Review, visual states (answered / unanswered / marked). Answers autosave on change with a visible "saved / saving / retrying" status. Manual submit has a confirmation dialog. Auto-submit when the server deadline passes. If the app closes mid-attempt, reopening resumes the same attempt with the original deadline. |
| F-07 | Snapshots | A still image is captured every 10 s only during an active attempt and uploaded to Cloudinary (private), recorded against the attempt with capture time. Capture stops on submit/expiry. Upload failures retry a few times and then are logged; they never block the UI. |
| F-08 | Camera-loss pause | If the camera disappears mid-attempt, the exam is covered by a "camera disconnected" overlay until it returns. The server deadline keeps running. The event is logged. |
| F-09 | Proctoring event log | Window blur/focus loss, fullscreen exit, camera lost/restored and snapshot upload failures are recorded per attempt and listed (neutral wording) on the teacher's submission view. |
| F-10 | Auto-grading | On submit/expiry the server scores the attempt: Σ(correct × mCorrect + incorrect × mIncorrect + unanswered × mUnanswered). |
| F-11 | Result release | Marks are visible to the student right after submission unless the teacher set a "release results at" time, in which case they appear after that time. |
| F-12 | Student profile | Lists the student's own attempts: quiz, date, status, marks (if released). Opening one shows the score breakdown. Students can never read another student's attempts. |
| F-13 | Teacher results & leaderboard | Teacher sees all submissions + marks for quizzes they own, and a quiz leaderboard with competition ranking (1, 1, 3). Students see the leaderboard only once results are released; it shows name, rank and marks, never snapshots or events. |
| F-14 | Packaged app + README | `npm run dist` produces an unsigned macOS `.dmg` that loads the deployed app. README covers setup, env vars, seeding, running, packaging and known limitations. |

### Should have
| ID | Feature | Notes |
|---|---|---|
| S-01 | Teacher snapshot gallery | Per-attempt grid of snapshots in time order using signed, expiring Cloudinary URLs. First to cut. |
| S-02 | DevClub UI + GSAP polish | Swap in DevClub components where they fit; light transitions on dashboards only, never on exam controls. |

### Later / maybe
- Retakes (latest vs highest attempt on leaderboard).
- Cohort/class assignment.
- Configurable snapshot interval per quiz.
- Automated snapshot retention cleanup.
- Windows support, code signing/notarization.

## 6. Core user flows
### Flow 1: Teacher creates and publishes a quiz
1. Teacher signs in → teacher dashboard → "New quiz".
2. Enters title, instructions, start and end time (duration shown, computed), marking values.
3. Adds MCQ questions with options and one correct option; reorders as needed.
4. Saves as draft, reviews, publishes. Quiz is now visible to all students.

### Flow 2: Student takes a quiz
1. Student signs in → dashboard lists available quizzes (tabs: Open & upcoming · Closed).
2. Opens one → sees instructions, start/end time, a live "Starts in …" countdown, camera notice.
3. Grants camera permission (blocked if denied/unavailable).
4. Clicks Start (enabled once the slot opens) → server creates the attempt with deadline = quiz end time → kiosk exam window opens.
5. Answers questions; each change autosaves. Snapshots upload every 10 s.
6. Submits with confirmation, or is auto-submitted at the deadline.
7. Kiosk window closes → result screen (marks if released) → profile history.

### Flow 3: Teacher reviews results
1. Teacher opens a quiz → submissions table (student, status, marks, event count).
2. Opens a submission → answers breakdown + proctoring event log (+ snapshot gallery if S-01 is built).
3. Opens the leaderboard → ranked list with ties sharing a rank.

## 7. Constraints
- Deadline: one week, ~2026-10-25.
- Scale: one class, roughly 10–100 students, at most a few dozen exams at once.
- Platform / hosting: Next.js on Vercel (manual deploy); Electron shell for macOS loads the Vercel URL; MongoDB Atlas free tier; Cloudinary free tier.
- Budget: free tiers only.
- Compliance / privacy: students are told when capture is active; snapshots are private and only teachers can access them; no snapshot is captured outside an active attempt; missing snapshots or focus-loss events are never labelled as cheating. Snapshots must have an agreed retention period before any real student data is collected.

## 8. Success metrics
- All 10 acceptance criteria from `idea.md` §12 can be demonstrated live from the `.dmg`.
- No student request can read another student's attempt or perform a teacher action.
- Grading and leaderboard ranks match a hand calculation for a sample quiz.

## 9. Open questions
| # | Question | Owner | Resolved? |
|---|---|---|---|
| 1 | Snapshot retention period (default proposal: 30 days, deleted manually via script) | Course owner | No — required only before real student use |
| 2 | Does the course accept an unsigned `.dmg` (user must right-click → Open on first launch)? | Rajdeep | Yes — unsigned (ad-hoc) accepted; install steps in README (D-051, D-054) |
| 3 | DevClub UI: install via `@devclubnst/ui` CLI — confirm it's compatible with our Tailwind version at S-02 | Claude | Yes — installed via the shadcn registry (the CLI failed to install); works with Tailwind v4 (D-053) |
