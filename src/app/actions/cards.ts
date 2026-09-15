"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import type { Priority, Status } from "@/lib/types";

export async function createCardAction(input: {
  title: string;
  sectionId: string;
  status?: Status;
}) {
  const card = await store.createCard(input);
  revalidatePath("/");
  return card;
}

export async function updateCardAction(
  cardId: string,
  input: {
    title?: string;
    description?: string | null;
    link?: string | null;
    priority?: Priority;
    sectionId?: string;
  },
) {
  const card = await store.updateCard(cardId, input);
  revalidatePath("/");
  return card;
}

export async function deleteCardAction(cardId: string) {
  await store.deleteCard(cardId);
  revalidatePath("/");
}

export async function moveCardAction(cardId: string, status: Status, position: number) {
  await store.moveCard(cardId, status, position);
  revalidatePath("/");
}

export async function getCardDetailAction(cardId: string) {
  return store.getCardDetail(cardId);
}
