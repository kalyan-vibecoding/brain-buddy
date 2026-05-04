# BrainBuddy Kids

## Overview

A responsive educational web app for children ages 4–8 with 8 interactive brain activities, star/badge rewards, adaptive difficulty based on child age, a progress tracker, child profile, and a parent dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + framer-motion
- **Routing**: wouter
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT (stored in localStorage), `Authorization: Bearer` header
- **Build**: esbuild (CJS bundle)

## Architecture

```
artifacts/
  api-server/               Express 5 API (served at /api)
    src/
      app.ts                Express app setup
      index.ts              Server entry point
      lib/
        jwt.ts              JWT sign/verify helpers
        logger.ts           Pino logger singleton
      middleware/
        auth.ts             JWT auth middleware
      routes/
        index.ts            Route registration
        auth.ts             /api/auth (login, register, me)
        children.ts         /api/children (CRUD)
        completions.ts      /api/children/:id/completions (POST)
        badges.ts           /api/children/:id/badges (GET)
        dashboard.ts        /api/children/:id/dashboard (GET)
        health.ts           /api/healthz

  brain-buddy-kids/         React + Vite frontend (served at /)
    src/
      App.tsx               Router, QueryClient, ChildContext setup
      main.tsx              Entry point
      index.css             Global styles + Tailwind + theme vars
      components/
        game-utils.tsx      Core game engine:
                              useGameState hook (8-round flow, adaptive difficulty,
                              sounds, session completion, JWT-aware API call)
                              useShuffledQueue hook (no-repeat question queues)
                              shuffleArray utility
                              MAX_ROUNDS constant (= 8)
                              SessionComplete component (confetti + stars + auto-redirect)
                              GameHeader component (back button + progress dots)
                              RoundProgress component (progress bar)
                              FeedbackOverlay component (correct/wrong animation)
        auth-wrapper.tsx    Auth guard HOC
        ui/                 shadcn/ui primitives (button, card, dialog, etc.)
      lib/
        auth-token.ts       JWT storage (localStorage) + getter
        child-context.tsx   Active child ID context + localStorage persistence
        sounds.ts           Web Audio API sound effects:
                              playCorrect() — ascending C-E-G chime
                              playCow()    — synthesized moo for wrong answers
                              playCelebration() — C-major fanfare for session end
        utils.ts            Tailwind cn() helper
      hooks/
        use-mobile.tsx
        use-toast.ts
      pages/
        home.tsx            Landing page — "Let's Play!" auto-demo login
        login.tsx           Parent login
        register.tsx        Parent registration
        select-child.tsx    Choose child profile
        create-child.tsx    Create new child (name + age + avatar)
        celebration.tsx     Ad-hoc celebration screen
        not-found.tsx       404 page
        progress.tsx        Progress tracker (activity history + stats)
        child-profile.tsx   Child profile view + edit + stats
        parent-dashboard.tsx  Parent dashboard (completions, badges, charts)
        activities/
          index.tsx         Activity list grid (8 activities + quick links)
          brain-teaser.tsx  Quick brain teaser (10-question pool, shuffled 8/session)
          match-shape.tsx   Shape matching (8 unique shapes, no-repeat)
          odd-one-out.tsx   Odd one out (6 categories, 8 pre-defined rounds)
          count-objects.tsx Count objects 1–10 (8 unique emoji/count combos/session)
          pattern-builder.tsx  Pattern completion (10-pattern pool, shuffled)
          letter-sound.tsx  Letter-to-emoji match (A–J, 8 unique letters/session)
          memory-cards.tsx  Flip-card pair matching (8 rounds)
          reading-words.tsx Age-adaptive reading:
                              easy  (age ≤4) — 2-3 letter words
                              medium (age 5) — 3-4 letter words
                              hard  (age 6+) — short stories with comprehension Q

lib/
  api-spec/
    openapi.yaml            OpenAPI 3.1 spec — single source of truth for all routes
    orval.config.ts         Codegen config (outputs to api-client-react + api-zod)

  api-client-react/         Generated React Query hooks + Zod schemas (client)
    src/
      generated/
        api.ts              React Query hooks (useGetChild, useCreateCompletion, etc.)
        api.schemas.ts      Zod schemas for request/response types
      custom-fetch.ts       Fetch wrapper — injects Authorization: Bearer token
      index.ts              Barrel exports

  api-zod/                  Generated Zod schemas for server-side validation
    src/
      generated/api.ts      Zod schemas used by Express route handlers

  db/                       Drizzle ORM schema + DB client
    src/
      schema/
        parents.ts          parents table
        children.ts         children table
        completions.ts      activity_completions table
        badges.ts           badges table
        sessions.ts         user_sessions table (connect-pg-simple)
        index.ts            Re-exports all schemas
      index.ts              DB client (drizzle + pg Pool)
    drizzle.config.ts       Drizzle Kit config
```

## Database Tables

- `parents` — Parent accounts (email/password, bcrypt hashed)
- `children` — Child profiles (name, age, avatar emoji, linked to parent)
- `activity_completions` — Each activity play result (type, stars, difficulty, duration)
- `badges` — Earned badges (first_five, explorer, champion, master, legend)
- `user_sessions` — PostgreSQL session store (connect-pg-simple)

## Game Flow

Each activity session:
1. At mount, `useShuffledQueue` creates a stable shuffled copy of the question pool
2. `roundCount` (0–7) indexes into the shuffled queue — no repeats within a session
3. Questions advance automatically after 1 s of feedback (correct or wrong)
4. After 8 rounds, `SessionComplete` screen shows with stars + confetti + fanfare
5. Auto-redirects to `/activities` after 2.8 s

## Sounds (Web Audio API — no external files)

| Event            | Sound              |
|------------------|--------------------|
| Correct answer   | Ascending C–E–G chime |
| Wrong answer     | Synthesized cow moo |
| Session complete | C-major chord fanfare |

## Adaptive Difficulty

- Age ≤4 → starts **easy**; age 5 → **medium**; age 6+ → **hard**
- 3 correct in a row → step up difficulty
- 2 wrong in a row → step down difficulty

## Star Scoring (per session, 8 questions)

| Correct | Stars |
|---------|-------|
| 7–8     | ⭐⭐⭐ |
| 5–6     | ⭐⭐   |
| 1–4     | ⭐    |

## Badges

Awarded automatically on each completion save:

| Milestone | Badge ID      |
|-----------|---------------|
| 5 plays   | `first_five`  |
| 10 plays  | `explorer`    |
| 25 plays  | `champion`    |
| 50 plays  | `master`      |
| 100 plays | `legend`      |

## Auth Flow

- Parents register/login → receive JWT in response body
- JWT stored in `localStorage` via `lib/auth-token.ts`
- All API requests send `Authorization: Bearer <token>` via `custom-fetch.ts`
- Demo mode: "Let's Play!" auto-registers `demo@brainbuddy.kids`, creates a demo child (Explorer, age 6), sets `activeChildId` in localStorage

## Key Commands

```bash
pnpm run typecheck                              # full typecheck (libs + artifacts)
pnpm run build                                  # typecheck + build all packages
pnpm --filter @workspace/api-spec run codegen   # regenerate API hooks + Zod schemas
pnpm --filter @workspace/db run push            # push DB schema changes (dev only)
```

## Content Safety

- No ads, no external links, no chat, no user-generated content
- Minimal child data: only name, age, and avatar emoji
