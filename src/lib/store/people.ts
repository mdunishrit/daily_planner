import { requireSupabase } from "@/lib/supabase";
import type { Person } from "@/lib/types";
import { addActivity } from "./activities";

export async function listPeople(): Promise<Person[]> {
  const db = requireSupabase();
  const { data, error } = await db.from("people").select("*").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Person[];
}

export async function createPerson(name: string, email: string): Promise<Person> {
  const db = requireSupabase();
  const { data, error } = await db.from("people").insert({ name, email }).select("*").single();
  if (error) throw new Error(error.message);
  return data as Person;
}

export async function updatePerson(
  personId: string,
  input: { name?: string; email?: string },
): Promise<Person> {
  const db = requireSupabase();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.email !== undefined) patch.email = input.email;

  if (Object.keys(patch).length === 0) {
    const { data, error } = await db.from("people").select("*").eq("id", personId).single();
    if (error) throw new Error(error.message);
    return data as Person;
  }

  const { data, error } = await db
    .from("people")
    .update(patch)
    .eq("id", personId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Person;
}

export async function deletePerson(personId: string): Promise<void> {
  const db = requireSupabase();
  const person = await getPerson(personId);
  const { data: links, error: linkError } = await db
    .from("card_people")
    .select("card_id")
    .eq("person_id", personId);
  if (linkError) throw new Error(linkError.message);

  if (person) {
    for (const link of (links ?? []) as Array<{ card_id: string }>) {
      await addActivity(link.card_id, "change", `Removed person: ${person.name}`);
    }
  }

  const { error } = await db.from("people").delete().eq("id", personId);
  if (error) throw new Error(error.message);
}

export async function addPersonToCard(cardId: string, personId: string): Promise<void> {
  const db = requireSupabase();
  const person = await getPerson(personId);
  if (!person) throw new Error("Person not found");

  const { error } = await db.from("card_people").insert({ card_id: cardId, person_id: personId });
  if (error) throw new Error(error.message);
  await addActivity(cardId, "change", `Added person: ${person.name}`);
}

export async function removePersonFromCard(cardId: string, personId: string): Promise<void> {
  const db = requireSupabase();
  const person = await getPerson(personId);

  const { error } = await db
    .from("card_people")
    .delete()
    .eq("card_id", cardId)
    .eq("person_id", personId);
  if (error) throw new Error(error.message);
  if (person) await addActivity(cardId, "change", `Removed person: ${person.name}`);
}

async function getPerson(personId: string): Promise<Person | null> {
  const db = requireSupabase();
  const { data, error } = await db.from("people").select("*").eq("id", personId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Person) ?? null;
}
