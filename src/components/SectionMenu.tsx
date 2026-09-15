"use client";

import { useEffect, useRef, useState } from "react";
import {
  deleteSectionAction,
  deleteSectionWithMoveAction,
  reorderSectionsAction,
  updateSectionAction,
} from "@/app/actions/sections";
import { BUTTON_PRIMARY, FOCUS, INPUT } from "./ui";
import type { Section } from "@/lib/types";

/** Applies an optimistic section list, then runs the server work and rolls back on failure. */
export type ApplySections = (next: Section[], work: () => Promise<unknown>) => void;

const ITEM = `rounded-md px-2 py-1 text-left text-xs text-muted hover:bg-bg disabled:opacity-40   ${FOCUS}`;

/** Per-section menu: rename, reorder, and delete with a target section for its cards. */
export default function SectionMenu({
  section,
  sections,
  index,
  cardCount,
  apply,
}: {
  section: Section;
  sections: Section[];
  index: number;
  cardCount: number;
  apply: ApplySections;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(section.name);
  const [moveTarget, setMoveTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLSpanElement>(null);

  const others = sections.filter((s) => s.id !== section.id && !s.id.startsWith("temp-"));

  useEffect(() => {
    if (!open) return;
    function onDown(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function done() {
    setOpen(false);
    setRenaming(false);
    setMoveTarget(null);
    setError(null);
  }

  function move(offset: number) {
    const to = index + offset;
    if (to < 0 || to >= sections.length) return;
    const next = [...sections];
    next.splice(to, 0, next.splice(index, 1)[0]);
    done();
    apply(next, () => reorderSectionsAction(next.map((s) => s.id)));
  }

  function rename(trimmed: string) {
    done();
    apply(
      sections.map((s) => (s.id === section.id ? { ...s, name: trimmed } : s)),
      () => updateSectionAction(section.id, trimmed),
    );
  }

  function startDelete() {
    if (cardCount === 0) {
      done();
      apply(
        sections.filter((s) => s.id !== section.id),
        () => deleteSectionAction(section.id),
      );
      return;
    }
    if (others.length === 0) {
      setError("No other section to move cards to.");
      return;
    }
    setMoveTarget(others[0].id);
  }

  function moveAndDelete(target: string) {
    done();
    apply(
      sections.filter((s) => s.id !== section.id),
      () => deleteSectionWithMoveAction(section.id, target),
    );
  }

  if (renaming) {
    return (
      <form
        className="flex items-center gap-1"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          rename(trimmed);
        }}
      >
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`${INPUT} w-32 py-0.5 text-xs`}
        />
        <button type="submit" className={`${BUTTON_PRIMARY} px-2 py-0.5 text-xs`}>
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setRenaming(false);
            setName(section.name);
          }}
          className={`rounded-lg px-2 py-0.5 text-xs text-muted  ${FOCUS}`}
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <span ref={root} className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={`Section menu ${section.name}`}
        onClick={() => setOpen((value) => !value)}
        className={`rounded-md px-1 text-xs text-muted hover:text-accent   ${FOCUS}`}
      >
        ⋯
      </button>
      {open && (
        <span className="absolute left-0 top-6 z-30 flex w-56 flex-col gap-1 rounded-lg border border-line bg-card p-2 text-xs shadow-md">
          {moveTarget === null ? (
            <>
              <button type="button" className={ITEM} onClick={() => setRenaming(true)}>
                Rename
              </button>
              <button
                type="button"
                className={ITEM}
                disabled={index === 0}
                onClick={() => move(-1)}
              >
                Move up
              </button>
              <button
                type="button"
                className={ITEM}
                disabled={index === sections.length - 1}
                onClick={() => move(1)}
              >
                Move down
              </button>
              <button type="button" className={`${ITEM} text-danger `} onClick={startDelete}>
                Delete
              </button>
            </>
          ) : (
            <>
              <span className="px-2 text-muted ">
                Move its {cardCount} card{cardCount === 1 ? "" : "s"} to:
              </span>
              <select
                value={moveTarget}
                onChange={(event) => setMoveTarget(event.target.value)}
                className={`${INPUT} py-1 text-xs`}
              >
                {others.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`${ITEM} text-danger `}
                onClick={() => moveAndDelete(moveTarget)}
              >
                Move and delete
              </button>
              <button type="button" className={ITEM} onClick={() => setMoveTarget(null)}>
                Cancel
              </button>
            </>
          )}
          {error && <span className="px-2 text-danger ">{error}</span>}
        </span>
      )}
    </span>
  );
}
