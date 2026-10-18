# Phase 07 — Ship: packaging, README, polish

| | |
|---|---|
| Status | not-started |
| Branch | `phase/07-ship` |
| Depends on | Phase 06 |
| PRD features | F-14, S-01, S-02 |
| Target | 2026-10-25 |

## Goal
A downloadable unsigned macOS `.dmg` that runs the full flow against the production Vercel app, a README
for the GitHub repo, and — only if time remains — the snapshot gallery and DevClub/GSAP polish.

## Previous phase summary
<!-- Filled at /phase-start. -->

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
- [ ] 07.1 — electron-builder config, entitlements, icon, `npm run dist` → `chore(desktop): add macOS dmg packaging`
- [ ] 07.2 — Production deploy + verify `.dmg` end to end → `chore(deploy): ship production build`
- [ ] 07.3 — README → `docs: add project README`
- [ ] 07.4 — (should) Snapshot gallery route + UI → `feat(results): add teacher snapshot gallery`
- [ ] 07.5 — (should) DevClub UI + GSAP polish → `feat(ui): integrate devclub components and motion`
- [ ] 07.6 — Final docs pass → `docs: update docs for phase 07`

## Done criteria
- [ ] `.dmg` installs and runs all 10 `idea.md` §12 acceptance criteria against production
- [ ] README lets a new person set up and run the project
- [ ] Should-haves either done or explicitly parked in progress.md
- [ ] Docs match what was built; decisions logged

## How to verify
1. Fresh install from `.dmg` → walk the demo script (teacher creates quiz → student takes it → results → leaderboard).

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
None — final phase.
