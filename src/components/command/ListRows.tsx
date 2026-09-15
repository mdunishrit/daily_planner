"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import { columnDroppableId } from "../DragColumn";
import type { Status } from "@/lib/types";

/** Flush sortable row list for one status group, with a dashed empty drop zone. */
export default function ListRows({
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
        className={`rounded-lg transition-colors duration-150 ${
          empty
            ? "flex min-h-16 items-center justify-center border border-dashed border-line text-[11px] text-muted"
            : ""
        } ${isOver ? "border-accent bg-accent-soft" : ""}`}
      >
        {empty ? <li>Drop cards here</li> : children}
      </ul>
    </SortableContext>
  );
}
