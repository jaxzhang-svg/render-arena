# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Novita Arena is a Next.js 16 web application where LLM models compete to generate HTML/visual outputs. Users select two models, choose a category (Physics, Visual Magic, Game Jam, General), and watch them generate code simultaneously with side-by-side comparison.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint (next.js + TypeScript)
npm run knip         # Check unused dependencies/exports
```

No test runner is configured.

## Architecture

### Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui patterns + Base UI React
- **Streaming:** Vercel AI SDK (`streamObject()`)
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Novita OAuth → Supabase session bridge

### Directory Structure

```
/app
  /api              # API routes (auth, apps, media)
  /gallery          # Gallery page
  /playground       # Playground/Arena page

/components
  /app              # Page-level components
  /base             # Reusable components (button, textarea, model-selector)
  /ui               # UI utilities
  /playground       # Arena-specific components

/hooks              # useAuth, useModelGeneration, useArenaPlayground, useScreenRecorder
/lib                # Config, utilities, Supabase clients
/types              # TypeScript interfaces
```

### Data Flow

```
User Input → useModelGeneration → POST /api/apps/[id]/generate (streaming)
→ Model API via Novita → HTML Response → StreamingCodeDisplay → Supabase → Gallery
```

### Key API Routes

- `POST /api/apps` - Create app
- `POST /api/apps/[id]/generate` - Trigger model generation (streaming)
- `POST /api/apps/[id]/publish` - Publish to gallery
- `GET /api/auth/me` - Current user

## Code Conventions

### Imports

Use `@/` path alias for all internal imports:

```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### Base UI Triggers (CRITICAL)

Never nest `<button>` inside Base UI triggers. Use `render` prop:

```tsx
// ✓ Correct
<Popover.Trigger render={<button>Click me</button>} />

// ✗ Wrong - causes hydration errors
<Popover.Trigger>
  <button>Click me</button>
</Popover.Trigger>
```

### API Route Pattern

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json()
    return Response.json({ data })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
export const maxDuration = 60
```

## Environment Variables

Required in `.env.local`:

```bash
NOVITA_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_SUPABASE_SERVICE_ROLE_KEY=
NEXT_ENCRYPTION_MASTER_KEY=  # 32-char hex for pgcrypto
```

## Models Configuration

Models are defined in `/lib/config.ts`. Default models:

- Model A: `pa/grok-code-fast-1`
- Model B: `pa/gemini-3-flash-preview`

Categories: Physics, Visual Magic, Game Jam, General

## State Management

No Redux/Zustand. Uses React hooks:

- `useAuth()` - Authentication
- `useModelGeneration()` - Streaming generation
- `useArenaPlayground()` - Arena state

## Supabase Clients

- `/lib/supabase/client.ts` - Browser client
- `/lib/supabase/server.ts` - Server client with auth (for API routes)
- `/lib/supabase/admin.ts` - Admin client with service role (bypasses RLS)
