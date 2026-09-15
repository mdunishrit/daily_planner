"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Status } from "@/lib/types";

export const groupDroppableId = (status: Status) => `group:${status}`;

export type ListGroupHeaderProps = {
  status: Status;
  label: string;
  dot: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
};

/** Collapsible status header for the list view; also a drop target that changes status. */
export default function ListGroupHeader({
  status,
  label,
  dot,
  count,
  collapsed,
  onToggle,
}: ListGroupHeaderProps) {
  const { setNodeRef, isOver } = useDroppable({ id: groupDroppableId(status) });

  return (
    <button
      type="button"
      ref={setNodeRef}
      onClick={onToggle}
      aria-expanded={!collapsed}
      className={`mb-2 flex w-full items-center gap-2 border-b px-1 pb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-muted transition-all duration-150 ${
        isOver ? "border-accent bg-accent-soft text-accent" : "border-line hover:text-ink"
      }`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        aria-hidden="true"
        className={`transition-transform duration-150 ${collapsed ? "-rotate-90" : ""}`}
      >
        <path d="m5 9 7 7 7-7" />
      </svg>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
      <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[11px] tabular-nums normal-case tracking-normal">
        {count}
      </span>
    </button>
  );
}
