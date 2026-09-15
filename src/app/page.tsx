import Board from "@/components/Board";
import { getSupabase } from "@/lib/supabase";
import { listBoard, listPeople } from "@/lib/store";
import type { BoardCard, Priority } from "@/lib/types";

export const dynamic = "force-dynamic";

function isToday(value: string | null) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function filterCards(
  cards: BoardCard[],
  filters: { person?: string; section?: string; priority?: string; today: boolean },
) {
  return cards.filter((card) => {
    if (filters.section && card.section_id !== filters.section) return false;
    if (filters.priority && card.priority !== (filters.priority as Priority)) return false;
    if (filters.person && !card.people.some((p) => p.id === filters.person)) return false;
    if (filters.today && !isToday(card.created_at) && !isToday(card.updated_at)) return false;
    return true;
  });
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  if (!getSupabase()) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-semibold">Daily Planner</h1>
        <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Supabase not configured. Add .env.local
        </p>
      </main>
    );
  }

  const one = (key: string) => {
    const value = searchParams?.[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const board = await listBoard({ includeArchived: one("archived") === "1" });
  const people = await listPeople();

  const cards = filterCards(board.cards, {
    person: one("person"),
    section: one("section"),
    priority: one("priority"),
    today: one("today") === "1",
  });

  return <Board sections={board.sections} cards={cards} people={people} />;
}
