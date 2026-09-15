import type { BoardCard } from "@/lib/types";
import type { BoardFilters } from "./types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function isSameLocalDay(iso: string, now: Date) {
  const date = new Date(iso);
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/** A card created or updated on the given local day. */
export function isToday(card: BoardCard, now: Date = new Date()) {
  return isSameLocalDay(card.created_at, now) || isSameLocalDay(card.updated_at, now);
}

/** A Done card whose done_at is older than 7 days. */
export function isArchived(card: BoardCard, now: Date = new Date()) {
  if (card.status !== "done" || !card.done_at) return false;
  return now.getTime() - new Date(card.done_at).getTime() > WEEK_MS;
}

/** Applies the board filters to the card list. Pure; `now` is injectable for tests. */
export function filterCards(
  cards: BoardCard[],
  filters: BoardFilters,
  now: Date = new Date(),
): BoardCard[] {
  const query = filters.q.trim().toLowerCase();
  return cards.filter((card) => {
    if (!filters.archived && isArchived(card, now)) return false;
    if (filters.section && card.section_id !== filters.section) return false;
    if (filters.priority && card.priority !== filters.priority) return false;
    if (filters.person && !card.people.some((person) => person.id === filters.person)) return false;
    if (filters.today && !isSameLocalDay(card.created_at, now) && !isSameLocalDay(card.updated_at, now)) {
      return false;
    }
    if (!query) return true;
    return (
      card.title.toLowerCase().includes(query) ||
      card.people.some((person) => person.name.toLowerCase().includes(query))
    );
  });
}
