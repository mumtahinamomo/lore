# Lore

> *Every list you finish is a day you lived. Lore keeps both.*

Lore is a thousand year old word. It means the knowledge you pick up from living. The understanding you have at forty that you could not have explained at twenty. The things you only know because you were paying attention at the right moment.

GGen Z brought “lore” back in our daily vocabulary. The lore of something is its real story which includes the layers, the history, the context that makes everything make sense. Gen Z made it trendy again, but it was always relevant.

Most of us are not paying attention. We finish the list, close the laptop, and the day is just gone. We read something that we really love at that moment and shifts something in us but three months later we cannot even remember the title. We have ideas we want to keep, but they often end up scattered across notebooks and various apps, and sometimes get lost.

That is the gap lore is trying to fill.

---

The next generation of software is not going to be generic. It is going to be yours.

For decades, productivity tools were built around the assumption that everyone works the same way. Same templates. Same workflows. Same dashboards. That era is ending. The most valuable software of the next ten years will not be the most powerful, it will be the most personal.

Lore is a bet on that future.

Right now, the average person juggles five separate apps to manage their day like- a to-do app, a reading tracker, a notes tool, a bookmarks folder they never open, and a journal they meant to keep up with. None of them are connected to each other. None of them build into anything. The data sits in silos and the person gets lost between them.

Lore collapses that stack into one space. Your tasks, your reading, your reflections, your saved ideas all are together here, because that is how a real life works.

And beyond organization, Lore holds you accountable to the things that matter to you. The book you have been meaning to finish. The habit you keep almost starting. The time you keep meaning to use better. Lore does not just track what you did, it reminds you of what you said you wanted to do.

Built for people who take their inner life as seriously as their output.

---

## Product Overview

Most productivity apps treat the user as a machine to be optimized. Lore treats the user as a person with a life worth remembering. The core product decision is that tasks, reading, and reflection live together because that is how life actually works.

### Core Modules

**Tasks**
Date scoped to-do lists with full CRUD, completion tracking, and a daily progress indicator. Tasks are tied to a specific date and navigable with a calendar view.

**Reading Tracker**
Log reading sessions by book or article. Record pages read or time spent. The tracker surfaces weekly streaks, session history, and trend data over time.

**Daily Notes**
A per day journaling layer. Users can write  reflections and attach images like book passages, screenshots, anything worth saving. Notes are date indexed and navigable by date.

**Saved Items**
A personal content library for links, quotes, and snippets. Supports tagging and filtering. Designed to replace the browser bookmarks graveyard.

**Stats**
Weekly and monthly analytics across all modules. Task completion rates, reading consistency, active days, and week over week comparisons.

---

## Tech Stack

### Frontend
- TanStack Start v1
- React 19
- Vite 7
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Playfair Display + DM Sans

### Backend
- Supabase — PostgreSQL, Auth, Storage
- Cloudflare Workers
- Wrangler

### Dev Tooling
- TypeScript
- Bun
- ESLint
- Playwright

---

## Getting Started


### Environment Variables

Create a `.env` file in the root of the project:

```
VITE_SUPABASE_URL=<your-backend-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

These values are auto-configured when running through Lovable. If running locally, find them in your Lovable Cloud settings. No local database setup needed — the app connects to the Lovable Cloud backend remotely.

### Running Locally

```bash
# Clone the repo
git clone https://github.com/mumtahinamomo/prod-check-in
cd lore

# Install dependencies
bun install

# Start dev server
bun dev

# Type check
bun run typecheck

# Run tests
bunx playwright test

# Build for production
bun run build

# Deploy to Cloudflare Workers
bunx wrangler deploy
```

---

## Project Structure

```
/
├── .env                          # Auto-generated environment variables (Supabase URL, keys)
├── .gitignore
├── bun.lockb                     # Bun package manager lockfile
├── bunfig.toml                   # Bun configuration
├── components.json               # shadcn/ui component config
├── eslint.config.js
├── playwright.config.ts          # E2E test config
├── playwright-fixture.ts
├── tsconfig.json
├── vite.config.ts                # Vite build config
├── wrangler.jsonc                # Cloudflare Workers deployment config
│
├── public/
│   └── placeholder.svg
│
├── src/
│   ├── router.tsx                # TanStack Router setup
│   ├── routeTree.gen.ts          # Auto-generated route tree (do not edit)
│   ├── styles.css                # Global styles + Tailwind + CSS variables (Dusty Rose theme)
│   │
│   ├── routes/
│   │   ├── __root.tsx            # Root layout (html/head/body shell, SEO meta)
│   │   └── index.tsx             # Main app route — auth gate, view switcher
│   │
│   ├── components/
│   │   ├── AuthPage.tsx          # Login / signup form
│   │   ├── BottomNav.tsx         # Tab navigation bar
│   │   ├── DashboardView.tsx     # Home dashboard with greeting + stats
│   │   ├── TodoView.tsx          # Daily to-do tracker with calendar
│   │   ├── ReadingView.tsx       # Reading log tracker
│   │   ├── NotesView.tsx         # Daily notes with image uploads
│   │   ├── SavedItemsView.tsx    # Bookmarked links & snippets
│   │   ├── MonthlyProgressView.tsx # Monthly stats + weekly summary
│   │   ├── WeeklySummary.tsx     # Week-over-week analytics cards
│   │   └── ui/                   # ~40 shadcn/ui primitives (button, card, dialog, etc.)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts            # Authentication hook (sign in/up/out)
│   │   └── use-mobile.tsx        # Mobile breakpoint detection
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts             # Browser Supabase client (auto-generated)
│   │   ├── client.server.ts      # Server-side Supabase client
│   │   ├── auth-middleware.ts    # Auth middleware
│   │   └── types.ts              # Database types (auto-generated)
│   │
│   └── lib/
│       ├── store.ts              # Data hooks: useTasks, useReadingLog, useNotes, useSavedItems
│       └── utils.ts              # Utility functions (cn helper)
│
└── supabase/
    ├── config.toml               # Supabase project config
    └── migrations/               # SQL migrations (tables, RLS policies)
```

---

## Architecture Notes

**Single-page app** — everything runs through `src/routes/index.tsx`, which switches between six views via state with no sub-routes.

**Data layer** — all CRUD logic lives in `src/lib/store.ts` as custom hooks that sync directly with Supabase. No external state library.

**Styling** — Tailwind CSS v4 with CSS custom properties defined in `src/styles.css` 

**Database** — PostgreSQL via Supabase with Row-Level Security on all tables, scoped to `auth.uid()`. Schema covers tasks, reading entries, daily notes, note images, and saved items.

**Auth** — email/password with session persistence via Supabase Auth. An auth middleware at the route level gates all app views.

---

Built with [Lovable](https://lovable.dev).
