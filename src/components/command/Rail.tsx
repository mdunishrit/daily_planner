"use client";

import Link from "next/link";
import ThemeToggle from "../ThemeToggle";
import type { BoardFilters } from "./types";

export type RailProps = {
  navOpen: boolean;
  onToggleNav: () => void;
  filters: BoardFilters;
};

const T = "transition-all duration-150";
const ITEM = `rounded-lg p-2 ${T}`;
const ON = "bg-accent-soft text-accent";
const OFF = "text-muted hover:bg-accent-soft hover:text-accent";

function IconBoard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16M15 4v16" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M17 20a6 6 0 0 0-2-4.5" />
    </svg>
  );
}

function IconPanel() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  );
}

/** Left icon rail: 56px wide, app mark, board home, People link, navigator toggle, theme toggle. */
export default function Rail({ navOpen, onToggleNav, filters }: RailProps) {
  const home = !filters.person && !filters.section && !filters.priority && !filters.today;
  return (
    <nav
      aria-label="Main"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-4"
    >
      <span className="mb-4 flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
        D
      </span>
      <Link href="/" aria-label="Board" title="Board" className={`${ITEM} ${home ? ON : OFF}`}>
        <IconBoard />
      </Link>
      <Link href="/people" aria-label="People" title="People" className={`${ITEM} ${OFF}`}>
        <IconPeople />
      </Link>
      <button
        type="button"
        onClick={onToggleNav}
        aria-label="Toggle navigator"
        aria-pressed={navOpen}
        title="Toggle navigator  [ "
        className={`${ITEM} ${navOpen ? ON : OFF}`}
      >
        <IconPanel />
      </button>
      <span className="mt-auto">
        <ThemeToggle />
      </span>
    </nav>
  );
}
