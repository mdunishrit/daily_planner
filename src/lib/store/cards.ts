import { requireSupabase } from "@/lib/supabase";
import type {
  Activity,
  Card,
  CardDetail,
  ChecklistItem,
  Person,
  Priority,
  Status,
  UpdateCardInput,
} from "@/lib/types";
import { addActivity } from "./activities";

const STATUS_LABEL: Record<Status, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  normal: "Normal",
  low: "Low",
};

export type CreateCardInput = {
  title: string;
  sectionId: string;
  status?: Status;
  priority?: Priority;
};

export type { UpdateCardInput };

export async function createCard(input: CreateCardInput): Promise<Card> {
  const db = requireSupabase();
  const status: Status = input.status ?? "todo";
  const { data: last } = await db
    .from("cards")
    .select("position")
    .eq("status", status)
    .order("position", { ascending: false })
    .limit(1);
  const position = last && last.length > 0 ? last[0].position + 1 : 0;
  const { data, error } = await db
    .from("cards")
    .insert({
      title: input.title,
      section_id: input.sectionId,
      status,
      priority: input.priority ?? "normal",
      position,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as Card;
}

export async function getCardDetail(cardId: string): Promise<CardDetail | null> {
  const db = requireSupabase();
  const { data: card, error } = await db.from("cards").select("*").eq("id", cardId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!card) return null;

  const [checklist, links, activities] = await Promise.all([
    db.from("checklist_items").select("*").eq("card_id", cardId).order("position"),
    db.from("card_people").select("person_id, people(*)").eq("card_id", cardId),
    db.from("activities").select("*").eq("card_id", cardId).order("created_at", { ascending: false }),
  ]);
  if (checklist.error) throw new Error(checklist.error.message);
  if (links.error) throw new Error(links.error.message);
  if (activities.error) throw new Error(activities.error.message);

  const people = ((links.data ?? []) as unknown as Array<{ people: Person | null }>)
    .map((row) => row.people)
    .filter((p): p is Person => Boolean(p));

  return {
    card: card as Card,
    checklist: (checklist.data ?? []) as ChecklistItem[],
    people,
    activities: (activities.data ?? []) as Activity[],
  };
}

export async function updateCard(cardId: string, input: UpdateCardInput): Promise<Card> {
  const db = requireSupabase();
  const { data: before, error: readError } = await db
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .single();
  if (readError) throw new Error(readError.message);
  const prev = before as Card;

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.link !== undefined) patch.link = input.link;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.sectionId !== undefined) patch.section_id = input.sectionId;
  if (Object.keys(patch).length === 0) return prev;

  const { data, error } = await db
    .from("cards")
    .update(patch)
    .eq("id", cardId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const next = data as Card;

  if (input.title !== undefined && input.title !== prev.title) {
    await addActivity(cardId, "change", `Title: ${prev.title} → ${next.title}`);
  }
  if (input.priority !== undefined && input.priority !== prev.priority) {
    await addActivity(
      cardId,
      "change",
      `Priority: ${PRIORITY_LABEL[prev.priority]} → ${PRIORITY_LABEL[next.priority]}`,
    );
  }
  if (input.sectionId !== undefined && input.sectionId !== prev.section_id) {
    const { data: names } = await db
      .from("sections")
      .select("id, name")
      .in("id", [prev.section_id, next.section_id]);
    const byId = new Map((names ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));
    await addActivity(
      cardId,
      "change",
      `Section: ${byId.get(prev.section_id) ?? "?"} → ${byId.get(next.section_id) ?? "?"}`,
    );
  }
  return next;
}

export async function deleteCard(cardId: string): Promise<void> {
  const db = requireSupabase();
  const { error } = await db.from("cards").delete().eq("id", cardId);
  if (error) throw new Error(error.message);
}

export async function moveCard(
  cardId: string,
  status: Status,
  position: number,
): Promise<void> {
  const db = requireSupabase();
  const { data: before, error: readError } = await db
    .from("cards")
    .select("*")
    .eq("id", cardId)
    .single();
  if (readError) throw new Error(readError.message);
  const prev = before as Card;

  const statuses = prev.status === status ? [status] : [prev.status, status];
  const { data: columnRows, error: columnError } = await db
    .from("cards")
    .select("*")
    .in("status", statuses)
    .order("position");
  if (columnError) throw new Error(columnError.message);

  const all = (columnRows ?? []) as Card[];
  const source = all.filter((c) => c.status === prev.status && c.id !== cardId);
  const target = prev.status === status ? source : all.filter((c) => c.status === status);
  const clamped = Math.max(0, Math.min(position, target.length));
  target.splice(clamped, 0, { ...prev, status });

  const patches: Array<{ id: string; patch: Record<string, unknown> }> = [];
  const order = prev.status === status ? [target] : [source, target];
  for (const list of order) {
    list.forEach((card, index) => {
      const patch: Record<string, unknown> = {};
      if (card.position !== index) patch.position = index;
      if (card.id === cardId) {
        if (prev.status !== status) patch.status = status;
        if (status === "done" && prev.status !== "done") patch.done_at = new Date().toISOString();
        if (status !== "done" && prev.status === "done") patch.done_at = null;
      }
      if (Object.keys(patch).length > 0) patches.push({ id: card.id, patch });
    });
  }

  const results = await Promise.all(
    patches.map((p) => db.from("cards").update(p.patch).eq("id", p.id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  if (prev.status !== status) {
    await addActivity(
      cardId,
      "change",
      `Status: ${STATUS_LABEL[prev.status]} → ${STATUS_LABEL[status]}`,
    );
  }
}

export { STATUS_LABEL, PRIORITY_LABEL };
