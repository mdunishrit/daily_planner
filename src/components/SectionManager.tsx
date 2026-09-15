"use client";

import { useEffect, useState, useTransition } from "react";
import { createSectionAction } from "@/app/actions/sections";
import { useFilters } from "@/lib/useFilters";
import SectionMenu from "./SectionMenu";
import { BUTTON_PRIMARY, CHIP, CHIP_ON, FOCUS, INPUT } from "./ui";
import type { Section } from "@/lib/types";

export type ApplySections = (next: Section[], work: () => Promise<unknown>) => void;

/** Section chip strip: click a chip to filter, hover it for the rename/reorder/delete menu. */
export default function SectionManager({
  sections,
  cardCounts,
}: {
  sections: Section[];
  cardCounts: Record<string, number>;
}) {
  const filters = useFilters();
  const current = filters.get("section");
  const [local, setLocal] = useState(sections);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocal(sections);
  }, [sections]);

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => filters.set("section", "")}
        className={current === "" ? CHIP_ON : CHIP}
      >
        All sections
      </button>

      {local.map((section, index) => (
        <span
          key={section.id}
          className="group flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 transition-colors duration-150 hover:border-brand-500 dark:border-neutral-800"
        >
          <button
            type="button"
            onClick={() => filters.toggle("section", section.id)}
            className={`text-xs ${FOCUS} ${
              current === section.id
                ? "font-medium text-brand-700 dark:text-brand-400"
                : "text-neutral-600 hover:text-brand-700 dark:text-neutral-400 dark:hover:text-brand-400"
            }`}
          >
            {section.name}
          </button>
          {!section.id.startsWith("temp-") && (
            <span className="invisible group-hover:visible group-focus-within:visible">
              <SectionMenu
                section={section}
                sections={local}
                index={index}
                cardCount={cardCounts[section.id] ?? 0}
                apply={apply}
              />
            </span>
          )}
        </span>
      ))}

      <AddSection
        onAdd={(name) => {
          const temp: Section = {
            id: `temp-${Date.now()}`,
            name,
            position: local.length,
            created_at: new Date().toISOString(),
          };
          apply([...local, temp], () => createSectionAction(name));
        }}
      />
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
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
        className={`rounded-lg px-2 py-1 text-xs text-neutral-500 transition-colors duration-150 hover:text-brand-700 dark:text-neutral-400 dark:hover:text-brand-400 ${FOCUS}`}
      >
        + Section
      </button>
    );
  }

  return (
    <form
      className="flex items-center gap-2"
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
        className={`${INPUT} w-40 py-1 text-xs`}
      />
      <button type="submit" className={`${BUTTON_PRIMARY} py-1 text-xs`}>
        Add
      </button>
    </form>
  );
}
