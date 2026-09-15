import { afterAll, describe, expect, it } from "vitest";
import { requireSupabase } from "@/lib/supabase";
import {
  createCard,
  createSection,
  deleteSection,
  deleteSectionWithMove,
  getCardDetail,
  listSections,
  reorderSections,
  updateSection,
} from "@/lib/store";

const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

describe.skipIf(!hasEnv)("section store", () => {
  const sectionIds: string[] = [];
  const cardIds: string[] = [];

  async function newSection(name: string) {
    const section = await createSection(name);
    sectionIds.push(section.id);
    return section;
  }

  afterAll(async () => {
    const db = requireSupabase();
    if (cardIds.length) await db.from("cards").delete().in("id", cardIds);
    if (sectionIds.length) await db.from("sections").delete().in("id", sectionIds);
  });

  it("creates a section and lists it", async () => {
    const section = await newSection("Sec Create");
    const all = await listSections();
    expect(all.find((s) => s.id === section.id)?.name).toBe("Sec Create");
  });

  it("renames a section", async () => {
    const section = await newSection("Sec Old");
    const renamed = await updateSection(section.id, "Sec New");
    expect(renamed.name).toBe("Sec New");
    const all = await listSections();
    expect(all.find((s) => s.id === section.id)?.name).toBe("Sec New");
  });

  it("reorders sections", async () => {
    const first = await newSection("Sec A");
    const second = await newSection("Sec B");
    await reorderSections([second.id, first.id]);
    const all = await listSections();
    const posA = all.find((s) => s.id === first.id)?.position ?? -1;
    const posB = all.find((s) => s.id === second.id)?.position ?? -1;
    expect(posB).toBeLessThan(posA);
  });

  it("deletes an empty section directly", async () => {
    const section = await newSection("Sec Empty");
    await deleteSection(section.id);
    const all = await listSections();
    expect(all.find((s) => s.id === section.id)).toBeUndefined();
  });

  it("deletes a section with cards and moves them to the target", async () => {
    const source = await newSection("Sec Source");
    const target = await newSection("Sec Target");
    const card = await createCard({ title: "Moved card", sectionId: source.id });
    cardIds.push(card.id);

    await deleteSectionWithMove(source.id, target.id);

    const all = await listSections();
    expect(all.find((s) => s.id === source.id)).toBeUndefined();
    const detail = await getCardDetail(card.id);
    expect(detail?.card.section_id).toBe(target.id);
  });
});
