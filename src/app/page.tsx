import Board from "@/components/Board";
import ConnectionError from "@/components/ConnectionError";
import { getSupabase } from "@/lib/supabase";
import { listBoard, listPeople } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
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

  let board;
  let people;
  try {
    [board, people] = await Promise.all([listBoard({ includeArchived: true }), listPeople()]);
  } catch (e) {
    return <ConnectionError message={(e as Error).message} href="/" />;
  }

  const cardCounts: Record<string, number> = {};
  for (const card of board.cards) {
    cardCounts[card.section_id] = (cardCounts[card.section_id] ?? 0) + 1;
  }

  return (
    <Board sections={board.sections} cards={board.cards} people={people} cardCounts={cardCounts} />
  );
}
