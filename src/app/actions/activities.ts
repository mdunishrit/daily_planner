"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";

export async function addNoteAction(cardId: string, text: string) {
  const activity = await store.addNote(cardId, text);
  revalidatePath("/");
  return activity;
}
