import { afterAll, describe, expect, it } from "vitest";
import { requireSupabase } from "@/lib/supabase";
import {
  addPersonToCard,
  createCard,
  createPerson,
  deletePerson,
  getCardDetail,
  listPeople,
  removePersonFromCard,
  updatePerson,
} from "@/lib/store";

const hasEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

describe.skipIf(!hasEnv)("people store", () => {
  const cardIds: string[] = [];
  const sectionIds: string[] = [];
  const personIds: string[] = [];

  async function newSection(name: string) {
    const db = requireSupabase();
    const { data, error } = await db.from("sections").insert({ name }).select("*").single();
    if (error) throw new Error(error.message);
    sectionIds.push(data.id);
    return data as { id: string };
  }

  async function newPerson(name: string, email: string) {
    const person = await createPerson(name, email);
    personIds.push(person.id);
    return person;
  }

  afterAll(async () => {
    const db = requireSupabase();
    if (cardIds.length) await db.from("cards").delete().in("id", cardIds);
    if (sectionIds.length) await db.from("sections").delete().in("id", sectionIds);
    if (personIds.length) await db.from("people").delete().in("id", personIds);
  });

  it("creates, lists, and updates a person", async () => {
    const person = await newPerson("Vignesh", "vignesh@example.com");
    const list = await listPeople();
    expect(list.some((p) => p.id === person.id)).toBe(true);

    const updated = await updatePerson(person.id, { email: "v2@example.com" });
    expect(updated.email).toBe("v2@example.com");
    expect(updated.name).toBe("Vignesh");
  });

  it("adds and removes a person tag with Activities", async () => {
    const section = await newSection("People Section");
    const card = await createCard({ title: "Tagged", sectionId: section.id });
    cardIds.push(card.id);
    const person = await newPerson("Anita", "anita@example.com");

    await addPersonToCard(card.id, person.id);
    let detail = await getCardDetail(card.id);
    expect(detail?.people.map((p) => p.id)).toContain(person.id);
    expect(detail?.activities.map((a) => a.text)).toContain("Added person: Anita");

    await removePersonFromCard(card.id, person.id);
    detail = await getCardDetail(card.id);
    expect(detail?.people.length).toBe(0);
    expect(detail?.activities.map((a) => a.text)).toContain("Removed person: Anita");
  });

  it("deleting a person removes tags and leaves an Activity", async () => {
    const section = await newSection("Delete Person Section");
    const card = await createCard({ title: "Owned", sectionId: section.id });
    cardIds.push(card.id);
    const person = await newPerson("Ravi", "ravi@example.com");

    await addPersonToCard(card.id, person.id);
    await deletePerson(person.id);

    const detail = await getCardDetail(card.id);
    expect(detail?.people.length).toBe(0);
    expect(detail?.activities.map((a) => a.text)).toContain("Removed person: Ravi");
    const list = await listPeople();
    expect(list.some((p) => p.id === person.id)).toBe(false);
  });
});
