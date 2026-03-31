# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Puck** is a full-stack workout and fitness tracking app for athletes and coaches. Built with Next.js 14 (App Router) + Supabase (PostgreSQL).

**Key features:**
- Dual-role system: athletes log workouts, coaches create/assign programs
- Strength training with set/rep/weight/RPE logging and automatic 1-rep max calculation
- Running tracking with pace calculation
- Coach-athlete relationships with program assignment
- Progress analytics with charts (Recharts)
- Personal records auto-tracking

## Tech Stack

- **Framework**: Next.js 14.2 (App Router, React 18, TypeScript 5)
- **Backend/DB**: Supabase (PostgreSQL, RLS, Auth)
- **Auth**: @supabase/ssr with cookie-based sessions
- **Forms**: react-hook-form + Zod
- **UI**: Tailwind CSS, lucide-react, class-variance-authority
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library + jsdom

## Development Commands

```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run lint          # ESLint
npm run test          # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Directory Structure

```
app/
  (auth)/             # Login, signup pages
  (app)/              # Protected routes (layout with sidebar/bottom-nav)
    dashboard/        # Home stats
    workout/          # Workout session logging
    programs/         # Program management (coaches create, athletes view)
    runs/             # Running logs
    progress/         # Charts and PR tracking
    athletes/         # Coach view of their athletes
  api/auth/callback/  # Supabase OAuth callback
components/
  ui/                 # Primitives: button, card, input, dialog, select, etc.
  auth/               # Login/signup forms
  layout/             # Sidebar + bottom nav
  programs/           # Program builder, session editor, exercise editor
  workout/            # Set logger components
  runs/               # Run card
  progress/           # Strength/run charts, PR list
lib/
  supabase/
    server.ts         # Server-side client (uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY)
    client.ts         # Browser client
  types/database.ts   # TypeScript types for all DB entities
  utils/
    one-rep-max.ts    # Brzycki formula: weight * (36 / (37 - reps))
    pace.ts           # Pace/duration formatting utilities
    cn.ts             # clsx + tailwind-merge helper
supabase/
  migrations/001_initial.sql  # Full schema with RLS policies
middleware.ts         # Auth guard: redirects unauthenticated to /login
__tests__/            # Vitest tests for utils and components
```

## Database Schema (key tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (role: coach\|athlete), auto-created on signup via trigger |
| `coach_athletes` | Coach-athlete relationships |
| `programs` | Workout programs created by coaches |
| `program_assignments` | Coach assigns program to athlete (status: active\|paused\|completed) |
| `sessions` | Workout sessions within a program |
| `session_exercises` | Exercises in a session (sets, reps, target weight, RPE) |
| `workout_logs` | Completed workout sessions |
| `exercise_logs` | Individual sets logged (weight, reps, RPE, is_pr flag) |
| `runs` | Running sessions (distance_km, duration_seconds) |
| `personal_records` | Strength PRs with 1-rep max |

All tables have **Row Level Security (RLS)** enabled. Users access only their own data; coaches can view their athletes' data.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

Note: The codebase uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (not the older `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Key Patterns

- **Server components** use `createClient()` from `lib/supabase/server`
- **Client components** use `"use client"` + `createClient()` from `lib/supabase/client`
- Data fetching is direct Supabase queries (`.select()`, `.eq()`, etc.)
- Auth middleware at `middleware.ts` protects all routes except `/login`, `/signup`, `/api`
- Forms use react-hook-form + Zod resolver pattern
