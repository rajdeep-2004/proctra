# Phase v1/06 — Release v1.0.0

| | |
|---|---|
| Status | in-progress |
| Branch | `phase/v1-06-release` |
| Depends on | Phase v1/05 |
| Issues | — (ships everything above) |

## Goal
v1.0.0 is live: production deployed, per-chip `.dmg` installers on a GitHub Release, README up to date.

## Previous phase summary
v1/05 (merged e2555fc): teacher's student page + owner-scoped API (D-064). The planned performance phase was dropped by
the user (D-065), so this release ships v1/01–v1/05. Notes for the release:
- Production already runs the latest `main` (user, 2026-10-22); redeploy after this phase merges.
- README screenshots to refresh: quiz tabs (v1/02), leaderboard finish times (v1/03), teacher results analytics and
  student profile (v1/04), teacher's student page (v1/05).
- Production database was wiped and reseeded on 2026-10-23 for the user's manual E2E test (2 teachers, 5 students,
  `@proctra.test`); no scratch fixtures remain, so no cleanup is needed.
- Fixes from that test are already on `main` and deployed: leaderboard notes removed; kiosk lock when the app was already
  full screen (D-066). The desktop fix reaches users only through the new `.dmg`.
- Known slowness (D-065): functions run in `iad1`, the database is in Mumbai; first request after idle ~5 s.

## In scope — exact features
1. **Version bump** — `package.json` → `1.0.0` (semver: first stable release after the 0.x line; D-056).
2. **Installers** — `npm run dist` → `Proctra-1.0.0-mac-arm64.dmg` and `-mac-x64.dmg` (D-054); smoke test the installed app.
3. **README** — first screenshots (teacher results, leaderboard, student dashboard, profile; D-067), features list updated, release link.
4. **Production deploy** from `main` after merge, then GitHub Release `v1.0.0` with both installers and short release notes.

## Out of scope
- Code signing / notarization (still parked).

## Relevant docs
- `architecture.md` → packaging, hosting
- `decisions.md` → D-051, D-054

## Tasks
- [x] 06.1 — Version bump + build installers → `chore(release): bump version to 1.0.0`
- [x] 06.2 — README refresh → `docs: update README for v1.0.0`
- [x] 06.3 — Final docs pass → `docs: update docs for phase v1/06`
- [ ] After approval/merge: production deploy + `gh release create v1.0.0` (needs user go-ahead; public action)

## Done criteria
- [ ] Installed `.dmg` runs the full flow against production
- [ ] README matches the app
- [ ] Docs match what was built; decisions logged

## How to verify
1. Install the arm64 `.dmg`, sign in as teacher and student, run a quiz end to end.

## Phase summary
<!-- Filled at /phase-close. -->
- **Built:**
- **Key decisions:**
- **Known limitations:**
- **Next phase should know:**

## Next phase preview
None planned. Next release planning goes in `docs/phases/v2/`.
