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
import DragColumn from "../DragColumn";
import CardRow from "./CardRow";
import { COLUMNS, byPosition } from "./BoardColumns";
import { moveCardAction } from "@/app/actions/cards";
import type { BoardViewProps } from "./types";
import type { BoardCard, Status } from "@/lib/types";

/** Three status columns with drag between columns, reorder inside one, and optimistic moves. */
export default function BoardView({ cards, onOpen }: BoardViewProps) {
  const [local, setLocal] = useState<BoardCard[]>(cards);
  const [dragging, setDragging] = useState<BoardCard | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setLocal(cards), [cards]);

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
    if (overId.startsWith("column:")) {
      status = overId.slice(7) as Status;
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
      <div className="grid grid-cols-1 gap-8 px-6 py-6 md:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnCards = byPosition(local, column.status);
          return (
            <section key={column.status} className="min-w-0">
              <h2 className="sticky top-14 z-10 mb-3 flex items-center gap-2 border-b border-line bg-bg/90 py-1 text-[12px] font-medium uppercase tracking-[0.1em] text-muted backdrop-blur">
                <span className={`h-1.5 w-1.5 rounded-full ${column.dot}`} />
                {column.label}
                <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] tabular-nums text-muted">
                  {columnCards.length}
                </span>
              </h2>
              <DragColumn status={column.status} cardIds={columnCards.map((card) => card.id)}>
                {columnCards.map((card) => (
                  <DragCard key={card.id} id={card.id}>
                    <CardRow card={card} onOpen={onOpen} />
                  </DragCard>
                ))}
              </DragColumn>
            </section>
          );
        })}
      </div>
      <DragOverlay>
        {dragging && (
          <div className="rotate-2 rounded-lg border border-accent bg-card px-3 py-3 text-[13px] shadow-lg">
            {dragging.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
