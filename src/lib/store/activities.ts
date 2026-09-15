import { requireSupabase } from "@/lib/supabase";
import type { Activity, ActivityKind } from "@/lib/types";

export async function addActivity(
  cardId: string,
  kind: ActivityKind,
  text: string,
): Promise<Activity> {
  const db = requireSupabase();
  const { data, error } = await db
    .from("activities")
    .insert({ card_id: cardId, kind, text })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Activity;
}

export async function addNote(cardId: string, text: string): Promise<Activity> {
  const note = text.trim();
  if (!note) throw new Error("Note text is required");
  return addActivity(cardId, "note", note);
}
