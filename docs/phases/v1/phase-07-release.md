# Phase v1/07 — Release v1.0.0

| | |
|---|---|
| Status | not-started |
| Branch | `phase/v1-07-release` |
| Depends on | Phase v1/06 |
| Issues | — (ships everything above) |

## Goal
v1.0.0 is live: production deployed, per-chip `.dmg` installers on a GitHub Release, README up to date.

## Previous phase summary
<!-- Filled at /phase-start. -->

## In scope — exact features
1. **Version bump** — `package.json` → `1.0.0` (semver: first stable release after the 0.x line; D-056).
2. **Installers** — `npm run dist` → `Proctra-1.0.0-mac-arm64.dmg` and `-mac-x64.dmg` (D-054); smoke test the installed app.
3. **README** — new screenshots (tabs, analytics, leaderboard), features list updated, release link.
4. **Production deploy** from `main` after merge, then GitHub Release `v1.0.0` with both installers and short release notes.

## Out of scope
- Code signing / notarization (still parked).

## Relevant docs
- `architecture.md` → packaging, hosting
- `decisions.md` → D-051, D-054

## Tasks
- [ ] 07.1 — Version bump + build installers → `chore(release): bump version to 1.0.0`
- [ ] 07.2 — README refresh → `docs: update README for v1.0.0`
- [ ] 07.3 — Final docs pass → `docs: update docs for phase v1/07`
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
