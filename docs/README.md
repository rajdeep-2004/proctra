# Docs Index

The `docs/` folder is the source of truth for this project. Code follows docs; when they diverge,
the doc is updated in the same commit and the reason is logged in `decisions.md`.

| File | Answers | Update when |
|---|---|---|
| [prd.md](prd.md) | What are we building, for whom, and what's out of scope? | Scope changes (needs approval) |
| [architecture.md](architecture.md) | What are the parts and where does code live? | Components, stack, or folder layout change |
| [system-design.md](system-design.md) | How does it behave at runtime, under load, and when things fail? | Flows, concurrency, caching, or failure handling change |
| [database-schema.md](database-schema.md) | What data do we store and how is it queried? | Before any schema change |
| [api-contracts.md](api-contracts.md) | What do endpoints accept and return? | Before any API change |
| [decisions.md](decisions.md) | Why is it built this way? | Every non-trivial choice, as it's made |
| [progress.md](progress.md) | Where are we right now? | Every session and phase transition |
| [phases/](phases/) | What exactly gets built in each phase? | Phase start, task completion, phase close |

## Architecture vs system design
- **architecture.md** is the map: components, boundaries, stack, folder structure. Mostly static.
- **system-design.md** is the movie: what happens when a request arrives, two users race for the
  same resource, a service goes down, or traffic spikes.

## Phase files
`phases/phase-NN-<slug>.md`, created from `phases/_phase-template.md`. Numbers are two digits.
Each phase leaves the app working and demoable.
