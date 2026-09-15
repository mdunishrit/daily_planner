"use client";

import { useState, useTransition } from "react";
import { createSectionAction } from "@/app/actions/sections";
import { useFilters } from "@/lib/useFilters";
import SectionMenu from "./SectionMenu";
import { BUTTON_PRIMARY, CHIP, CHIP_ON, FOCUS, INPUT } from "./ui";
import type { Section } from "@/lib/types";

/** Section chip strip: click a chip to filter, hover it for the rename/reorder/delete menu. */
export default function SectionManager({ sections }: { sections: Section[] }) {
  const filters = useFilters();
  const current = filters.get("section");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => filters.set("section", "")}
        className={current === "" ? CHIP_ON : CHIP}
      >
        All sections
      </button>

      {sections.map((section, index) => (
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
          <span className="invisible group-hover:visible group-focus-within:visible">
            <SectionMenu section={section} sections={sections} index={index} />
          </span>
        </span>
      ))}

      <AddSection />
    </div>
  );
}

function AddSection() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
        setError(null);
        startTransition(async () => {
          try {
            await createSectionAction(trimmed);
            setName("");
            setOpen(false);
          } catch (e) {
            setError((e as Error).message);
          }
        });
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
      <button type="submit" disabled={pending} className={`${BUTTON_PRIMARY} py-1 text-xs`}>
        Add
      </button>
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </form>
  );
}
