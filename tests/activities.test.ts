import { afterAll, describe, expect, it } from "vitest";
import { requireSupabase } from "@/lib/supabase";
import { addNote, createCard, getCardDetail } from "@/lib/store";

const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

describe.skipIf(!hasEnv)("addNote", () => {
  const cardIds: string[] = [];
  const sectionIds: string[] = [];

  afterAll(async () => {
    const db = requireSupabase();
    if (cardIds.length) await db.from("cards").delete().in("id", cardIds);
    if (sectionIds.length) await db.from("sections").delete().in("id", sectionIds);
  });

  it("adds a note Activity to the card timeline", async () => {
    const db = requireSupabase();
    const { data, error } = await db
      .from("sections")
      .insert({ name: "Note Section" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    sectionIds.push(data.id);

    const card = await createCard({ title: "Note card", sectionId: data.id });
    cardIds.push(card.id);

    const note = await addNote(card.id, "Called Vignesh, ETA Friday");
    expect(note.kind).toBe("note");
    expect(note.text).toBe("Called Vignesh, ETA Friday");

    const detail = await getCardDetail(card.id);
    expect(detail?.activities[0].text).toBe("Called Vignesh, ETA Friday");
  });

  it("rejects an empty note", async () => {
    await expect(addNote("00000000-0000-0000-0000-000000000000", "   ")).rejects.toThrow();
  });
});
