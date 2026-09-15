import { afterAll, describe, expect, it } from "vitest";
import { requireSupabase } from "@/lib/supabase";
import { createCard, getCardDetail, listBoard, moveCard } from "@/lib/store";

const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

describe.skipIf(!hasEnv)("moveCard", () => {
  const cardIds: string[] = [];
  const sectionIds: string[] = [];

  async function newSection(name: string) {
    const db = requireSupabase();
    const { data, error } = await db.from("sections").insert({ name }).select("*").single();
    if (error) throw new Error(error.message);
    sectionIds.push(data.id);
    return data as { id: string; name: string };
  }

  async function newCard(title: string, sectionId: string) {
    const card = await createCard({ title, sectionId });
    cardIds.push(card.id);
    return card;
  }

  async function boardCard(cardId: string) {
    const board = await listBoard();
    const found = board.cards.find((c) => c.id === cardId);
    if (!found) throw new Error("card not on board");
    return found;
  }

  afterAll(async () => {
    const db = requireSupabase();
    if (cardIds.length) await db.from("cards").delete().in("id", cardIds);
    if (sectionIds.length) await db.from("sections").delete().in("id", sectionIds);
  });

  it("changes status, sets done_at, and writes a change Activity", async () => {
    const section = await newSection("Move Section");
    const card = await newCard("Move me", section.id);

    await moveCard(card.id, "in_progress", 0);
    const started = await boardCard(card.id);
    expect(started.status).toBe("in_progress");
    expect(started.done_at).toBeNull();

    await moveCard(card.id, "done", 0);
    const finished = await boardCard(card.id);
    expect(finished.status).toBe("done");
    expect(finished.done_at).not.toBeNull();

    const detail = await getCardDetail(card.id);
    const texts = (detail?.activities ?? []).map((a) => a.text);
    expect(texts).toContain("Status: To Do → In Progress");
    expect(texts).toContain("Status: In Progress → Done");
  });

  it("clears done_at when the card leaves done", async () => {
    const section = await newSection("Reopen Section");
    const card = await newCard("Reopen me", section.id);

    await moveCard(card.id, "done", 0);
    await moveCard(card.id, "todo", 0);
    const reopened = await boardCard(card.id);
    expect(reopened.status).toBe("todo");
    expect(reopened.done_at).toBeNull();
  });

  it("rewrites positions when reordering inside a column", async () => {
    const section = await newSection("Order Section");
    const a = await newCard("A", section.id);
    const b = await newCard("B", section.id);
    const c = await newCard("C", section.id);

    await moveCard(c.id, "todo", 0);

    const board = await listBoard();
    const order = board.cards
      .filter((card) => card.section_id === section.id)
      .sort((x, y) => x.position - y.position)
      .map((card) => card.id);
    expect(order).toEqual([c.id, a.id, b.id]);
  });

  it("writes no Activity when only the position changes", async () => {
    const section = await newSection("Quiet Move Section");
    const first = await newCard("First", section.id);
    await newCard("Second", section.id);

    await moveCard(first.id, "todo", 1);
    const detail = await getCardDetail(first.id);
    expect(detail?.activities.length).toBe(0);
  });
});
