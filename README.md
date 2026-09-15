# Daily Planner

Single-user leadership action tracker. Kanban board with Sections, Cards, People, and an Activity timeline.
See `SPEC.md` for the full spec and `CONTEXT.md` for the glossary.

## Command Board

The board at `/` is one screen with three parts:

- **Rail** (left, 56px): board home, People link, navigator toggle, dark-mode toggle.
- **Navigator** (240px): Views (All cards, Today, High priority), Sections with a rename/reorder/delete menu, People, and the "Show archived" switch.
- **Header and view**: breadcrumb, search, Board/List switch, Clear filters, and a quick-add box. Board view shows three status columns. List view shows dense rows grouped by status. Drag works in both. Click a card to open its dialog.

Filters live in the URL query string, so a filtered board can be bookmarked.

### Keyboard shortcuts

- `/` — focus search.
- `Escape` in search — clear the search text.
- `[` — show or hide the navigator.
- `Escape` in the card dialog — close the dialog.

### Dark mode

The rail toggle switches the theme and saves the choice in `localStorage`. A first visit follows the operating system setting. A small script in `layout.tsx` applies the theme before paint, so there is no flash.

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
