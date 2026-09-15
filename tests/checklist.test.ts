import { afterAll, describe, expect, it } from "vitest";
import { requireSupabase } from "@/lib/supabase";
import {
  addChecklistItem,
  createCard,
  deleteChecklistItem,
  getCardDetail,
  listBoard,
  reorderChecklist,
  toggleChecklistItem,
  updateChecklistItem,
} from "@/lib/store";

const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

describe.skipIf(!hasEnv)("checklist store", () => {
  const cardIds: string[] = [];
  const sectionIds: string[] = [];

  async function newCard(name: string) {
    const db = requireSupabase();
    const { data, error } = await db.from("sections").insert({ name }).select("*").single();
    if (error) throw new Error(error.message);
    sectionIds.push(data.id);
    const card = await createCard({ title: name, sectionId: data.id });
    cardIds.push(card.id);
    return card;
  }

  afterAll(async () => {
    const db = requireSupabase();
    if (cardIds.length) await db.from("cards").delete().in("id", cardIds);
    if (sectionIds.length) await db.from("sections").delete().in("id", sectionIds);
  });

  it("adds items in order and counts them on the board", async () => {
    const card = await newCard("Checklist Add");
    await addChecklistItem(card.id, "First");
    await addChecklistItem(card.id, "Second");

    const detail = await getCardDetail(card.id);
    expect(detail?.checklist.map((i) => i.text)).toEqual(["First", "Second"]);

    const board = await listBoard();
    const found = board.cards.find((c) => c.id === card.id);
    expect(found?.checklist_total).toBe(2);
    expect(found?.checklist_done).toBe(0);
  });

  it("writes a change Activity when an item is ticked and unticked", async () => {
    const card = await newCard("Checklist Tick");
    const item = await addChecklistItem(card.id, "Share bug status");

    const ticked = await toggleChecklistItem(item.id);
    expect(ticked.is_done).toBe(true);
    const unticked = await toggleChecklistItem(item.id);
    expect(unticked.is_done).toBe(false);

    const detail = await getCardDetail(card.id);
    const texts = (detail?.activities ?? []).map((a) => a.text);
    expect(texts).toContain("Ticked: Share bug status");
    expect(texts).toContain("Unticked: Share bug status");
  });

  it("edits, reorders, and deletes items", async () => {
    const card = await newCard("Checklist Edit");
    const one = await addChecklistItem(card.id, "One");
    const two = await addChecklistItem(card.id, "Two");

    const renamed = await updateChecklistItem(one.id, "One updated");
    expect(renamed.text).toBe("One updated");

    await reorderChecklist(card.id, [two.id, one.id]);
    const afterMove = await getCardDetail(card.id);
    expect(afterMove?.checklist.map((i) => i.text)).toEqual(["Two", "One updated"]);

    await deleteChecklistItem(two.id);
    const afterDelete = await getCardDetail(card.id);
    expect(afterDelete?.checklist.map((i) => i.text)).toEqual(["One updated"]);
  });
});
