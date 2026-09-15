import { requireSupabase } from "@/lib/supabase";
import type { Board, BoardCard, Card, Person, Section } from "@/lib/types";

const ARCHIVE_DAYS = 7;

/** Sections plus cards with checklist counts and people tags. */
export async function listBoard(options: { includeArchived?: boolean } = {}): Promise<Board> {
  const db = requireSupabase();

  const sectionsResult = await db.from("sections").select("*").order("position");
  if (sectionsResult.error) throw new Error(sectionsResult.error.message);
  const sections = (sectionsResult.data ?? []) as Section[];

  const cardsResult = await db
    .from("cards")
    .select("*")
    .order("status")
    .order("position");
  if (cardsResult.error) throw new Error(cardsResult.error.message);
  let cards = (cardsResult.data ?? []) as Card[];

  if (!options.includeArchived) {
    const cutoff = Date.now() - ARCHIVE_DAYS * 24 * 60 * 60 * 1000;
    cards = cards.filter(
      (c) => !(c.status === "done" && c.done_at && new Date(c.done_at).getTime() < cutoff),
    );
  }

  const cardIds = cards.map((c) => c.id);
  const checklistDone = new Map<string, number>();
  const checklistTotal = new Map<string, number>();
  const peopleByCard = new Map<string, Person[]>();

  if (cardIds.length > 0) {
    const [items, links] = await Promise.all([
      db.from("checklist_items").select("card_id, is_done").in("card_id", cardIds),
      db.from("card_people").select("card_id, people(*)").in("card_id", cardIds),
    ]);
    if (items.error) throw new Error(items.error.message);
    if (links.error) throw new Error(links.error.message);

    for (const item of (items.data ?? []) as Array<{ card_id: string; is_done: boolean }>) {
      checklistTotal.set(item.card_id, (checklistTotal.get(item.card_id) ?? 0) + 1);
      if (item.is_done) checklistDone.set(item.card_id, (checklistDone.get(item.card_id) ?? 0) + 1);
    }
    const linkRows = (links.data ?? []) as unknown as Array<{ card_id: string; people: Person | null }>;
    for (const link of linkRows) {
      if (!link.people) continue;
      const list = peopleByCard.get(link.card_id) ?? [];
      list.push(link.people);
      peopleByCard.set(link.card_id, list);
    }
  }

  const sectionName = new Map(sections.map((s) => [s.id, s.name]));
  const boardCards: BoardCard[] = cards.map((c) => ({
    ...c,
    section_name: sectionName.get(c.section_id) ?? "",
    checklist_done: checklistDone.get(c.id) ?? 0,
    checklist_total: checklistTotal.get(c.id) ?? 0,
    people: peopleByCard.get(c.id) ?? [],
  }));

  return { sections, cards: boardCards };
}
