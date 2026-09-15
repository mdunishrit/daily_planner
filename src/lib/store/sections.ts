import { requireSupabase } from "@/lib/supabase";
import type { Section } from "@/lib/types";

export async function listSections(): Promise<Section[]> {
  const db = requireSupabase();
  const { data, error } = await db.from("sections").select("*").order("position");
  if (error) throw new Error(error.message);
  return (data ?? []) as Section[];
}

export async function createSection(name: string): Promise<Section> {
  const db = requireSupabase();
  const { data: last, error: lastError } = await db
    .from("sections")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);
  if (lastError) throw new Error(lastError.message);
  const position = last && last.length > 0 ? last[0].position + 1 : 0;
  const { data, error } = await db
    .from("sections")
    .insert({ name, position })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Section;
}

export async function updateSection(sectionId: string, name: string): Promise<Section> {
  const db = requireSupabase();
  const { data, error } = await db
    .from("sections")
    .update({ name })
    .eq("id", sectionId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Section;
}

export async function reorderSections(sectionIds: string[]): Promise<void> {
  const db = requireSupabase();
  for (let i = 0; i < sectionIds.length; i += 1) {
    const { error } = await db.from("sections").update({ position: i }).eq("id", sectionIds[i]);
    if (error) throw new Error(error.message);
  }
}

export async function countCardsInSection(sectionId: string): Promise<number> {
  const db = requireSupabase();
  const { count, error } = await db
    .from("cards")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function deleteSection(sectionId: string): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("sections").delete().eq("id", sectionId);
  if (error) throw new Error(error.message);
}

export async function deleteSectionWithMove(
  sectionId: string,
  targetSectionId: string,
): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.rpc("delete_section_with_move", {
    section_id: sectionId,
    target_section_id: targetSectionId,
  });
  if (error) throw new Error(error.message);
}
