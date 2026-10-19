# Phase 05 — Kiosk window & camera proctoring

| | |
|---|---|
| Status | done |
| Branch | `phase/05-kiosk-camera` |
| Depends on | Phase 04 |
| PRD features | F-04, F-05, F-07, F-08, F-09 (capture side) |
| Target | 2026-10-23 |

## Goal
Exams run in an Electron kiosk window, can't start without a camera, upload a private snapshot every
10 s, pause behind an overlay if the camera is lost, and log focus/fullscreen/camera events.

## Previous phase summary
From phase 04 (Taking the exam, merged 2026-10-19):
- **Exists:** Attempt model + API (start/resume, GET, per-answer save, submit, lazy auto-submit); exam page
  `/exam/[attemptId]` (bare layout: title, `SaveIndicator`, `ExamTimer`); `SaveQueue` autosave; submit dialog; time's-up
  overlay; result page `/student/attempts/[attemptId]`; `StartButton` on the quiz page (currently `router.push("/exam/…")`).
- **Hook points for this phase:**
  - `src/components/quiz/start-button.tsx` `start()` → camera check (`window.proctra.requestCamera()` + `getUserMedia` test) →
    `POST …/attempts` → `window.proctra.startExam(attemptId)` instead of `router.push`. Outside Electron: block with a
    "use the desktop app" message (D-013).
  - `src/components/exam/exam-client.tsx` `goToResult()` (called on submit, time's up and `ATTEMPT_CLOSED`) → in kiosk mode call
    `window.proctra.endExam(attemptId)` so main closes the kiosk window and loads the result in the main window.
  - Stop snapshot/event loops when `submitState` leaves `"idle"` or the attempt closes.
  - `electron/preload.ts` exposes only `isDesktop` today; `electron/main.ts` denies all permissions (allow `media` for the app
    origin only) and has the navigation allow-list + cookie flush.
- **Rules:** snapshots/events endpoints must check the attempt is active and owned (reuse `loadOwnAttempt` pattern in
  `attempt-service.ts`); events within the 5 s grace still accepted (final flush on submit).
- **Needs from the user:** Cloudinary cloud name, API key and secret (add to `.env`, `.env.example`, Vercel).
- **Watch out:** macOS camera permission is per-app (TCC); in dev it's granted to the Electron binary. Kiosk/hidden-window
  testing: Chromium pauses painting for covered windows (D-039).
- Decisions: D-042 – D-044.

## In scope — exact features
1. **Desktop bridge + kiosk window**
   - Acceptance: `requestCamera`, `startExam`, `endExam` per api-contracts §3; exam window is kiosk, not closable, one at a time; main window hidden during exam and shown on result after `endExam`.
2. **Camera gate + desktop check**
   - Acceptance: pre-start page shows camera notice; denied/unavailable camera blocks Start with System Settings instructions; outside Electron the Start button explains the desktop app is required.
3. **Snapshots**
   - Acceptance: hidden video → JPEG every 10 s → `POST /attempts/:id/snapshots` → private Cloudinary + Snapshot doc; 2 retries then `snapshot_failed` event; capture stops at submit/expiry; no preview visible.
4. **Camera-loss overlay**
   - Acceptance: unplugging/disabling the camera shows a blocking overlay, timer keeps running, auto-reconnect retries every 2 s; `camera_lost`/`camera_restored` logged.
5. **Proctor events**
   - Acceptance: blur/focus, tab hidden/visible, fullscreen exit, resumed events batched every 5 s to `POST /attempts/:id/events`.

## Out of scope
- Teacher views of events/snapshots (phase 06 / 07). Packaging + Info.plist (phase 07).

## Relevant docs
- `api-contracts.md` → snapshots, events, §3 desktop bridge
- `database-schema.md` → Snapshot, ProctorEvent
- `system-design.md` → flows: start, snapshot, camera lost, window events; §8 security
- `decisions.md` → D-008, D-009, D-010, D-013, D-020

## Tasks
- [x] 05.1 — Preload API + IPC handlers + kiosk exam window + permission handler → `feat(desktop): add kiosk exam window and camera bridge`
- [x] 05.2 — Camera gate and desktop-only check on pre-start + exam page → `feat(proctor): add camera permission gate`
- [x] 05.3 — Snapshot model, Cloudinary lib, upload route, capture loop → `feat(proctor): add periodic snapshot capture`
- [x] 05.4 — (done before 05.3 while waiting for Cloudinary keys) ProctorEvent model + events route + client event batching + camera-loss overlay → `feat(proctor): add event log and camera-loss overlay`
- [x] 05.5 — Update docs (document kiosk limitations) → `docs: update docs for phase 05`

## Done criteria
- [x] In Electron: start quiz → camera prompt → kiosk exam → submit → back to main window result
  - Confirmed by the user on real hardware after the D-047 fix.
- [x] Denying camera blocks start; snapshots appear in Cloudinary (authenticated type) roughly every 10 s; none after submit
- [x] Cmd+Tab during exam creates blur/focus events in MongoDB
  - Blur/focus logging verified via window events (fake camera, windowed). In real kiosk mode macOS disables Cmd+Tab, so no switch happens to log.
- [x] Covering/disabling the camera shows the overlay; timer keeps going
  - Verified by stopping the camera track (fake camera); not tested by unplugging a physical webcam.
- [x] Docs match what was built; decisions logged

## How to verify
1. Fill Cloudinary keys in `.env`. 2. Run a 3-minute quiz in Electron; check Cloudinary media library + `snapshots`/`proctorEvents` in Atlas.
3. Deny camera in System Settings → start is blocked.

## Phase summary
- **Built:** Desktop bridge (`requestCamera`, `startExam`, `endExam`, sender-origin checks); kiosk exam window (full screen,
  not closable, always on top, main window hidden) with a correct exit sequence; camera-only (video) permission for the app origin;
  camera gate before Start/Resume with specific instructions; desktop-only enforcement in the UI; hidden exam camera with
  loss detection + blocking overlay; snapshots every 10 s to private Cloudinary (JPEG checks, retries, `snapshot_failed`);
  neutral proctor event log (batched, clamped, capped; server-side `resumed`). Dev switches `PROCTRA_FAKE_CAMERA` / `PROCTRA_KIOSK`.
- **Key decisions:** D-045 (kiosk lifecycle, permissions, test switches), D-046 (events + hidden camera), D-047 (leave kiosk before
  revealing the result window), D-048 (Cmd+Q quits during the exam via a scoped global shortcut); implementation notes added to D-008, D-010, D-013.
- **Known limitations:** Kiosk ≠ lockdown (Cmd+Q kept on purpose, other devices, power button — system-design "Kiosk mode";
  macOS kiosk does disable app switching and the Force Quit dialog). The start API works from a
  browser (UI blocks it; D-013). No physical-webcam unplug test. No snapshot retention clean-up yet (PRD open question 1). Teachers
  can't see snapshots or events yet (phase 06 / S-01).
- **Next phase should know:**
  - Counts: `snapshotCounts(attemptIds)` (`snapshot-service.ts`) and `eventCounts(attemptIds)` (`proctor-service.ts`) are ready for
    the submissions table; events for a timeline: `ProctorEvent.find({ attemptId }).sort({ occurredAt: 1 })`.
  - Signed image URLs for the gallery (S-01): `signedImageUrl(publicId)` in `src/lib/cloudinary.ts` (10-minute expiry).
  - Teacher views must call `finalizeExpiredForQuiz(quizId)` (attempt-service) before listing results (D-006).
  - Event wording must stay neutral ("window lost focus at …"), never "suspicious".
  - Cloudinary keys are on Vercel (Production + Preview); the API key's role must allow creating assets (D-008 gotcha).

## Next phase preview
Phase 06 builds the student profile, teacher submissions (with event log) and the leaderboard.
