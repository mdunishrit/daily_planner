"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";

export async function addChecklistItemAction(cardId: string, text: string) {
  const item = await store.addChecklistItem(cardId, text);
  revalidatePath("/");
  return item;
}

export async function toggleChecklistItemAction(itemId: string) {
  const item = await store.toggleChecklistItem(itemId);
  revalidatePath("/");
  return item;
}

export async function updateChecklistItemAction(itemId: string, text: string) {
  const item = await store.updateChecklistItem(itemId, text);
  revalidatePath("/");
  return item;
}

export async function deleteChecklistItemAction(itemId: string) {
  await store.deleteChecklistItem(itemId);
  revalidatePath("/");
}

export async function reorderChecklistAction(cardId: string, itemIds: string[]) {
  await store.reorderChecklist(cardId, itemIds);
  revalidatePath("/");
}
