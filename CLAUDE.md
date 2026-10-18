# Proctra

Electron + Next.js desktop app for timed MCQ exams with kiosk-style exam window and periodic camera
snapshots — a university capstone for students and teachers (macOS). Details live in docs/prd.md.

## Profile
**profile: lean**
<!-- lean = no tests, Docker, CI or devops files committed; scratch tests only in .scratch/ (gitignored). Rules: ~/.claude/CLAUDE.md -->

## Stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui (DevClub UI + GSAP only in phase 07)
- Backend: Next.js route handlers under `/api/v1` → services → Mongoose models; Zod validation
- Database: MongoDB Atlas + Mongoose
- Auth: Auth.js (NextAuth v5) Credentials, JWT cookie, bcryptjs
- Desktop: Electron (thin shell loading `PROCTRA_APP_URL`), electron-builder → unsigned universal `.dmg`
- Other: Cloudinary (private snapshots), Vercel hosting
- Package manager: npm

## Commands
```bash
npm install          # install deps
npm run dev          # Next.js dev server (http://localhost:3000)
npm run electron     # compile electron/ and open the shell (run with dev server up)
npm run build        # production build
npm run lint         # lint + typecheck
npm run seed         # create/update teacher account from SEED_TEACHER_* env
npm run dist         # build macOS .dmg (phase 07)
```
(Scripts are created in the phase that introduces them; update here if names change.)

## Codebase layout
```
proctra/
├── electron/      # main.ts, preload.ts — desktop only, no secrets, no src/ imports
├── src/
│   ├── app/       # pages (auth, student, teacher, exam) + api/v1 route handlers
│   ├── components/# ui/ (shadcn) + feature components
│   ├── lib/       # db, auth, env, cloudinary, api-response
│   ├── models/    # Mongoose models
│   ├── schemas/   # Zod schemas
│   ├── services/  # business logic (only layer that touches models)
│   └── types/
├── scripts/       # seed-teachers.ts
└── docs/
```

## Docs
Index: `docs/README.md`. Read `docs/progress.md` and the current phase file at session start;
read other docs only when the task touches them. `idea.md` is the original course brief (reference only).

Current status:
@docs/progress.md

## Project-specific rules
- Route handlers stay thin: `requireUser(role)` → Zod parse → one service call → `withHandler` response. No Mongoose in handlers.
- The renderer is untrusted: never accept role, score, deadline, status or submittedAt from the client.
- Never send `correctIndex` to students before results are released.
- All env reads go through `src/lib/env.ts`. When adding an env var: add it to `.env.example` and to `.env` with a placeholder, then tell the user which real value to fill in.
- Electron: keep `contextIsolation`/`sandbox` on, `nodeIntegration` off; new desktop capabilities = one narrow, validated preload function.
- Proctoring wording is always neutral — never label events or missing snapshots as cheating.
