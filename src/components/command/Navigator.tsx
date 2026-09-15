"use client";

import { useEffect, useState, useTransition } from "react";
import SectionMenu from "../SectionMenu";
import { initials } from "../ui";
import { createSectionAction } from "@/app/actions/sections";
import { isArchived, isToday } from "./filterCards";
import type { ApplySections } from "../SectionMenu";
import type { BoardCard, Person, Section } from "@/lib/types";
import type { BoardFilters } from "./types";

export type NavigatorProps = {
  sections: Section[];
  people: Person[];
  cards: BoardCard[];
  filters: BoardFilters;
  onSet: (key: keyof BoardFilters, value: string | boolean | undefined) => void;
  onClear: () => void;
};

const T = "transition-all duration-150";
const GROUP = "px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted";
const ITEM = `flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] ${T}`;
const ON = "bg-accent-soft text-accent";
const OFF = "text-muted hover:text-ink";
const COUNT = "tabular-nums text-[11px]";

/** Second column, 240px: views, sections with menus, people, and the archived toggle. */
export default function Navigator({
  sections,
  people,
  cards,
  filters,
  onSet,
  onClear,
}: NavigatorProps) {
  const [local, setLocal] = useState(sections);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => setLocal(sections), [sections]);

  const apply: ApplySections = (next, work) => {
    const before = local;
    setLocal(next);
    setError(null);
    startTransition(async () => {
      try {
        await work();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
        setLocal(before);
      }
    });
  };

  const base = cards.filter((card) => filters.archived || !isArchived(card));
  const viewsActive = Boolean(filters.section) || Boolean(filters.person);

  function addSection(name: string) {
    const temp: Section = {
      id: `temp-${Date.now()}`,
      name,
      position: local.length,
      created_at: new Date().toISOString(),
    };
    apply([...local, temp], () => createSectionAction(name));
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
      <p className={GROUP}>Views</p>
      <ul className="mt-2 space-y-0.5">
        <li>
          <button
            type="button"
            onClick={onClear}
            className={`${ITEM} ${!viewsActive && !filters.today && !filters.priority ? ON : OFF}`}
          >
            All cards
            <span className={COUNT}>{base.length}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => onSet("today", !filters.today)}
            className={`${ITEM} ${filters.today ? ON : OFF}`}
          >
            Today
            <span className={COUNT}>{base.filter((card) => isToday(card)).length}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => onSet("priority", filters.priority === "high" ? undefined : "high")}
            className={`${ITEM} ${filters.priority === "high" ? ON : OFF}`}
          >
            High priority
            <span className={COUNT}>{base.filter((card) => card.priority === "high").length}</span>
          </button>
        </li>
      </ul>

      <p className={`${GROUP} mt-7`}>Sections</p>
      <ul className="mt-2 space-y-0.5">
        {local.map((section, index) => {
          const count = base.filter((card) => card.section_id === section.id).length;
          return (
            <li key={section.id} className="group relative flex items-center">
              <button
                type="button"
                onClick={() =>
                  onSet("section", filters.section === section.id ? undefined : section.id)
                }
                className={`${ITEM} ${filters.section === section.id ? ON : OFF}`}
              >
                <span className="truncate">{section.name}</span>
                <span className={`${COUNT} group-hover:invisible`}>{count}</span>
              </button>
              {!section.id.startsWith("temp-") && (
                <span className="invisible absolute right-1 group-hover:visible group-focus-within:visible">
                  <SectionMenu
                    section={section}
                    sections={local}
                    index={index}
                    cardCount={count}
                    apply={apply}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <AddSection onAdd={addSection} />
      {error && <p className="mt-1 px-2 text-[11px] text-danger">{error}</p>}

      <p className={`${GROUP} mt-7`}>People</p>
      <ul className="mt-2 space-y-0.5">
        {people.map((person) => (
          <li key={person.id}>
            <button
              type="button"
              onClick={() => onSet("person", filters.person === person.id ? undefined : person.id)}
              className={`${ITEM} ${filters.person === person.id ? ON : OFF}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[9px] font-medium text-accent">
                  {initials(person.name)}
                </span>
                <span className="truncate">{person.name}</span>
              </span>
              <span className={COUNT}>
                {base.filter((card) => card.people.some((p) => p.id === person.id)).length}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSet("archived", !filters.archived)}
        aria-pressed={filters.archived}
        className={`mt-auto pt-6 ${ITEM} ${filters.archived ? ON : OFF}`}
      >
        Show archived
        <span
          className={`flex h-4 w-7 shrink-0 items-center rounded-full border border-line px-0.5 ${T} ${
            filters.archived ? "bg-accent-soft" : "bg-bg"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${T} ${
              filters.archived ? "translate-x-3 bg-accent" : "bg-muted"
            }`}
          />
        </span>
      </button>
    </aside>
  );
}

function AddSection({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-1 rounded-lg px-2 py-1.5 text-left text-[13px] text-muted ${T} hover:text-accent`}
      >
        + Section
      </button>
    );
  }

  return (
    <form
      className="mt-1 px-2"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setName("");
        setOpen(false);
      }}
    >
      <input
        autoFocus
        value={name}
        placeholder="Section name"
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        onBlur={() => setOpen(false)}
        className={`w-full rounded-lg border border-line bg-bg px-2 py-1 text-[13px] text-ink outline-none placeholder:text-muted ${T} focus:border-accent`}
      />
    </form>
  );
}
