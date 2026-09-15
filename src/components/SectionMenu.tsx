"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  countCardsInSectionAction,
  deleteSectionAction,
  deleteSectionWithMoveAction,
  reorderSectionsAction,
  updateSectionAction,
} from "@/app/actions/sections";
import { BUTTON_PRIMARY, FOCUS, INPUT } from "./ui";
import type { Section } from "@/lib/types";

const ITEM = `rounded-md px-2 py-1 text-left text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800 ${FOCUS}`;

/** Per-section menu: rename, reorder, and delete with a target section for its cards. */
export default function SectionMenu({
  section,
  sections,
  index,
}: {
  section: Section;
  sections: Section[];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(section.name);
  const [moveTarget, setMoveTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const root = useRef<HTMLSpanElement>(null);

  const others = sections.filter((s) => s.id !== section.id);

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

  function run(work: () => Promise<unknown>) {
    setError(null);
    startTransition(async () => {
      try {
        await work();
        setOpen(false);
        setRenaming(false);
        setMoveTarget(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  function move(offset: number) {
    const ids = sections.map((s) => s.id);
    const to = index + offset;
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    next.splice(to, 0, next.splice(index, 1)[0]);
    run(() => reorderSectionsAction(next));
  }

  function startDelete() {
    setError(null);
    startTransition(async () => {
      const count = await countCardsInSectionAction(section.id);
      if (count === 0) {
        await deleteSectionAction(section.id);
        setOpen(false);
        return;
      }
      if (others.length === 0) {
        setError("No other section to move cards to.");
        return;
      }
      setMoveTarget(others[0].id);
    });
  }

  if (renaming) {
    return (
      <form
        className="flex items-center gap-1"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          run(() => updateSectionAction(section.id, trimmed));
        }}
      >
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`${INPUT} w-32 py-0.5 text-xs`}
        />
        <button type="submit" disabled={pending} className={`${BUTTON_PRIMARY} px-2 py-0.5 text-xs`}>
          Save
        </button>
        <button
          type="button"
          onClick={() => {
            setRenaming(false);
            setName(section.name);
          }}
          className={`rounded-lg px-2 py-0.5 text-xs text-neutral-500 dark:text-neutral-400 ${FOCUS}`}
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
        className={`rounded-md px-1 text-xs text-neutral-500 hover:text-brand-700 dark:text-neutral-400 dark:hover:text-brand-400 ${FOCUS}`}
      >
        ⋯
      </button>
      {open && (
        <span className="absolute left-0 top-6 z-30 flex w-56 flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-2 text-xs shadow-md dark:border-neutral-800 dark:bg-neutral-900">
          {moveTarget === null ? (
            <>
              <button type="button" className={ITEM} onClick={() => setRenaming(true)}>
                Rename
              </button>
              <button
                type="button"
                className={ITEM}
                disabled={index === 0 || pending}
                onClick={() => move(-1)}
              >
                Move up
              </button>
              <button
                type="button"
                className={ITEM}
                disabled={index === sections.length - 1 || pending}
                onClick={() => move(1)}
              >
                Move down
              </button>
              <button
                type="button"
                className={`${ITEM} text-red-600 dark:text-red-400`}
                disabled={pending}
                onClick={startDelete}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <span className="px-2 text-neutral-500 dark:text-neutral-400">Move its cards to:</span>
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
                className={`${ITEM} text-red-600 dark:text-red-400`}
                disabled={pending}
                onClick={() => run(() => deleteSectionWithMoveAction(section.id, moveTarget))}
              >
                Move and delete
              </button>
              <button type="button" className={ITEM} onClick={() => setMoveTarget(null)}>
                Cancel
              </button>
            </>
          )}
          {error && <span className="px-2 text-red-600 dark:text-red-400">{error}</span>}
        </span>
      )}
    </span>
  );
}
