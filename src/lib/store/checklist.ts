import { requireSupabase } from "@/lib/supabase";
import type { ChecklistItem } from "@/lib/types";
import { addActivity } from "./activities";

export async function addChecklistItem(cardId: string, text: string): Promise<ChecklistItem> {
  const db = requireSupabase();
  const { data: last, error: lastError } = await db
    .from("checklist_items")
    .select("position")
    .eq("card_id", cardId)
    .order("position", { ascending: false })
    .limit(1);
  if (lastError) throw new Error(lastError.message);
  const position = last && last.length > 0 ? last[0].position + 1 : 0;

  const { data, error } = await db
    .from("checklist_items")
    .insert({ card_id: cardId, text, position })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ChecklistItem;
}

export async function toggleChecklistItem(itemId: string): Promise<ChecklistItem> {
  const db = requireSupabase();
  const { data: before, error: readError } = await db
    .from("checklist_items")
    .select("*")
    .eq("id", itemId)
    .single();
  if (readError) throw new Error(readError.message);
  const prev = before as ChecklistItem;

  const { data, error } = await db
    .from("checklist_items")
    .update({ is_done: !prev.is_done })
    .eq("id", itemId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const next = data as ChecklistItem;

  await addActivity(
    next.card_id,
    "change",
    `${next.is_done ? "Ticked" : "Unticked"}: ${next.text}`,
  );
  return next;
}

export async function updateChecklistItem(itemId: string, text: string): Promise<ChecklistItem> {
  const db = requireSupabase();
  const { data, error } = await db
    .from("checklist_items")
    .update({ text })
    .eq("id", itemId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as ChecklistItem;
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("checklist_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
}

export async function reorderChecklist(cardId: string, itemIds: string[]): Promise<void> {
  const db = requireSupabase();
  const results = await Promise.all(
    itemIds.map((id, index) =>
      db.from("checklist_items").update({ position: index }).eq("id", id).eq("card_id", cardId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
