"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";

export async function createSectionAction(name: string) {
  const section = await store.createSection(name);
  revalidatePath("/");
  return section;
}

export async function updateSectionAction(sectionId: string, name: string) {
  const section = await store.updateSection(sectionId, name);
  revalidatePath("/");
  return section;
}

export async function reorderSectionsAction(sectionIds: string[]) {
  await store.reorderSections(sectionIds);
  revalidatePath("/");
}

export async function countCardsInSectionAction(sectionId: string) {
  return store.countCardsInSection(sectionId);
}

export async function deleteSectionAction(sectionId: string) {
  await store.deleteSection(sectionId);
  revalidatePath("/");
}

export async function deleteSectionWithMoveAction(sectionId: string, targetSectionId: string) {
  await store.deleteSectionWithMove(sectionId, targetSectionId);
  revalidatePath("/");
}
