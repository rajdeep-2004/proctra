TECHNICAL PRODUCT REQUIREMENTS

# Electron-Based Quiz & Proctoring App

Capstone Project · Version 2.0 · 18 October 2026

A deliberately small desktop application focused on quiz CRUD, automatic
marking, basic camera permission and snapshots, and Electron kiosk-style
exam mode.

## 1. Product Summary

The application is a desktop quiz platform built with Electron. Students
sign in, view assigned quizzes, take a timed MCQ exam in a kiosk-style
window, and review their marks and past attempts from a profile
dashboard. Teachers sign in to create quizzes, configure marking rules,
assign quizzes, and view submissions and leaderboards.

This is a capstone-sized application, not a production-grade examination
or endpoint-lockdown system. The implementation should favor familiar
CRUD workflows and a small number of clear Electron capabilities.

## 2. Goals

-   Provide separate student and teacher experiences behind sign-in.

-   Let teachers create and manage MCQ quizzes and define the marks
    awarded for correct, incorrect, and unanswered questions.

-   Let students take timed quizzes, navigate questions, save answers,
    and submit or auto-submit.

-   Ask for camera permission before starting a proctored attempt and
    periodically capture still images while the attempt is active.

-   Use Electron kiosk-style/fullscreen behavior for the exam window
    without claiming complete operating-system lockdown.

-   Give students a profile dashboard containing their completed tests
    and corresponding marks.

-   Keep the codebase and feature scope appropriate for a university
    capstone.

## 3. Explicit Non-Goals

-   No AI-based cheating detection, face recognition, gaze tracking, or
    automated suspicion scoring.

-   No continuous video recording; the V1 proctoring feature uses
    periodic still-image snapshots only.

-   No guarantee that students cannot switch apps, use system shortcuts,
    or bypass operating-system controls.

-   No native macOS device-management or operating-system-level
    lockdown.

-   No separate microservices, Redis, Kubernetes, Docker, CI/CD, or
    deployment pipeline.

-   No testing strategy or testing plan in this PRD.

-   No complex analytics, question banks, adaptive exams, essay grading,
    or elaborate reporting.

-   No local/offline result-history feature in V1.

## 4. User Roles and Permissions

## 5. Recommended Technology Stack

DevClub UI component library repository:
https://github.com/devclub-nstru/component_library

Use this repository as the source of truth for the DevClub animated
React components. The repository describes components built with React,
TypeScript, and Tailwind CSS, with motion using GSAP and Motion;
components can be added through the @devclubnst/ui CLI or the
shadcn-compatible registry. Review the repository's README and component
documentation before selecting components. Prefer the library's
components where they fit, and use standard shadcn/ui components for
common forms, tables, dialogs, and accessible controls.

Stack constraint: do not add Express, Redis, Prisma, Docker, a queue
system, or other infrastructure unless an actual requirement emerges.
The DevClub UI library will be integrated after its
documentation/package is provided.

## 6. Core User Journeys

### 6.1 Sign-in and role routing

1.  The user opens the desktop app and signs in.

2.  The application identifies the user's role.

3.  Students are routed to the student dashboard; teachers are routed to
    the teacher dashboard.

4.  Protected actions must check authorization on the server, not only
    hide UI controls.

### 6.2 Teacher creates and publishes a quiz

1.  Teacher selects Create Quiz and enters the quiz title,
    description/instructions, schedule, and duration.

2.  Teacher adds MCQ questions, answer options, and the correct option
    for each question.

3.  Teacher sets the marking scheme: marks for a correct answer, an
    incorrect answer, and an unanswered question. Values are
    teacher-defined and may be positive, zero, or negative.

4.  Teacher reviews the quiz, saves it as a draft, and publishes it when
    ready.

5.  Teacher assigns the quiz to the intended students or cohort using
    the simplest assignment model supported by the course.

### 6.3 Student takes a quiz

1.  Student opens an available quiz and reads its instructions,
    schedule, duration, and camera notice.

2.  Before the attempt starts, the app requests camera permission. If
    permission is denied or the camera is unavailable, the app explains
    the issue and follows the course-approved policy; it must not
    silently claim that proctoring is active.

3.  After permission is granted, the student starts the attempt and
    enters the exam window.

4.  The exam UI shows a countdown, question text and options,
    Next/Previous controls, a question palette, Mark for Review, and
    progress status.

5.  Answers are saved as the student navigates and should be recoverable
    if the UI briefly reloads or a request fails.

6.  The student submits manually with a confirmation step, or the
    attempt auto-submits when the server-authoritative deadline is
    reached.

7.  Periodic still snapshots are captured during the active attempt and
    uploaded to Cloudinary. There is no continuous video recording or
    camera preview.

### 6.4 Student profile and attempt history

1.  The student has a separate Profile area or dashboard section.

2.  The profile lists quizzes/tests the student has taken, attempt date,
    status, and marks awarded.

3.  Opening an attempt may show the score and result details allowed by
    the quiz's result-release settings.

4.  Students can view only their own attempt history.

### 6.5 Teacher reviews results

1.  Teacher opens a quiz and sees its submissions and marks.

2.  Teacher can view a quiz-scoped leaderboard when results are
    available.

3.  Equal marks share the same rank using competition ranking; for
    example, ranks 1, 1, 3.

4.  The leaderboard must not expose camera snapshots or private
    proctoring data to students.

## 7. Functional Requirements

### 7.1 Authentication and roles

-   Users must sign in before accessing dashboards or taking a quiz.

-   The UI must route users based on their role.

-   Teacher-only actions must be protected from student accounts.

-   Teacher account provisioning is an open decision; do not assume
    public self-registration for teachers.

### 7.2 Quiz management

-   Teachers can create, view, edit, publish, unpublish, and archive
    quizzes.

-   A quiz includes a title, instructions, start/end availability,
    duration, questions, and assignment information.

-   Each question in V1 is an MCQ with a single correct option.

-   Teachers can add, edit, reorder, and remove questions and options
    before the quiz is attempted.

-   Each quiz has three configurable marking values: correct answer,
    incorrect answer, and unanswered question.

-   Marking values are applied consistently to every question in that
    quiz unless a later requirement explicitly calls for per-question
    marks.

-   Published quizzes should not silently change for students who
    already have an active attempt.

### 7.3 Exam experience

-   Show the remaining time clearly throughout the attempt.

-   Support Next, Previous, question palette navigation, and Mark for
    Review.

-   Visually distinguish attempted, unanswered, and marked-for-review
    questions.

-   Save selected answers during the attempt.

-   Show a submission confirmation before manual submission.

-   Auto-submit when the authoritative deadline expires.

-   The server determines whether an attempt is eligible to start and
    whether it is submitted on time; do not rely solely on the
    renderer's countdown.

### 7.4 Camera and basic proctoring

-   Display a clear notice explaining that camera access is required and
    that still images will be captured periodically during the quiz.

-   Request camera permission before starting the attempt; use the
    operating system/browser permission flow.

-   Do not show a live camera preview in the exam UI.

-   Capture a still image at a configurable interval, with 10 seconds as
    the initial default.

-   Upload snapshots to Cloudinary and associate each snapshot with the
    relevant attempt and capture time.

-   Stop capture when the attempt ends, is submitted, or is
    auto-submitted.

-   If permission is denied, the camera disappears, or upload fails,
    show a clear status and apply the agreed course policy. Do not imply
    that a missing image proves misconduct.

-   Limit access to snapshots to authorized teachers/admins; define
    retention and deletion rules before collecting real student data.

### 7.5 Electron kiosk-style exam window

-   Open the active exam in a dedicated Electron window using
    fullscreen/kiosk-style behavior supported by Electron.

-   Keep the exam UI focused and avoid ordinary in-app navigation while
    an attempt is active.

-   Record basic supported events such as fullscreen exit or window
    focus loss if feasible, and show a non-accusatory notice when
    appropriate.

-   Do not promise that all system shortcuts, app switching, Mission
    Control, force quit, or other operating-system actions are blocked.

-   On submission or expiry, end the exam window state and return the
    student to the app's result/confirmation screen.

### 7.6 Results and leaderboard

-   Automatically grade MCQ attempts using the quiz's configured marking
    values.

-   Calculate the final mark from the marks for correct, incorrect, and
    unanswered questions.

-   Show a student's marks on the profile history for each completed
    test.

-   Allow teachers to inspect results for quizzes they own or manage.

-   Show a quiz-specific leaderboard to eligible users, subject to the
    result-release setting.

-   Use competition ranking for ties (1, 1, 3).

-   Whether retakes are allowed and whether the leaderboard uses latest,
    highest, or first attempt remains an open decision.

## 8. High-Level Architecture

Keep the architecture small: Electron provides the desktop shell and
exam-window behavior; the Next.js application provides the UI and
server-side request handling; MongoDB stores users, quizzes,
assignments, attempts, and result records; Cloudinary stores camera
snapshots.

Use Electron's context isolation and keep Node integration disabled in
the renderer. Any IPC operation must be narrowly scoped and validated.
The renderer must not be trusted to set its own role, score, submission
timestamp, or quiz deadline.

## 9. Data and Privacy Principles

-   Collect only the data needed for accounts, quizzes, attempts, marks,
    and the disclosed snapshot feature.

-   Tell students when camera capture is active and what the images are
    used for.

-   Request camera permission explicitly before an attempt; do not
    access the camera in the background outside an active attempt.

-   Restrict snapshot access to authorized staff and avoid exposing
    snapshots through public URLs or student leaderboards.

-   Choose snapshot retention/deletion rules and obtain the
    institution's approval before real student use.

-   Do not label focus-loss events or missing snapshots as proof of
    cheating.

## 10. Error and Edge-Case Behavior

## 11. Scope Boundaries and Simplicity Rules

-   Build the smallest complete end-to-end path first: sign-in →
    create/publish quiz → student attempt → automatic grading → profile
    history.

-   Implement basic camera permission and periodic still capture only;
    do not build computer vision or video streaming.

-   Use one application codebase and one database; avoid separate
    services and background infrastructure.

-   Use shadcn/ui for common UI and the DevClub library where it fits;
    use GSAP only for limited polish.

-   Keep kiosk mode to Electron-supported fullscreen/kiosk behavior and
    clearly documented limitations.

-   Do not add deployment, Docker, CI/CD, or a testing plan to this
    project scope.

## 12. Acceptance Criteria

-   A student and a teacher can sign in and reach the correct
    role-specific dashboard.

-   A teacher can create and publish an MCQ quiz with schedule,
    duration, assignment, and correct/incorrect/unanswered marking
    values.

-   A student can see an assigned quiz, read instructions, grant camera
    permission, and start an attempt.

-   The exam UI supports a countdown, question navigation, question
    palette, Mark for Review, answer saving, manual submit confirmation,
    and auto-submit at expiry.

-   Periodic still snapshots are attempted only during an active attempt
    after camera permission is granted; capture stops when the attempt
    ends.

-   The app uses Electron fullscreen/kiosk-style behavior for the exam
    window without claiming complete OS lockdown.

-   Quiz results are automatically graded using the teacher-configured
    marking values.

-   A student's profile lists completed tests and the corresponding
    marks.

-   A teacher can view quiz results and a quiz-specific leaderboard with
    tie ranking.

-   Students cannot access teacher-only operations or another student's
    private attempt history through normal app requests.

## 13. Decisions to Finalize Before Implementation

## 14. Out of Scope for This Document

This PRD intentionally does not define detailed API endpoints, database
collection schemas, indexes, repository folder structure, exact IPC
channel names, component-level designs, test cases, deployment
instructions, packaging/release workflows, or CI/CD. Those can be
specified only when needed during implementation.

## 15. Reference Links

DevClub UI component library:
https://github.com/devclub-nstru/component_library

DevClub UI component documentation: https://ui.devclubxnst.online

These links are implementation references for the UI layer. The selected
components should be chosen based on the app's actual screens and should
not introduce unnecessary animation or dependencies into the exam flow.

| Role \| Can do \| Cannot do \|

| --- \| --- \| --- \|

| Student \| View assigned/available quizzes; take eligible quizzes;
  view own profile and attempt history; view released quiz results and
  eligible leaderboards. \| Create/edit quizzes; view another student's
  private profile or full attempt details. \|

| Teacher \| Create, edit, publish, assign, and manage quizzes; view
  quiz submissions, marks, and leaderboard. \| Change a student's
  submitted answers or impersonate a student through normal UI. \|

| Admin (optional provisioning role) \| Provision teacher accounts or
  configure who can create quizzes if needed by the course. \| A
  separate admin dashboard is not required for V1. \|

| Area \| Choice \| Scope guidance \|

| --- \| --- \| --- \|

| Desktop shell \| Electron \| Owns the application window, exam
  fullscreen/kiosk-style behavior, and camera/permission integration. \|

| UI and app framework \| Next.js + React + TypeScript \| Use one
  application codebase; avoid a separate Express server for this
  capstone. \|

| Styling and components \| Tailwind CSS + shadcn/ui \| Use shadcn/ui
  for common controls, forms, dialogs, tables, and navigation. \|

| Club design system \| DevClub UI library (to be supplied) \| Use the
  supplied library where compatible; do not invent its APIs before
  reviewing it. \|

| Motion \| GSAP \| Use sparingly for small transitions or
  dashboard/exam-state transitions; do not animate critical exam
  controls. \|

| Database \| MongoDB Atlas or a course-approved MongoDB instance +
  Mongoose \| Keep data modeling straightforward; detailed schemas are a
  later engineering decision. \|

| Authentication \| Auth.js or a compatible straightforward
  session-based approach \| Choose the simplest compatible option during
  implementation; protect role-specific pages and actions. \|

| Image storage \| Cloudinary \| Store periodic camera snapshots; avoid
  storing snapshots in the database as binary blobs. \|

| Component \| Responsibility \|

| --- \| --- \|

| Electron main process \| Create app windows, control
  fullscreen/kiosk-style exam presentation, handle permitted desktop
  capabilities, and coordinate safe IPC. \|

| Renderer (Next.js/React UI) \| Sign-in, dashboards, quiz forms,
  student exam interface, profile history, results, and leaderboard. \|

| Preload bridge \| Expose only narrowly scoped desktop capabilities to
  the renderer; do not expose unrestricted Node.js APIs. \|

| Next.js server-side handlers \| Enforce authentication/roles, validate
  quiz and attempt operations, save answers, apply marking rules, and
  determine submission/deadline state. \|

| MongoDB + Mongoose \| Persist application records. Detailed
  collections and schemas are intentionally left for implementation
  planning. \|

| Cloudinary \| Store periodic camera still images and return references
  for authorized access. \|

| Situation \| Expected behavior \|

| --- \| --- \|

| Camera permission denied \| Explain that camera proctoring cannot
  start and apply the course's chosen policy. \|

| Camera unavailable after starting \| Show a clear status and stop
  claiming capture is active; apply the chosen policy. \|

| Snapshot upload fails \| Retry a small number of times or report the
  failure; do not block the whole UI indefinitely. \|

| Network temporarily fails \| Preserve local UI state and retry saving;
  do not claim the server has saved an answer until confirmed. \|

| Student closes/reopens app mid-attempt \| Resume behavior must be
  decided; if supported, restore the active attempt and use the server's
  deadline. \|

| Timer reaches zero \| Submit/close the attempt based on
  server-authoritative timing. \|

| Quiz is outside its availability window \| Prevent a new attempt from
  starting and explain why. \|

| Decision \| Suggested simple default (not locked) \|

| --- \| --- \|

| Teacher account provisioning \| Teacher accounts are created or
  approved manually; students may register or be provisioned. \|

| Retakes \| One attempt per student per quiz for the first version. \|

| Leaderboard score \| Use the single permitted attempt; if retakes are
  later enabled, decide whether latest or highest counts. \|

| Result release \| Show marks after submission unless the teacher
  chooses to hide results until a specified time. \|

| Camera failure policy \| Warn and log the issue; whether to block or
  allow the attempt must be decided by the course owner. \|

| Snapshot interval \| 10 seconds initially, configurable in quiz/app
  settings if needed. \|

| Snapshot retention \| Set a short, explicit retention period with
  institutional approval. \|

| Resume after app closure \| Prefer resuming the same active attempt
  using the server-authoritative deadline if feasible. \|

| Assignment model \| Start with assigning a quiz to a simple
  class/cohort or selected students. \|

| Supported operating systems \| Confirm the course's target OS; the
  current design assumes desktop Electron and does not promise identical
  kiosk behavior on every OS. \|

| DevClub UI library \| Review the library and its integration
  requirements once supplied. \|
