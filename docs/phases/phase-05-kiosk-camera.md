# Phase 05 — Kiosk window & camera proctoring

| | |
|---|---|
| Status | not-started |
| Branch | `phase/05-kiosk-camera` |
| Depends on | Phase 04 |
| PRD features | F-04, F-05, F-07, F-08, F-09 (capture side) |
| Target | 2026-10-23 |

## Goal
Exams run in an Electron kiosk window, can't start without a camera, upload a private snapshot every
10 s, pause behind an overlay if the camera is lost, and log focus/fullscreen/camera events.

## Previous phase summary
<!-- Filled at /phase-start. -->

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
- [ ] 05.1 — Preload API + IPC handlers + kiosk exam window + permission handler → `feat(desktop): add kiosk exam window and camera bridge`
- [ ] 05.2 — Camera gate and desktop-only check on pre-start + exam page → `feat(proctor): add camera permission gate`
- [ ] 05.3 — Snapshot model, Cloudinary lib, upload route, capture loop → `feat(proctor): add periodic snapshot capture`
- [ ] 05.4 — ProctorEvent model + events route + client event batching + camera-loss overlay → `feat(proctor): add event log and camera-loss overlay`
- [ ] 05.5 — Update docs (document kiosk limitations) → `docs: update docs for phase 05`

## Done criteria
- [ ] In Electron: start quiz → camera prompt → kiosk exam → submit → back to main window result
- [ ] Denying camera blocks start; snapshots appear in Cloudinary (authenticated type) roughly every 10 s; none after submit
- [ ] Cmd+Tab during exam creates blur/focus events in MongoDB
- [ ] Covering/disabling the camera shows the overlay; timer keeps going
- [ ] Docs match what was built; decisions logged

## How to verify
1. Fill Cloudinary keys in `.env`. 2. Run a 3-minute quiz in Electron; check Cloudinary media library + `snapshots`/`proctorEvents` in Atlas.
3. Deny camera in System Settings → start is blocked.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
Phase 06 builds the student profile, teacher submissions (with event log) and the leaderboard.
