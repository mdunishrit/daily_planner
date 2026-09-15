"use client";

import { useFilters } from "@/lib/useFilters";
import { CHIP, CHIP_ON, FOCUS, PRIORITY_LABEL } from "./ui";
import type { Person } from "@/lib/types";

const PRIORITIES = ["high", "normal", "low"] as const;

/** Filter pills for person, priority, Today and archived. All state lives in the URL. */
export default function FilterBar({ people }: { people: Person[] }) {
  const filters = useFilters();
  const priority = filters.get("priority");

  return (
    <div data-slot="filter-bar" className="flex flex-wrap items-center gap-2">
      <select
        value={filters.get("person")}
        onChange={(e) => filters.set("person", e.target.value)}
        aria-label="Filter by person"
        className={`rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 ${FOCUS}`}
      >
        <option value="">All people</option>
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>

      {PRIORITIES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => filters.toggle("priority", value)}
          className={priority === value ? CHIP_ON : CHIP}
        >
          {PRIORITY_LABEL[value]}
        </button>
      ))}

      <button
        type="button"
        onClick={() => filters.toggle("today", "1")}
        className={filters.get("today") === "1" ? CHIP_ON : CHIP}
      >
        Today
      </button>

      <button
        type="button"
        onClick={() => filters.toggle("archived", "1")}
        className={filters.get("archived") === "1" ? CHIP_ON : CHIP}
      >
        Show archived
      </button>

      <button
        type="button"
        onClick={filters.clear}
        disabled={!filters.active}
        className={`rounded-lg px-2 py-1 text-xs text-neutral-500 transition-colors duration-150 hover:text-brand-700 disabled:opacity-40 dark:text-neutral-400 dark:hover:text-brand-400 ${FOCUS}`}
      >
        Clear
      </button>
    </div>
  );
}
