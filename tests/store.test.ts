import { afterAll, describe, expect, it } from "vitest";
import { requireSupabase } from "@/lib/supabase";
import {
  addActivity,
  createCard,
  deleteCard,
  getCardDetail,
  listBoard,
  updateCard,
} from "@/lib/store";

const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

describe.skipIf(!hasEnv)("board store", () => {
  const cardIds: string[] = [];
  const sectionIds: string[] = [];

  async function newSection(name: string) {
    const db = requireSupabase();
    const { data, error } = await db.from("sections").insert({ name }).select("*").single();
    if (error) throw new Error(error.message);
    sectionIds.push(data.id);
    return data as { id: string; name: string };
  }

  afterAll(async () => {
    const db = requireSupabase();
    if (cardIds.length) await db.from("cards").delete().in("id", cardIds);
    if (sectionIds.length) await db.from("sections").delete().in("id", sectionIds);
  });

  it("creates a card and lists it on the board", async () => {
    const section = await newSection("Test Section");
    const card = await createCard({ title: "Test card", sectionId: section.id });
    cardIds.push(card.id);

    const board = await listBoard();
    const found = board.cards.find((c) => c.id === card.id);
    expect(found?.title).toBe("Test card");
    expect(found?.section_name).toBe("Test Section");
    expect(found?.checklist_total).toBe(0);
  });

  it("writes a change Activity for title and priority edits", async () => {
    const section = await newSection("Activity Section");
    const card = await createCard({ title: "Before", sectionId: section.id });
    cardIds.push(card.id);

    await updateCard(card.id, { title: "After", priority: "high" });
    const detail = await getCardDetail(card.id);
    const texts = (detail?.activities ?? []).map((a) => a.text);
    expect(texts).toContain("Title changed");
    expect(texts).toContain("Priority: Normal → High");
  });

  it("writes no Activity for description and link edits", async () => {
    const section = await newSection("Quiet Section");
    const card = await createCard({ title: "Quiet", sectionId: section.id });
    cardIds.push(card.id);

    await updateCard(card.id, { description: "text", link: "https://example.com" });
    const detail = await getCardDetail(card.id);
    expect(detail?.activities.length).toBe(0);
    expect(detail?.card.description).toBe("text");
  });

  it("adds an activity and deletes a card", async () => {
    const section = await newSection("Delete Section");
    const card = await createCard({ title: "Temp", sectionId: section.id });
    await addActivity(card.id, "note", "Called Vignesh, ETA Friday");
    const detail = await getCardDetail(card.id);
    expect(detail?.activities[0].text).toBe("Called Vignesh, ETA Friday");

    await deleteCard(card.id);
    expect(await getCardDetail(card.id)).toBeNull();
  });
});
