"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
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
import CardPanel from "./CardPanel";
import DragCard from "./DragCard";
import DragColumn from "./DragColumn";
import FilterBar from "./FilterBar";
import SectionManager from "./SectionManager";
import ThemeToggle from "./ThemeToggle";
import { BUTTON_PRIMARY, BUTTON_QUIET, COUNT_PILL, FOCUS, INPUT, Initials, PRIORITY_BAR } from "./ui";
import { createCardAction, moveCardAction } from "@/app/actions/cards";
import { useFilters } from "@/lib/useFilters";
import type { BoardCard, Person, Section, Status } from "@/lib/types";

const COLUMNS: Array<{ status: Status; label: string }> = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

/** The board: filter bar, section chips, and three drag-and-drop status columns. */
export default function Board({
  sections,
  cards,
  people,
}: {
  sections: Section[];
  cards: BoardCard[];
  people: Person[];
}) {
  const filters = useFilters();
  const [selected, setSelected] = useState<BoardCard | null>(null);
  const [dragging, setDragging] = useState<BoardCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [localCards, setLocalCards] = useState<BoardCard[]>(cards);
  const lastDragEnd = useRef(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  function columnCardsOf(list: BoardCard[], status: Status) {
    return list.filter((c) => c.status === status).sort((a, b) => a.position - b.position);
  }

  function openCard(card: BoardCard) {
    if (Date.now() - lastDragEnd.current < 250) return;
    if (card.id.startsWith("temp-")) return;
    setSelected(card);
  }

  function handleDragStart(event: DragStartEvent) {
    setDragging(localCards.find((c) => c.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    lastDragEnd.current = Date.now();
    setDragging(null);
    if (!over) return;
    const moved = localCards.find((c) => c.id === active.id);
    if (!moved) return;

    const overId = String(over.id);
    let targetStatus: Status;
    let targetIndex: number;
    if (overId.startsWith("column:")) {
      targetStatus = overId.slice("column:".length) as Status;
      targetIndex = columnCardsOf(localCards, targetStatus).filter((c) => c.id !== moved.id).length;
    } else {
      const overCard = localCards.find((c) => c.id === overId);
      if (!overCard) return;
      targetStatus = overCard.status;
      targetIndex = columnCardsOf(localCards, targetStatus)
        .filter((c) => c.id !== moved.id)
        .findIndex((c) => c.id === overCard.id);
      if (targetIndex < 0) targetIndex = 0;
    }
    if (moved.status === targetStatus && moved.position === targetIndex) return;

    const rest = localCards.filter((c) => c.id !== moved.id);
    const target = columnCardsOf(rest, targetStatus);
    target.splice(targetIndex, 0, { ...moved, status: targetStatus });
    const positions = new Map(target.map((c, index) => [c.id, index]));
    columnCardsOf(rest, moved.status).forEach((c, index) => {
      if (!positions.has(c.id)) positions.set(c.id, index);
    });
    setLocalCards(
      localCards.map((c) => {
        const position = positions.get(c.id);
        if (position === undefined) return c;
        return c.id === moved.id ? { ...c, status: targetStatus, position } : { ...c, position };
      }),
    );

    setError(null);
    startTransition(async () => {
      try {
        await moveCardAction(moved.id, targetStatus, targetIndex);
      } catch (e) {
        setError((e as Error).message);
        setLocalCards(cards);
      }
    });
  }

  function addCard(status: Status, title: string) {
    if (!title.trim() || sections.length === 0) return;
    const sectionId = filters.get("section") || sections[0].id;
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic: BoardCard = {
      id: tempId,
      title: title.trim(),
      description: null,
      link: null,
      section_id: sectionId,
      status,
      priority: "normal",
      position: columnCardsOf(localCards, status).length,
      done_at: null,
      created_at: now,
      updated_at: now,
      section_name: sections.find((s) => s.id === sectionId)?.name ?? "",
      checklist_done: 0,
      checklist_total: 0,
      people: [],
    };
    setLocalCards((prev) => [...prev, optimistic]);
    setError(null);
    startTransition(async () => {
      try {
        await createCardAction({ title: optimistic.title, sectionId, status });
      } catch (e) {
        setError((e as Error).message);
        setLocalCards((prev) => prev.filter((c) => c.id !== tempId));
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface font-sans dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-base font-semibold text-brand-700 dark:text-brand-400">
            Daily Planner
          </span>
          <div className="flex items-center gap-2">
            <Link href="/people" className={BUTTON_QUIET}>
              People
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="px-6 pb-3">
          <FilterBar people={people} />
        </div>
        <div className="border-t border-neutral-200 px-6 py-2 dark:border-neutral-800">
          <SectionManager sections={sections} />
        </div>
      </header>

      <main className="px-6 py-6">
        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {sections.length === 0 && (
          <p className="mb-4 rounded-lg border border-neutral-200 p-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
            Add a Section first. Use + Section in the header.
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const columnCards = columnCardsOf(localCards, col.status);
              return (
                <section key={col.status}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-400">
                    {col.label}
                    <span className={COUNT_PILL}>{columnCards.length}</span>
                  </h2>
                  <DragColumn status={col.status} cardIds={columnCards.map((c) => c.id)}>
                    {columnCards.map((card) => (
                      <DragCard key={card.id} id={card.id}>
                        <button type="button" onClick={() => openCard(card)} className={CARD_CLASS}>
                          <CardBody card={card} />
                        </button>
                      </DragCard>
                    ))}
                  </DragColumn>
                  <AddCard
                    disabled={sections.length === 0}
                    onAdd={(title) => addCard(col.status, title)}
                  />
                </section>
              );
            })}
          </div>
          <DragOverlay>
            {dragging && (
              <div className={`${CARD_CLASS} rotate-1 shadow-lg`}>
                <CardBody card={dragging} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>

      {selected && (
        <CardPanel card={selected} sections={sections} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

const CARD_CLASS =
  `flex w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-left transition duration-150 ` +
  `hover:-translate-y-px hover:border-brand-500/40 dark:border-neutral-800 dark:bg-neutral-900 ${FOCUS}`;

function CardBody({ card }: { card: BoardCard }) {
  return (
    <>
      <span className={`w-[3px] shrink-0 ${PRIORITY_BAR[card.priority]}`} />
      <span className="block flex-1 p-3">
        <span className="block text-sm text-neutral-900 dark:text-neutral-100">{card.title}</span>
        <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 dark:bg-neutral-800">
            {card.section_name}
          </span>
          {card.checklist_total > 0 && (
            <span>
              {card.checklist_done}/{card.checklist_total}
            </span>
          )}
          <Initials people={card.people} />
        </span>
      </span>
    </>
  );
}

function AddCard({ onAdd, disabled }: { onAdd: (title: string) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={`mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-500 transition-colors duration-150 hover:bg-white hover:text-brand-700 disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-brand-400 ${FOCUS}`}
      >
        + Card
      </button>
    );
  }

  return (
    <form
      className="mt-2 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(title);
        setTitle("");
        setOpen(false);
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder="Card title"
        className={INPUT}
      />
      <button type="submit" disabled={disabled} className={BUTTON_PRIMARY}>
        Add
      </button>
    </form>
  );
}
