import type { BoardCard, Status } from "@/lib/types";

/** The three board columns, in review order, with their status dot colour. */
export const COLUMNS: Array<{ status: Status; label: string; dot: string }> = [
  { status: "todo", label: "To Do", dot: "bg-muted" },
  { status: "in_progress", label: "In Progress", dot: "bg-accent" },
  { status: "done", label: "Done", dot: "bg-emerald-500" },
];

/** Cards of one status, sorted by their stored position. */
export function byPosition(list: BoardCard[], status: Status) {
  return list.filter((card) => card.status === status).sort((a, b) => a.position - b.position);
}
