# Spec: Daily Planner (Leadership Action Tracker)

Labels: `ready-for-agent`
Glossary: see `CONTEXT.md` in this folder. Use its terms (Card, Section, Status, Priority, Person, Activity, Note, Archived).

## Problem Statement

The leadership action tracker is one hand-typed text file. It has about 15 sections and about 80 items. Each item has sub-lines, a status written as text, and people names inside the text.

Adding, moving, or deleting an item by hand breaks the numbering. Nobody can see at a glance what is open, what changed today, or which items belong to one person. Review in the daily meeting is slow.

## Solution

A small web app with a Kanban board. Three columns show Status: To Do, In Progress, Done. Each item is a Card. Cards are grouped by dynamic Sections. The user adds, edits, drags, and deletes Cards with one or two clicks.

Typing `@` in a Card opens a list of People. The board can be filtered by Person, Section, Priority, and "Today". Each Card keeps a timeline of automatic changes and typed Notes, so the user can review progress without re-typing status lines.

The app is single-user, runs locally with `npm run dev`, and stores data in Supabase.

## User Stories

### Board

1. As the tracker owner, I want to see all open Cards in three columns (To Do, In Progress, Done), so that I know the state of every item at a glance.
2. As the tracker owner, I want to drag a Card from one column to another, so that I update its Status without opening it.
3. As the tracker owner, I want to drag a Card up or down inside a column, so that I control the order I review items in.
4. As the tracker owner, I want the drag order to be saved, so that the board looks the same when I reopen it.
5. As the tracker owner, I want to add a Card from the board with just a title, so that capturing an item during a meeting takes seconds.
6. As the tracker owner, I want to delete a Card with a confirm step, so that I do not lose an item by a mis-click.
7. As the tracker owner, I want Cards to show their Section name, Priority, and People tags on the board, so that I do not need to open them to know the context.
8. As the tracker owner, I want the board to load fast and look minimal, so that I use it every day without friction.

### Card detail

9. As the tracker owner, I want to open a Card and edit its title and description, so that I can refine an item after the meeting.
10. As the tracker owner, I want a tickable checklist inside a Card, so that I track sub-tasks of one item in one place.
11. As the tracker owner, I want to add, edit, reorder, and remove checklist items, so that the sub-task list stays current.
12. As the tracker owner, I want to see a count like "2/5" on the board Card, so that I know checklist progress without opening it.
13. As the tracker owner, I want to set Priority to High, Normal, or Low, so that urgent items stand out.
14. As the tracker owner, I want to change the Section of a Card from its detail view, so that I can regroup items.
15. As the tracker owner, I want one optional Link field on a Card, so that I can jump to the related email or document.
16. As the tracker owner, I want to see created and last-updated timestamps on a Card, so that I know how old an item is.

### Sections

17. As the tracker owner, I want to add a new Section from the board, so that new topics get their own group without a settings page.
18. As the tracker owner, I want to rename a Section inline, so that labels stay accurate as topics change.
19. As the tracker owner, I want to reorder Sections, so that the most important groups appear first.
20. As the tracker owner, I want to delete a Section, so that finished topics go away.
21. As the tracker owner, I want the app to ask me for a target Section when I delete a Section that still has Cards, and move them there, so that no Card is lost.
22. As the tracker owner, I want to filter the board to one Section, so that I can review one topic at a time.

### People and `@` mentions

23. As the tracker owner, I want a People settings page where I add a name and an email, so that the mention list is under my control.
24. As the tracker owner, I want to edit or remove a Person, so that the list stays correct when the team changes.
25. As the tracker owner, I want to type `@` in a Card title or description and pick a Person from a list, so that tagging is fast and spelled the same every time.
26. As the tracker owner, I want the picked Person to appear as a tag on the Card, so that ownership is visible on the board.
27. As the tracker owner, I want to remove a Person tag from a Card, so that I can reassign items.
28. As the tracker owner, I want to filter the board by one Person, so that I can prepare for a one-to-one or ping them in Google Chat.
29. As the tracker owner, I want to see a Person's email on hover of their tag, so that I can copy it to ping them.
30. As the tracker owner, I want removing a Person from settings to also remove their tag from all Cards, so that no Card points to a missing Person.

### Filters and review

31. As the tracker owner, I want a "Today" toggle that shows Cards created or updated today, so that the daily review shows only what moved.
32. As the tracker owner, I want to filter by Priority, so that I can review only High items.
33. As the tracker owner, I want to combine filters (for example Person plus Today), so that I can answer specific questions fast.
34. As the tracker owner, I want a visible "Clear filters" action, so that I return to the full board in one click.
35. As the tracker owner, I want the column headers to show a count of visible Cards, so that I see workload per Status.

### Activity timeline

36. As the tracker owner, I want each Card to record an Activity entry when its Status changes, so that I can see when work started or finished.
37. As the tracker owner, I want an Activity entry when the title, Priority, or Section changes, so that I can see how an item evolved.
38. As the tracker owner, I want an Activity entry when a checklist item is ticked or unticked, so that sub-task progress has a date.
39. As the tracker owner, I want an Activity entry when a Person is added to or removed from a Card, so that ownership changes are traceable.
40. As the tracker owner, I want to type a free-text Note into the Card timeline, so that I record what was said or agreed, like "Called Vignesh, ETA Friday".
41. As the tracker owner, I want Notes and automatic changes in one timeline, newest first, each with a timestamp, so that I read the item's story in order.
42. As the tracker owner, I want the timeline to be read-only once written, so that history is trustworthy.

### Archive

43. As the tracker owner, I want Done Cards older than 7 days to hide automatically, so that the Done column stays short.
44. As the tracker owner, I want a "Show archived" toggle, so that I can still find old Done Cards.
45. As the tracker owner, I want to move an archived Card back to To Do or In Progress, so that a reopened item is not lost.

### Setup and running

46. As the tracker owner, I want to start the app with `npm run dev` after adding two Supabase values to `.env.local`, so that setup takes minutes.
47. As the tracker owner, I want a one-time SQL script that creates the Supabase tables, so that I do not build the schema by hand.
48. As the tracker owner, I want a clear error on screen when Supabase is not reachable, so that I know it is a connection issue and not a bug.

## Implementation Decisions

### Stack

- Next.js (App Router) with React and TypeScript.
- Supabase (Postgres) as the only data store. Access through the Supabase JavaScript client.
- Supabase URL and anon key are read from `.env.local`. No login in this effort. Row-level security stays off for now. Login and RLS are a later effort before any public deployment.
- Minimal styling. One design system: plain CSS modules or Tailwind, no component library. Light theme only.
- Drag and drop with one small, well-maintained library (for example dnd-kit). No custom drag code.

### Data model

Tables and their fields (names are indicative, keep them plain):

- **sections**: id, name, position, created_at.
- **cards**: id, title, description (nullable), link (nullable), section_id (FK to sections), status (enum: `todo`, `in_progress`, `done`), priority (enum: `high`, `normal`, `low`, default `normal`), position (order inside its status column), done_at (nullable, set when status becomes `done`, cleared when it leaves `done`), created_at, updated_at.
- **checklist_items**: id, card_id (FK, cascade delete), text, is_done, position, created_at.
- **people**: id, name, email, created_at.
- **card_people**: card_id (FK, cascade delete), person_id (FK, cascade delete). Composite primary key.
- **activities**: id, card_id (FK, cascade delete), kind (enum: `change`, `note`), text, created_at. Activities are insert-only. No update or delete path in the app.

Decisions:

- Status is a fixed enum and is the board column. Sections are rows and are user-managed.
- Archived is not a stored flag. It is derived: status is `done` and done_at is older than 7 days. The board hides these by default and the "Show archived" toggle includes them.
- `updated_at` is set by a database trigger on every card update, so the Today filter cannot go stale.
- Card position is an integer per status column. On drop, the app rewrites positions of the affected column(s) in one batch.
- Section delete with Cards requires a target section id. The server moves all Cards, then deletes the Section, in one transaction (Postgres function or single RPC).
- Removing a Person deletes their `card_people` rows by cascade. The app writes an Activity of kind `change` on each affected Card before the delete.

### Activity rules

- The app writes a `change` Activity for: status change, title change, priority change, section change, checklist item ticked or unticked, person added or removed.
- The text is a short human sentence, for example "Status: To Do → In Progress" or "Ticked: Share bug status".
- A `note` Activity is the user's typed text, unchanged.
- Description edits and link edits do not create Activities (too noisy). They still update `updated_at`.

### Data access seam

- All Supabase reads and writes go through one server-side module, the **board store**. Pages and components never call Supabase directly.
- The board store exposes plain functions: list board (sections, cards, checklist counts, people tags), get card detail (card, checklist, people, activities), create/update/delete card, move card (status plus position), add/toggle/edit/delete checklist item, add/remove person tag, add note, list/create/update/delete section, delete section with move target, list/create/update/delete people.
- Every mutation that must also write an Activity does so inside the board store, so the UI cannot forget it.
- Mutations run as Next.js Server Actions that call the board store. The board revalidates after each mutation.

### `@` mention interaction

- In the title and description inputs, typing `@` opens a small dropdown of People filtered by the typed letters. Choosing one adds the Person to the Card's people tags and removes the `@text` from the input. The tag is stored in `card_people`, not as text.
- If no Person matches, the dropdown shows "No match. Add in People settings". It does not create People from typed text.

### Screens

1. **Board** (`/`): filter bar (Person, Section, Priority, Today, Show archived, Clear), three columns, Cards grouped under Section headers inside each column or shown flat with a Section badge (pick one; flat with badge is the default), "+ Card" per column, "+ Section" and section menu (rename, reorder, delete).
2. **Card detail**: a side panel or modal over the board. Title, description, link, section select, priority select, people tags with `@` input, checklist, timeline with note box.
3. **People** (`/people`): table of name and email with add, edit, remove.

## Testing Decisions

A good test checks external behavior at the highest seam and never checks internal structure. Here the highest seam is the **board store**. Tests call its functions and assert on what a later call returns.

- **Board store tests** run against a real Supabase project (a separate test project or schema) using the same SQL setup script. This proves the schema, triggers, and cascades, which are where the risk is. Each test creates its own rows and cleans them up.
- Cases to cover: create card appears in list board; move card changes status and rewrites positions; status change writes a `change` Activity; ticking a checklist item writes an Activity; adding a note appears newest-first; deleting a section with a target moves all its cards; removing a person removes their tags and leaves an Activity; a `done` card older than 7 days is excluded by default and included with the archived flag; `updated_at` changes on any card edit.
- **UI tests** are limited to two or three end-to-end flows with Playwright against the local dev server: add a card and see it on the board; drag a card to In Progress and see the Activity; type `@` and pick a person, then filter by that person.
- No unit tests for components. No mocking of Supabase. The codebase is new, so there is no prior art; these tests set the pattern.

## Out of Scope

- Importing the old `Daily_action_items.txt`. It was an example only.
- Login, auth, and row-level security. Deferred to the Vercel deployment effort.
- Vercel deployment itself.
- Multi-user or real-time collaboration.
- Due dates and reminders.
- Google Chat integration or any messaging. Email is stored and shown on hover only.
- Restoring old versions of a Card. The timeline is a log, not version history.
- Dark theme, mobile-specific layout, offline mode.
- Auto-creating People from typed `@text`.

## Further Notes

- Decisions were made in a grilling session on 2026-09-15. The glossary in `CONTEXT.md` is the source of vocabulary.
- Risk noted and accepted by the owner: with no login, anyone holding the anon key can read and write the tables. This is acceptable for local use only. Do not deploy publicly before the login effort.
- Keep the app small. Three screens, one data module, one drag library. When in doubt, leave a feature out and add a Note to the spec.
