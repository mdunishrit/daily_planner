"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import DragCard from "../DragCard";
import ListRows from "./ListRows";
import CardRow from "./CardRow";
import ListGroupHeader from "./ListGroupHeader";
import { COLUMNS, byPosition } from "./BoardColumns";
import { moveCardAction } from "@/app/actions/cards";
import type { ListViewProps } from "./types";
import type { BoardCard, Status } from "@/lib/types";

const MINUTE = 60000;

/** Short relative time such as "now", "4h", "3d". */
function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE) return "now";
  if (diff < 60 * MINUTE) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < 24 * 60 * MINUTE) return `${Math.floor(diff / (60 * MINUTE))}h`;
  if (diff < 30 * 24 * 60 * MINUTE) return `${Math.floor(diff / (24 * 60 * MINUTE))}d`;
  return new Date(iso).toLocaleDateString();
}

/** Dense list grouped by status. Rows reorder inside a group; a header drop changes status. */
export default function ListView({ cards, onOpen }: ListViewProps) {
  const [local, setLocal] = useState<BoardCard[]>(cards);
  const [collapsed, setCollapsed] = useState<Status[]>([]);
  const [dragging, setDragging] = useState<BoardCard | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setLocal(cards), [cards]);

  function toggle(status: Status) {
    setCollapsed((prev) =>
      prev.includes(status) ? prev.filter((value) => value !== status) : [...prev, status],
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setDragging(local.find((card) => card.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDragging(null);
    if (!over) return;
    const moved = local.find((card) => card.id === active.id);
    if (!moved) return;
    const overId = String(over.id);
    let status: Status;
    let index: number;
    if (overId.startsWith("group:") || overId.startsWith("column:")) {
      status = overId.slice(overId.indexOf(":") + 1) as Status;
      index = byPosition(local, status).filter((card) => card.id !== moved.id).length;
    } else {
      const overCard = local.find((card) => card.id === overId);
      if (!overCard) return;
      status = overCard.status;
      index = Math.max(
        0,
        byPosition(local, status)
          .filter((card) => card.id !== moved.id)
          .findIndex((card) => card.id === overCard.id),
      );
    }
    if (moved.status === status && moved.position === index) return;
    setLocal((prev) =>
      prev.map((card) => (card.id === moved.id ? { ...card, status, position: index } : card)),
    );
    startTransition(async () => {
      try {
        await moveCardAction(moved.id, status, index);
      } catch {
        setLocal(cards);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="px-6 py-6">
        {COLUMNS.map((column) => {
          const rows = byPosition(local, column.status);
          const isCollapsed = collapsed.includes(column.status);
          return (
            <section key={column.status} className="mb-8">
              <ListGroupHeader
                status={column.status}
                label={column.label}
                dot={column.dot}
                count={rows.length}
                collapsed={isCollapsed}
                onToggle={() => toggle(column.status)}
              />
              {!isCollapsed && (
                <ListRows status={column.status} cardIds={rows.map((card) => card.id)}>
                  {rows.map((card) => (
                    <DragCard key={card.id} id={card.id}>
                      <CardRow
                        card={card}
                        onOpen={onOpen}
                        dense
                        trailing={
                          <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted">
                            {relativeTime(card.updated_at)}
                          </span>
                        }
                      />
                    </DragCard>
                  ))}
                </ListRows>
              )}
            </section>
          );
        })}
      </div>
      <DragOverlay>
        {dragging && (
          <div className="rotate-2 rounded-lg border border-accent bg-card px-3 py-2.5 text-[13px] shadow-lg">
            {dragging.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
