# Phase 07 — Ship: packaging, README, polish

| | |
|---|---|
| Status | review |
| Branch | `phase/07-ship` |
| Depends on | Phase 06 |
| PRD features | F-14, S-01, S-02 |
| Target | 2026-10-25 |

## Goal
A downloadable unsigned macOS `.dmg` that runs the full flow against the production Vercel app, a README
for the GitHub repo, and — only if time remains — the snapshot gallery and DevClub/GSAP polish.

## Previous phase summary
From phase 06 (Results, profile & leaderboard, merged 2026-10-20) — the full product loop now works end to end:
sign-in → quiz editor (fixed slot, countdown) → kiosk exam with camera, snapshots, events, autosave → grading → student profile,
result page, live leaderboard → teacher results, attempt detail with event timeline.
- **For packaging (07.1):** Electron entry `electron/dist/main.js` (compiled by `npm run electron:build`); it reads `PROCTRA_APP_URL`
  from `.env` only in dev (`!app.isPackaged`). The packaged app must get https://proctra-mu.vercel.app another way (baked config /
  `extraMetadata`). Needs `NSCameraUsageDescription` in Info.plist, offline page `electron/offline.html` included, universal arch,
  unsigned (D-012). Dev switches `PROCTRA_FAKE_CAMERA` / `PROCTRA_KIOSK` are ignored when packaged.
- **For S-01 gallery (07.4):** `signedImageUrl(publicId)` in `src/lib/cloudinary.ts`; owner check pattern in `results-service.ts`;
  "Snapshots" card on `/teacher/attempts/[id]` is the place to render it; contract planned as `GET /api/v1/teacher/attempts/:id/snapshots`.
- **Production:** Vercel has MONGODB_URI, AUTH_SECRET, CLOUDINARY_* (Production + Preview). Deploy with `npx vercel deploy --prod` from `main`.
- **Open debt worth considering for hardening:** CSP header, rate limiting, snapshot retention (all in progress.md "Known debt").
- Decisions: D-049 – D-050.

## In scope — exact features
1. **Packaging (must)**
   - Acceptance: `npm run dist` builds a universal unsigned `.dmg` with `NSCameraUsageDescription`, app icon and production `PROCTRA_APP_URL`; installs and runs on a clean Mac (right-click → Open).
2. **Production deploy (must)**
   - Acceptance: latest code on Vercel; full demo flow works from the `.dmg`.
3. **README (must)**
   - Acceptance: what it is, features, screenshots, architecture summary, setup (env, Atlas, Cloudinary, seed), dev commands, packaging, known limitations (kiosk ≠ lockdown, unsigned app, desktop check).
4. **Snapshot gallery (should, S-01)**
   - Acceptance: teacher attempt detail shows snapshots in time order via signed URLs expiring in 10 min.
5. **DevClub UI + GSAP polish (should, S-02)**
   - Acceptance: DevClub components used where they fit; light GSAP transitions on dashboards; nothing animated on exam controls.

## Out of scope
- Code signing/notarization, auto-update, Windows builds.

## Relevant docs
- `architecture.md` → §3, §10
- `api-contracts.md` → teacher snapshots
- `decisions.md` → D-012, D-015

## Tasks
- [x] 07.1 — electron-builder config, entitlements, icon, `npm run dist` → `chore(desktop): add macOS dmg packaging`
- [x] 07.2 — Production deploy + verify `.dmg` end to end → `chore(deploy): ship production build` (verified by the user from the installed .dmg: full teacher → student → results/snapshots/leaderboard flow)
- [x] 07.3 — README → `docs: add project README`
- [x] 07.4 — (should) Snapshot gallery route + UI → `feat(results): add teacher snapshot gallery`
- [x] 07.5 — (should) DevClub UI + GSAP polish → `feat(ui): integrate devclub components and motion`
- [x] 07.6 — Final docs pass → `docs: update docs for phase 07`

## Done criteria
- [x] `.dmg` installs and runs all 10 `idea.md` §12 acceptance criteria against production
  - User-confirmed ("everything is working"). Sharing with a friend surfaced Gatekeeper + size issues → D-054.
- [x] README lets a new person set up and run the project
- [x] Should-haves either done or explicitly parked in progress.md (S-01 and S-02 both done)
- [x] Docs match what was built; decisions logged

## How to verify
1. Fresh install from `.dmg` → walk the demo script (teacher creates quiz → student takes it → results → leaderboard).

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:** macOS installers via `npm run dist` — separate Apple Silicon and Intel `.dmg`s (~120 MB each), ad-hoc signed,
  camera usage text, generated "P" icon, production URL baked in, shell-only bundle; production deployed; teacher **snapshot gallery**
  (signed 10-minute links); light **DevClub UI** (animated score counter) + **GSAP** dashboard entrance; professional README
  (setup, configuration, install steps per macOS version, deployment, security, limitations).
- **Key decisions:** D-051 (packaging), D-052 (gallery links), D-053 (DevClub via shadcn registry, GSAP), D-054 (per-chip installers,
  Gatekeeper steps).
- **Known limitations:** Not notarized — first launch needs Open Anyway / right-click Open / `xattr -cr`. Production was deployed from
  the phase branch before merge for final verification (code identical to what merges). Known debt unchanged: CSP, rate limiting,
  snapshot retention.
- **Next phase should know:** This is the final planned phase. Future work is listed under "Parked ideas" / "Known debt" in
  `docs/progress.md`; Developer ID signing + notarization would remove the Gatekeeper steps.

## Next phase preview
None — final phase. After approval: merge to `main`, deploy, and optionally attach the two `.dmg`s to a GitHub Release.
