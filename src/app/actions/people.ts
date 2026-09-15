"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";

function revalidate() {
  revalidatePath("/");
  revalidatePath("/people");
}

export async function listPeopleAction() {
  return store.listPeople();
}

export async function createPersonAction(name: string, email: string) {
  const person = await store.createPerson(name, email);
  revalidate();
  return person;
}

export async function updatePersonAction(
  personId: string,
  input: { name?: string; email?: string },
) {
  const person = await store.updatePerson(personId, input);
  revalidate();
  return person;
}

export async function deletePersonAction(personId: string) {
  await store.deletePerson(personId);
  revalidate();
}

export async function addPersonToCardAction(cardId: string, personId: string) {
  await store.addPersonToCard(cardId, personId);
  revalidate();
}

export async function removePersonFromCardAction(cardId: string, personId: string) {
  await store.removePersonFromCard(cardId, personId);
  revalidate();
}
