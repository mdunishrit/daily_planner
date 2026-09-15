"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import BoardView from "./BoardView";
import CardDialog from "./CardDialog";
import Header from "./Header";
import ListView from "./ListView";
import Navigator from "./Navigator";
import Rail from "./Rail";
import { filterCards } from "./filterCards";
import { useBoardFilters } from "./useBoardFilters";
import { createCardAction } from "@/app/actions/cards";
import type { CommandShellProps } from "./types";
import type { BoardCard } from "@/lib/types";

const NAV_KEY = "command.nav";

function readNavOpen() {
  try {
    return localStorage.getItem(NAV_KEY) !== "0";
  } catch {
    return true;
  }
}

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

/** Command Board shell: rail, navigator, header, one view, and the card modal. */
export default function CommandShell({ sections, people, cards }: CommandShellProps) {
  const { filters, set, clear, active } = useBoardFilters();
  const [localCards, setLocalCards] = useState<BoardCard[]>(cards);
  const [navOpen, setNavOpen] = useState(true);
  const [selected, setSelected] = useState<BoardCard | null>(null);
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocalCards(cards), [cards]);
  useEffect(() => setNavOpen(readNavOpen()), []);

  function toggleNav() {
    setNavOpen((value) => {
      const next = !value;
      try {
        localStorage.setItem(NAV_KEY, next ? "1" : "0");
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const typing = isTypingTarget(event.target);
      if (event.key === "Escape" && event.target === searchRef.current) {
        set("q", "");
        searchRef.current?.blur();
        return;
      }
      if (typing) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key === "[") {
        event.preventDefault();
        toggleNav();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [set]);

  const visible = useMemo(() => filterCards(localCards, filters), [localCards, filters]);

  const section = filters.section
    ? sections.find((item) => item.id === filters.section)
    : undefined;
  const person = filters.person ? people.find((item) => item.id === filters.person) : undefined;
  const crumb = section?.name ?? person?.name ?? "All";

  function addCard(title: string) {
    if (sections.length === 0) return;
    const targetId = filters.section || sections[0].id;
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    setLocalCards((prev) => [
      ...prev,
      {
        id: tempId,
        title,
        description: null,
        link: null,
        section_id: targetId,
        status: "todo",
        priority: "normal",
        position: prev.filter((card) => card.status === "todo").length,
        done_at: null,
        created_at: now,
        updated_at: now,
        section_name: sections.find((item) => item.id === targetId)?.name ?? "",
        checklist_done: 0,
        checklist_total: 0,
        people: [],
      },
    ]);
    startTransition(async () => {
      try {
        await createCardAction({ title, sectionId: targetId, status: "todo" });
      } catch {
        setLocalCards((prev) => prev.filter((card) => card.id !== tempId));
      }
    });
  }

  return (
    <div className="flex min-h-screen bg-bg font-sans text-ink">
      <Rail navOpen={navOpen} onToggleNav={toggleNav} filters={filters} />
      {navOpen && (
        <Navigator
          sections={sections}
          people={people}
          cards={localCards}
          filters={filters}
          onSet={set}
          onClear={clear}
        />
      )}
      <div className="min-w-0 flex-1">
        <Header
          crumb={crumb}
          filters={filters}
          active={active}
          searchRef={searchRef}
          onSet={set}
          onClear={clear}
          onAdd={addCard}
        />
        {filters.view === "board" ? (
          <BoardView cards={visible} sections={sections} onOpen={setSelected} />
        ) : (
          <ListView cards={visible} sections={sections} onOpen={setSelected} />
        )}
      </div>
      {selected && (
        <CardDialog card={selected} sections={sections} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
