# Daily Planner

Single-user leadership action tracker. Kanban board with Sections, Cards, People, and an Activity timeline.
See `SPEC.md` for the full spec and `CONTEXT.md` for the glossary.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the env template and fill in the two Supabase values:
   ```
   copy .env.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Open the Supabase SQL editor. Run the contents of `supabase/schema.sql` once.
4. Start the app:
   ```
   npm run dev
   ```
   Open http://localhost:3000.

Without `.env.local` the board page shows "Supabase not configured. Add .env.local".

## Commands

- `npm run dev` — development server.
- `npm run build` — production build.
- `npm run typecheck` — TypeScript check.
- `npm test` — board store tests. They skip when no Supabase env is set.
