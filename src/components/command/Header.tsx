"use client";

import { useState, type RefObject } from "react";
import type { BoardFilters } from "./types";

export type HeaderProps = {
  crumb: string;
  filters: BoardFilters;
  active: boolean;
  searchRef: RefObject<HTMLInputElement>;
  onSet: (key: keyof BoardFilters, value: string | boolean | undefined) => void;
  onClear: () => void;
  onAdd: (title: string) => void;
};

const T = "transition-all duration-150";

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Sticky top bar: breadcrumb, search, board/list switch, clear filters, and quick add. */
export default function Header({
  crumb,
  filters,
  active,
  searchRef,
  onSet,
  onClear,
  onAdd,
}: HeaderProps) {
  const [title, setTitle] = useState("");

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/90 px-6 backdrop-blur">
      <span className="hidden shrink-0 text-[13px] text-muted sm:block">
        Board <span className="px-1 opacity-50">/</span>
        <span className="text-ink">{crumb}</span>
      </span>

      <label className={`ml-auto flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-muted ${T} focus-within:border-accent sm:max-w-xs`}>
        <IconSearch />
        <input
          ref={searchRef}
          value={filters.q}
          onChange={(event) => onSet("q", event.target.value)}
          placeholder="Search cards and people"
          aria-label="Search cards and people"
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
        />
        <span className="hidden rounded border border-line px-1 text-[10px] sm:block">/</span>
      </label>

      <div className="flex shrink-0 rounded-lg border border-line p-0.5">
        {(["board", "list"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSet("view", value)}
            aria-pressed={filters.view === value}
            className={`rounded-md px-3 py-1 text-[12px] capitalize ${T} ${
              filters.view === value ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {active && (
        <button
          type="button"
          onClick={onClear}
          className={`shrink-0 rounded-lg border border-line px-2.5 py-1 text-[12px] text-muted ${T} hover:border-accent hover:text-accent`}
        >
          Clear filters
        </button>
      )}

      <form
        className="flex min-w-0 flex-1 items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = title.trim();
          if (!trimmed) return;
          onAdd(trimmed);
          setTitle("");
        }}
      >
        <span className="shrink-0 text-muted">
          <IconPlus />
        </span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a card… press Enter"
          aria-label="Add a card"
          className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-[13px] text-ink outline-none placeholder:text-muted ${T} hover:border-line focus:border-accent`}
        />
      </form>
    </header>
  );
}
