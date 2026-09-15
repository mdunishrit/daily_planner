# Daily Planner — Domain Glossary

Single-user leadership action tracker. Replaces a hand-typed text file.

## Terms

- **Card** — one action item. Has a title, an optional description, a checklist, one Section, one Status, one Priority, zero or more People, created and updated timestamps.
- **Section** — a user-managed grouping label (e.g. "High Priority", "QA Automation"). Sections are dynamic: the user can add, rename, reorder, and remove them. A Card belongs to exactly one Section.
- **Status** — where a Card sits on the board. Fixed set: To Do, In Progress, Done. Status is the board column.
- **Priority** — High / Normal / Low. Used for filtering and visual emphasis. Manual drag order within a column is separate from Priority.
- **Checklist item** — a sub-task line inside a Card that can be ticked. Not a Card itself.
- **Person** — a named teammate with an email. Managed in a fixed list. A Card mentions a Person by typing `@Name`; the board can be filtered by Person.
- **Link** — one optional URL on a Card (e.g. an email or document).
- **Activity** — a timestamped entry in a Card's timeline. Two kinds: an automatic **Change** (status moved, title edited, checklist item ticked) and a user-typed **Note** ("Called Vignesh, ETA Friday"). Read-only once written. No restore of old versions.
- **Today filter** — shows Cards created or updated today.
- **Archived** — a Done Card older than 7 days. Hidden by default; a toggle shows it.

## Ruled out

- Multi-user / shared editing (single user only).
- Importing the old text file (it was only an example).
- Auto-collecting people from typed text (people come from the managed list).
- Due dates on Cards.
- Login (deferred to the Vercel deployment effort; local run only for now).
- Google Chat integration (email is stored and shown; pinging is manual).
