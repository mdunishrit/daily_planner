"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import type { Status } from "@/lib/types";

export const columnDroppableId = (status: Status) => `column:${status}`;

export default function DragColumn({
  status,
  cardIds,
  children,
}: {
  status: Status;
  cardIds: string[];
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(status) });
  const empty = cardIds.length === 0;

  return (
    <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
      <ul
        ref={setNodeRef}
        className={`space-y-2 rounded-lg transition-colors duration-150 ${
          empty
            ? "flex min-h-24 items-center justify-center border border-dashed border-neutral-300 text-xs text-neutral-400 dark:border-neutral-700 dark:text-neutral-500"
            : "min-h-12"
        } ${isOver ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10" : ""}`}
      >
        {empty ? <li>Drop cards here</li> : children}
      </ul>
    </SortableContext>
  );
}
